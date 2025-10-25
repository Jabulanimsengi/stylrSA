# Start backend and log output
$logFile = "backend-startup.log"
Write-Host "Starting backend server and logging to $logFile..." -ForegroundColor Cyan

# Clear previous log
if (Test-Path $logFile) {
    Remove-Item $logFile
}

# Start the backend and redirect output to log file
npm run start:dev 2>&1 | Tee-Object -FilePath $logFile
