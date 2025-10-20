# Force Backend Restart Script

Write-Host "🔴 Stopping all Node processes..." -ForegroundColor Red
Stop-Process -Name "node" -Force -ErrorAction SilentlyContinue

Start-Sleep -Seconds 2

Write-Host "✅ All Node processes stopped" -ForegroundColor Green
Write-Host ""
Write-Host "📁 Changing to backend directory..." -ForegroundColor Yellow
Set-Location "C:\Users\ramos\all_coding\hairprosdirectory\backend"

Write-Host "🧹 Cleaning dist folder..." -ForegroundColor Yellow
if (Test-Path "dist") {
    Remove-Item -Recurse -Force "dist"
    Write-Host "✅ Dist folder cleaned" -ForegroundColor Green
} else {
    Write-Host "⚠️  No dist folder found" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🔨 Building backend..." -ForegroundColor Yellow
npm run build

Write-Host ""
Write-Host "🚀 Starting backend in dev mode..." -ForegroundColor Green
Write-Host "Press Ctrl+C to stop" -ForegroundColor Yellow
Write-Host ""

npm run start:dev
