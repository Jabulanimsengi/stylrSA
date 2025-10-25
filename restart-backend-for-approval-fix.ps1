Write-Host "Restarting Backend to Apply Admin Media Approval Fixes..." -ForegroundColor Cyan
Write-Host ""

# Find and stop backend process on port 3000
Write-Host "Finding backend process on port 3000..." -ForegroundColor Yellow
$process = Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1

if ($process) {
    $pid = $process.OwningProcess
    Write-Host "Stopping backend process (PID: $pid)..." -ForegroundColor Yellow
    Stop-Process -Id $pid -Force
    Start-Sleep -Seconds 2
    Write-Host "Backend stopped successfully!" -ForegroundColor Green
} else {
    Write-Host "No backend process found on port 3000" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Starting backend server..." -ForegroundColor Yellow
Set-Location -Path "$PSScriptRoot\backend"

# Start backend in a new window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run start:dev"

Write-Host ""
Write-Host "Backend is starting in a new window..." -ForegroundColor Green
Write-Host "Please wait for the message: 'Application is running on: http://[::]:3000'" -ForegroundColor Cyan
Write-Host ""
Write-Host "Changes applied:" -ForegroundColor Magenta
Write-Host "  ✓ Fixed video embedding (Vimeo player URLs)" -ForegroundColor White
Write-Host "  ✓ Updated admin UI with purple theme" -ForegroundColor White
Write-Host "  ✓ Improved approval/rejection workflow" -ForegroundColor White
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Wait for backend to fully start" -ForegroundColor White
Write-Host "  2. Login as admin at http://localhost:3001/admin" -ForegroundColor White
Write-Host "  3. Test the Before/After Photos and Videos approval" -ForegroundColor White
Write-Host ""
Write-Host "See ADMIN_MEDIA_APPROVAL_FIX.md for detailed documentation" -ForegroundColor Cyan
