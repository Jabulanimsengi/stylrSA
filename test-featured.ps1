Write-Host "Testing Featured Salons Endpoint..." -ForegroundColor Cyan
Write-Host ""

# Test if backend is running
Write-Host "Checking if backend is running..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/api/salons/featured" -UseBasicParsing -TimeoutSec 5
    Write-Host "✅ Backend is responding!" -ForegroundColor Green
    Write-Host "Status: $($response.StatusCode)" -ForegroundColor Cyan
    
    $data = $response.Content | ConvertFrom-Json
    $count = if ($data -is [array]) { $data.Length } else { 1 }
    
    Write-Host "Featured salons count: $count" -ForegroundColor Cyan
    
    if ($count -eq 0) {
        Write-Host ""
        Write-Host "No salons are featured yet (this is normal)" -ForegroundColor Blue
        Write-Host "To feature salons:" -ForegroundColor Blue
        Write-Host "1. Go to http://localhost:3000/admin" -ForegroundColor Blue
        Write-Host "2. Click 'Featured Salons' tab" -ForegroundColor Blue
        Write-Host "3. Feature an approved salon" -ForegroundColor Blue
    }
}
catch {
    Write-Host "❌ Failed to connect to backend" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Solutions:" -ForegroundColor Yellow
    Write-Host "1. Make sure backend is running: cd backend && npm run start:dev" -ForegroundColor White
    Write-Host "2. If backend is running, restart it to load the new route" -ForegroundColor White
}

Write-Host ""
Write-Host "Done!" -ForegroundColor Cyan
