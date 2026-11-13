# Ensures the Playwright port (4321) is not silently occupied by a stale preview
# server before running e2e tests. Terminates ONLY a process verifiably owned by
# this repository (bytelite-website astro preview). Aborts instead of guessing if
# the port is held by anything else - never touches processes from other projects.
#
# Usage: powershell -NoProfile -ExecutionPolicy Bypass -File ./scripts/e2e-clean.ps1 [playwright args...]

$ErrorActionPreference = 'Stop'
$previewServerPort = 4321
$repoMarker = 'bytelite-website'

$listeningConnection = Get-NetTCPConnection -LocalPort $previewServerPort -State Listen -ErrorAction SilentlyContinue
if ($listeningConnection) {
    $ownerPid = $listeningConnection[0].OwningProcess
    $owningProcess = Get-CimInstance Win32_Process -Filter "ProcessId = $ownerPid" -ErrorAction SilentlyContinue

    if ($null -eq $owningProcess) {
        Write-Error "Port $previewServerPort is occupied by PID $ownerPid but its process info could not be read. Refusing to guess - aborting."
        exit 1
    }

    $owningCommandLine = $owningProcess.CommandLine
    if ($owningCommandLine -and $owningCommandLine.ToLower().Contains($repoMarker) -and $owningCommandLine.ToLower().Contains('preview')) {
        Write-Host "Port $previewServerPort is held by a stale $repoMarker preview server (PID $ownerPid). Terminating it."
        Write-Host "  CommandLine: $owningCommandLine"
        Stop-Process -Id $ownerPid -Force
        Start-Sleep -Milliseconds 500
    } else {
        Write-Error "Port $previewServerPort is occupied by PID $ownerPid, whose command line does not identify it as a $repoMarker preview server:`n  $owningCommandLine`nThis may belong to another project. Refusing to terminate it - aborting."
        exit 1
    }
} else {
    Write-Host "Port $previewServerPort is clear."
}

Write-Host "Handing off to Playwright (fresh build + preview start, verified-ready before tests run)."
& npx playwright test @args
exit $LASTEXITCODE
