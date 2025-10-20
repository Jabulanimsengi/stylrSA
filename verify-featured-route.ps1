Write-Host "Verifying Featured Route..." -ForegroundColor Cyan
Write-Host ""

try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/api/salons/featured" -UseBasicParsing -TimeoutSec 5
    
    if ($response.StatusCode -eq 200) {
        Write-Host "SUCCESS!" -ForegroundColor Green
        Write-Host "Featured route is working correctly" -ForegroundColor Green
        Write-Host "Response: $($response.Content)" -ForegroundColor Cyan
    } else {
        Write-Host "Unexpected status: $($response.StatusCode)" -ForegroundColor Yellow
    }
}
catch {
    $content = $_.ErrorDetails.Message
    
    if ($content -like "*Salon with ID featured not found*") {
        Write-Host "FAILED - Route still not loaded!" -ForegroundColor Red
        Write-Host ""
        Write-Host "The backend is treating 'featured' as a salon ID" -ForegroundColor Red
        Write-Host ""
        Write-Host "SOLUTION:" -ForegroundColor Yellow
        Write-Host "1. Stop backend (Ctrl+C)" -ForegroundColor White
        Write-Host "2. cd backend" -ForegroundColor White  
        Write-Host "3. Remove-Item dist -Recurse -Force" -ForegroundColor White
        Write-Host "4. npm run start:dev" -ForegroundColor White
        Write-Host "5. Wait for startup" -ForegroundColor White
        Write-Host "6. Run this script again" -ForegroundColor White
    } else {
        Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""
