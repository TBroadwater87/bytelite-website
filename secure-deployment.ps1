# Secure version switching with proper execution policy
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process
# Add authentication check
if (-not (Test-Path "$env:USERPROFILE\.bytelite\auth.key")) {
    Write-Error "Authentication required for deployment switching"
    exit 1
}