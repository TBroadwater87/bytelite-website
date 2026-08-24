# Set the ByteLite contact-form environment variables on the CANONICAL Vercel project.
#
# TARGET (hardcoded on purpose - see below):
#   team    ByteLite_LLC   (CLI scope slug: bytelitellc)
#   project bytelite-website
#
# WHY THE TARGET IS HARDCODED AND VERIFIED
# ----------------------------------------
# An earlier version of this script called plain `vercel link` when .vercel\project.json was
# missing, and left the choice of project to whoever was at the keyboard. That is exactly how a
# duplicate Vercel project got created during the August 2026 recovery. A missing .vercel
# directory is a fact about the laptop, never evidence that the project does not exist.
#
# So this script REFUSES to create a project. It verifies that the canonical project already
# exists in the canonical team, links to it non-interactively, and stops if anything does not
# match. Changing the constants below is a deliberate act, not an accident of a menu prompt.
#
# SECRET HANDLING
# ---------------
# No secret value is stored in this file, passed on a command line, or written to disk. Each
# value is read with -AsSecureString and handed to the Vercel CLI on stdin, then the plaintext
# copy is zeroed in this process. `vercel env add` encrypts it at rest on Vercel's side.
#
# Usage:
#   powershell -NoProfile -ExecutionPolicy Bypass -File .\Add-ByteLite-SendGrid.ps1
#   powershell -NoProfile -ExecutionPolicy Bypass -File .\Add-ByteLite-SendGrid.ps1 -Environment preview

[CmdletBinding()]
param(
    [ValidateSet('production', 'preview')]
    [string]$Environment = 'production'
)

$ErrorActionPreference = 'Stop'

# ------------------------------------------------------------------------------------------
# Canonical target. Verified 2026-08-24. See OWNER_README.md section 2.
# ------------------------------------------------------------------------------------------
$WebsiteRoot   = 'D:\bytelite-website'
$VercelScope   = 'bytelitellc'
$VercelProject = 'bytelite-website'
$ExpectedOrgId = 'team_LjWPr2MnAsCrv6U1ddGy8BSh'
$ExpectedPrjId = 'prj_XmNkNFp156U94VveZgoPuMHPfW6u'

# Variable NAMES only. Values are never written here.
$RequiredVariables = @(
    @{ Name = 'SENDGRID_API_KEY';   Hint = 'SendGrid v3 API key' },
    @{ Name = 'CONTACT_TO_EMAIL';   Hint = 'delivery recipient, e.g. tash@thebytelite.com' },
    @{ Name = 'CONTACT_FROM_EMAIL'; Hint = 'verified SendGrid sender, e.g. noreply@thebytelite.com' }
)

Write-Host ''
Write-Host 'ByteLite contact-form environment setup'
Write-Host '---------------------------------------'
Write-Host ("  team        : {0}" -f $VercelScope)
Write-Host ("  project     : {0}" -f $VercelProject)
Write-Host ("  environment : {0}" -f $Environment)
Write-Host ''

# ------------------------------------------------------------------------------------------
# Preconditions.
# ------------------------------------------------------------------------------------------
if (-not (Test-Path $WebsiteRoot)) {
    throw "Website folder does not exist: $WebsiteRoot"
}
Set-Location $WebsiteRoot

if (-not (Get-Command vercel -ErrorAction SilentlyContinue)) {
    throw 'Vercel CLI is not installed or not on PATH. Install it with: npm i -g vercel'
}

Write-Host 'Vercel CLI version:'
& vercel --version
Write-Host ''

Write-Host 'Authenticated as:'
& vercel whoami
if ($LASTEXITCODE -ne 0) { throw 'Not logged in to Vercel. Run: vercel login' }
Write-Host ''

# ------------------------------------------------------------------------------------------
# Confirm the canonical project EXISTS before touching anything. Never create one.
# ------------------------------------------------------------------------------------------
Write-Host ("Verifying that {0}/{1} already exists..." -f $VercelScope, $VercelProject)
& vercel project inspect $VercelProject --scope $VercelScope
if ($LASTEXITCODE -ne 0) {
    Write-Host ''
    Write-Host 'The canonical project was not found under the canonical team.'
    Write-Host 'STOP. Do NOT create a new project. Investigate first:'
    Write-Host '    vercel teams ls'
    Write-Host ("    vercel project ls --scope {0}" -f $VercelScope)
    Write-Host 'See OWNER_README.md section 6 (Vercel Project Recovery).'
    throw 'Canonical Vercel project not found. Refusing to guess or create one.'
}
Write-Host ''

