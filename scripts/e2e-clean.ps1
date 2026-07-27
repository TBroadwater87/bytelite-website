# Ensures the Playwright port (4321) is not silently occupied by a stale preview
# server before running e2e tests. Terminates ONLY a process verifiably owned by
# this repository (bytelite-website astro preview). Aborts instead of guessing if
# the port is held by anything else - never touches processes from other projects.
#
# Usage: powershell -NoProfile -ExecutionPolicy Bypass -File ./scripts/e2e-clean.ps1 [playwright args...]

$ErrorActionPreference = 'Stop'
$port = 4321
$repoMarker = 'bytelite-website'

$conn = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
if ($conn) {
    $ownerPid = $conn[0].OwningProcess
    $proc = Get-CimInstance Win32_Process -Filter "ProcessId = $ownerPid" -ErrorAction SilentlyContinue

    if ($null -eq $proc) {
        Write-Error "Port $port is occupied by PID $ownerPid but its process info could not be read. Refusing to guess - aborting."
        exit 1
    }

    $cmd = $proc.CommandLine
    if ($cmd -and $cmd.ToLower().Contains($repoMarker) -and $cmd.ToLower().Contains('preview')) {
        Write-Host "Port $port is held by a stale $repoMarker preview server (PID $ownerPid). Terminating it."
        Write-Host "  CommandLine: $cmd"
        Stop-Process -Id $ownerPid -Force
        Start-Sleep -Milliseconds 500
    } else {
        Write-Error "Port $port is occupied by PID $ownerPid, whose command line does not identify it as a $repoMarker preview server:`n  $cmd`nThis may belong to another project. Refusing to terminate it - aborting."
        exit 1
    }
} else {
    Write-Host "Port $port is clear."
}

Write-Host "Handing off to Playwright (fresh build + preview start, verified-ready before tests run)."
& npx playwright test @args
exit $LASTEXITCODE
