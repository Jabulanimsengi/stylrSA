# Restart Backend with Prisma Regeneration
Write-Host "Stopping backend server..." -ForegroundColor Yellow

# Kill all Node.js processes (be careful if you have other Node apps running)
$nodeProcesses = Get-Process -Name node -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    $nodeProcesses | Stop-Process -Force
    Write-Host "Stopped $($nodeProcesses.Count) Node.js process(es)" -ForegroundColor Green
    Start-Sleep -Seconds 2
} else {
    Write-Host "No Node.js processes found" -ForegroundColor Gray
}

# Navigate to backend directory
Set-Location "C:\Users\ramos\all_coding\hairprosdirectory\backend"

# Regenerate Prisma client
Write-Host "`nRegenerating Prisma client..." -ForegroundColor Yellow
npx prisma generate

if ($LASTEXITCODE -eq 0) {
    Write-Host "Prisma client generated successfully!" -ForegroundColor Green
} else {
    Write-Host "Failed to generate Prisma client. Exit code: $LASTEXITCODE" -ForegroundColor Red
    exit 1
}

# Start the backend server
Write-Host "`nStarting backend server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'C:\Users\ramos\all_coding\hairprosdirectory\backend'; npm run start:dev"

Write-Host "`nBackend restart initiated!" -ForegroundColor Green
Write-Host "Check the new PowerShell window for backend logs." -ForegroundColor Cyan