# ------------------------------------------------------------------------------------------
# Link this directory to that exact project, non-interactively. No menu, no chance to pick
# the wrong one, no chance to create a new one.
# ------------------------------------------------------------------------------------------
$VercelProjectFile = Join-Path $WebsiteRoot '.vercel\project.json'

if (-not (Test-Path $VercelProjectFile)) {
    Write-Host 'No local .vercel link found. Linking to the canonical project (never creating one).'
    & vercel link --yes --scope $VercelScope --project $VercelProject
    if ($LASTEXITCODE -ne 0) { throw 'Vercel project linking failed.' }
    if (-not (Test-Path $VercelProjectFile)) {
        throw "vercel link reported success but $VercelProjectFile was not created."
    }
}

# Identifiers only - this file contains no secrets.
$link = Get-Content $VercelProjectFile -Raw | ConvertFrom-Json
Write-Host ("Linked projectId : {0}" -f $link.projectId)
Write-Host ("Linked orgId     : {0}" -f $link.orgId)

if ($link.projectId -ne $ExpectedPrjId -or $link.orgId -ne $ExpectedOrgId) {
    Write-Host ''
    Write-Host 'The local link does NOT point at the canonical project.'
    Write-Host ("  expected projectId {0}" -f $ExpectedPrjId)
    Write-Host ("  expected orgId     {0}" -f $ExpectedOrgId)
    Write-Host 'Delete the .vercel directory and re-run, or correct the constants in this script'
    Write-Host 'if the canonical project has genuinely changed. See OWNER_README.md section 6.'
    throw 'Refusing to write environment variables to an unexpected project.'
}
Write-Host 'Link matches the canonical project.'
Write-Host ''

# ------------------------------------------------------------------------------------------
# Collect and set each value. Nothing is echoed; nothing is stored on disk.
# ------------------------------------------------------------------------------------------
Write-Host 'You will be prompted for each value. PowerShell hides what you type or paste.'
Write-Host 'Press Enter on a blank prompt to SKIP a variable that is already set correctly.'
Write-Host ''

foreach ($variable in $RequiredVariables) {

    $name = $variable.Name
    $secure = Read-Host ("{0}  ({1})" -f $name, $variable.Hint) -AsSecureString

    $bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
    try {
        $plain = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($bstr)

        if ([string]::IsNullOrWhiteSpace($plain)) {
            Write-Host ("  skipped {0}" -f $name)
            Write-Host ''
            continue
        }

        Write-Host ("  setting {0} in {1}..." -f $name, $Environment)
        $plain | & vercel env add $name $Environment --scope $VercelScope --force
        if ($LASTEXITCODE -ne 0) { throw "Vercel failed to set $name." }
        Write-Host ("  {0} set." -f $name)
        Write-Host ''
    }
    finally {
        $plain = $null
        $secure = $null
        if ($bstr -ne [IntPtr]::Zero) {
            [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr)
        }
    }
}

# ------------------------------------------------------------------------------------------
# Verify by NAME. `vercel env ls` prints names and "Encrypted", never values.
# ------------------------------------------------------------------------------------------
Write-Host 'Registered environment variables (names only, values stay encrypted):'
Write-Host ''
& vercel env ls $Environment --scope $VercelScope
if ($LASTEXITCODE -ne 0) { throw 'Could not list Vercel environment variables.' }

Write-Host ''
Write-Host '============================================'
Write-Host 'Done. No secret value was stored by this script.'
Write-Host '============================================'
Write-Host ''
Write-Host 'A NEW DEPLOYMENT IS REQUIRED before the running site can read these values.'
Write-Host 'Redeploy from the Vercel dashboard, or push a commit to main.'
Write-Host ''
Write-Host 'Then verify against the deployment (not the custom domain, until cutover):'
Write-Host '    Invoke-WebRequest -Uri "https://bytelite-website.vercel.app/api/health?cb=1" -UseBasicParsing'
Write-Host ''
Write-Host 'Expect all three names to report true. See OWNER_README.md section 8 for the'
Write-Host 'full 405 / 400 / 202 contact-route verification.'
Write-Host ''
