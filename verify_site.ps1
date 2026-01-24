# ByteLite Site Verification Script (PowerShell)
# Run from D:\bytelite-website
# Usage: .\verify_site.ps1

$ErrorActionPreference = "Stop"
$failures = @()

Write-Host "=== ByteLite Site Verification ===" -ForegroundColor Cyan
Write-Host "Date: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Gray

# 1. Rebuild site
Write-Host "`n[1/6] Installing dependencies..." -ForegroundColor Yellow
$npmCiOutput = npm ci 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "npm ci FAILED:" -ForegroundColor Red
    Write-Host $npmCiOutput
    Write-Host "RESULT|fail|0|0|bytelite_site_precommit"
    exit 1
}
Write-Host "  Dependencies installed" -ForegroundColor Green

Write-Host "`n[2/6] Building site..." -ForegroundColor Yellow
$buildOutput = npm run build 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "npm run build FAILED:" -ForegroundColor Red
    Write-Host $buildOutput
    Write-Host "RESULT|fail|0|0|bytelite_site_precommit"
    exit 1
}
Write-Host "  Build complete" -ForegroundColor Green

# 2. Forbidden words check
Write-Host "`n[3/6] Checking forbidden words in dist..." -ForegroundColor Yellow
$forbiddenPatterns = @(
    @{Name="imminent"; Pattern="\bimminent\b"},
    @{Name="100% operational"; Pattern="100%.*operational"},
    @{Name="universal dictionaries complete"; Pattern="universal dictionaries.*complete"},
    @{Name="quantum compression/scale"; Pattern="quantum.*(compression|scale)"}
)

foreach ($check in $forbiddenPatterns) {
    $matches = Get-ChildItem -Path "dist" -Recurse -Filter "*.html" | Select-String -Pattern $check.Pattern -CaseSensitive:$false
    if ($matches) {
        $failures += "FORBIDDEN: Found '$($check.Name)' in $($matches.Count) location(s)"
        Write-Host "  FAIL: $($check.Name) - $($matches.Count) matches" -ForegroundColor Red
        foreach ($m in $matches) {
            Write-Host "    -> $($m.Path):$($m.LineNumber)" -ForegroundColor DarkRed
        }
    } else {
        Write-Host "  PASS: $($check.Name) - 0 matches" -ForegroundColor Green
    }
}

# 3. Hutter Prize wording check
Write-Host "`n[4/6] Checking Hutter Prize wording..." -ForegroundColor Yellow
$hutterInProgress = Get-ChildItem -Path "dist" -Recurse -Filter "*.html" | Select-String -Pattern "Hutter Prize.*[Ii]n [Pp]rogress"
if ($hutterInProgress) {
    $failures += "HUTTER: Found 'In Progress' instead of 'Planned' in $($hutterInProgress.Count) location(s)"
    Write-Host "  FAIL: Found 'In Progress' wording - should be 'Planned'" -ForegroundColor Red
    foreach ($m in $hutterInProgress) {
        Write-Host "    -> $($m.Path):$($m.LineNumber)" -ForegroundColor DarkRed
    }
} else {
    Write-Host "  PASS: All Hutter Prize references use 'Planned'" -ForegroundColor Green
}

# 4. Strict disclaimer rule (FIXED - uses relative paths, no count comparison)
Write-Host "`n[5/6] Checking strict disclaimer rule..." -ForegroundColor Yellow

$distRoot = (Resolve-Path "dist").Path
$claimPattern = "1GB|1 GB|1TB|1 TB|15 bytes|18 bytes|68,719,476"
$disclaimerAnchor = "Observed in controlled tests on the enwik9 corpus"

$htmlFiles = Get-ChildItem -Path "dist" -Recurse -Filter "*.html"
$claimPages = @()
$missingDisclaimer = @()

foreach ($file in $htmlFiles) {
    $content = Get-Content $file.FullName -Raw -Encoding UTF8
    $relPath = $file.FullName.Substring($distRoot.Length).TrimStart("\", "/")

    # Check if this page has any claim tokens
    if ($content -match $claimPattern) {
        $claimPages += $relPath

        # Check if the SAME page has the exact disclaimer anchor
        if ($content -notmatch [regex]::Escape($disclaimerAnchor)) {
            $missingDisclaimer += $relPath
        }
    }
}

if ($missingDisclaimer.Count -gt 0) {
    $failures += "DISCLAIMER: $($missingDisclaimer.Count) page(s) with claims missing exact disclaimer anchor"
    Write-Host "  FAIL: $($missingDisclaimer.Count) page(s) with claims missing disclaimer anchor" -ForegroundColor Red
    foreach ($p in $missingDisclaimer) {
        Write-Host "    -> $p" -ForegroundColor DarkRed
    }
} else {
    Write-Host "  PASS: $($claimPages.Count) pages with claims, all have exact disclaimer anchor" -ForegroundColor Green
}

# 5. No untracked files check
Write-Host "`n[6/6] Checking for untracked files..." -ForegroundColor Yellow
$gitStatus = git status --porcelain 2>&1
$untracked = $gitStatus | Where-Object { $_ -match "^\?\?" }
if ($untracked) {
    $failures += "GIT: Found $($untracked.Count) untracked file(s)"
    Write-Host "  FAIL: Found untracked files" -ForegroundColor Red
    foreach ($u in $untracked) {
        Write-Host "    -> $u" -ForegroundColor DarkRed
    }
} else {
    Write-Host "  PASS: No untracked files" -ForegroundColor Green
}

# Final summary
Write-Host "`n=== VERIFICATION SUMMARY ===" -ForegroundColor Cyan
Write-Host "Claim pages checked: $($claimPages.Count)"
Write-Host "Forbidden word checks: $($forbiddenPatterns.Count)"

if ($failures.Count -eq 0) {
    Write-Host "`nAll checks passed!" -ForegroundColor Green
    Write-Host "RESULT|pass|0|0|bytelite_site_precommit"
    exit 0
} else {
    Write-Host "`nFailures ($($failures.Count)):" -ForegroundColor Red
    foreach ($f in $failures) {
        Write-Host "  - $f" -ForegroundColor Red
    }
    Write-Host "RESULT|fail|0|0|bytelite_site_precommit"
    exit 1
}
