# Builds fresh, starts the preview server, runs the visual/console QA sweep, then stops the server.
# Note: deliberately NOT $ErrorActionPreference = 'Stop' - native tools (npm/astro/browserslist)
# write informational notices to stderr, which PowerShell would otherwise treat as terminating.
$repoRoot = Split-Path -Parent $PSScriptRoot

Set-Location $repoRoot

Write-Host "== npm run build =="
cmd.exe /c "npm run build"
if ($LASTEXITCODE -ne 0) { Write-Error "build failed with exit code $LASTEXITCODE"; exit 1 }
Write-Host "build exit code: $LASTEXITCODE"

Write-Host "== starting preview server =="
$proc = Start-Process -FilePath 'cmd.exe' -ArgumentList '/c', 'npm run preview' -PassThru -WindowStyle Hidden `
    -RedirectStandardOutput (Join-Path $repoRoot 'qa/preview-stdout.log') `
    -RedirectStandardError (Join-Path $repoRoot 'qa/preview-stderr.log')
Write-Host "Started wrapper PID $($proc.Id)"

$ready = $false
for ($i = 0; $i -lt 40; $i++) {
    Start-Sleep -Seconds 1
    try {
        $r = Invoke-WebRequest -Uri 'http://localhost:4321/' -UseBasicParsing -TimeoutSec 2
        if ($r.StatusCode -eq 200) { $ready = $true; break }
    } catch {}
}
Write-Host "Ready: $ready after $i seconds"
if (-not $ready) {
    Write-Error "preview server never became ready"
    Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
    exit 1
}

Write-Host "== running qa-sweep.mjs =="
& node "qa/qa-sweep.mjs"
$sweepExit = $LASTEXITCODE

Write-Host "== stopping preview server tree =="
# Stop-Process on the cmd.exe wrapper doesn't kill the node child it spawned; find and stop
# the actual node preview process bound to port 4321 instead.
$conn = Get-NetTCPConnection -LocalPort 4321 -State Listen -ErrorAction SilentlyContinue
if ($conn) {
    Stop-Process -Id $conn[0].OwningProcess -Force -ErrorAction SilentlyContinue
}
Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue

exit $sweepExit
