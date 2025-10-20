Write-Host "Testing Admin Featured Salons Endpoints..." -ForegroundColor Cyan
Write-Host ""

# Test 1: GET /api/admin/salons/featured/manage
Write-Host "Test 1: Fetching featured salons management data..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/api/admin/salons/featured/manage" -UseBasicParsing -TimeoutSec 5
    Write-Host "✅ GET /api/admin/salons/featured/manage - Status: $($response.StatusCode)" -ForegroundColor Green
    
    $data = $response.Content | ConvertFrom-Json
    Write-Host "   Featured count: $($data.featured.Length)" -ForegroundColor Cyan
    Write-Host "   Available count: $($data.available.Length)" -ForegroundColor Cyan
}
catch {
    $status = if ($_.Exception.Response) { $_.Exception.Response.StatusCode.value__ } else { "N/A" }
    Write-Host "❌ GET /api/admin/salons/featured/manage - Failed" -ForegroundColor Red
    Write-Host "   Status: $status" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    
    if ($status -eq 404) {
        Write-Host ""
        Write-Host "🔧 Route not found! Backend needs restart:" -ForegroundColor Yellow
        Write-Host "   1. Stop backend (Ctrl+C)" -ForegroundColor Yellow
        Write-Host "   2. cd backend" -ForegroundColor Yellow
        Write-Host "   3. npm run start:dev" -ForegroundColor Yellow
    }
    elseif ($status -eq 401 -or $status -eq 403) {
        Write-Host ""
        Write-Host "🔒 Authentication required!" -ForegroundColor Yellow
        Write-Host "   This is expected - admin routes need authentication" -ForegroundColor Yellow
        Write-Host "   Test from browser console while logged in as admin" -ForegroundColor Yellow
    }
}
Write-Host ""

# Test 2: Check if there are any approved salons
Write-Host "Test 2: Checking for approved salons..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/api/salons/approved" -UseBasicParsing -TimeoutSec 5
    $salons = $response.Content | ConvertFrom-Json
    Write-Host "✅ Found $($salons.Length) approved salons" -ForegroundColor Green
    
    if ($salons.Length -eq 0) {
        Write-Host ""
        Write-Host "⚠️  No approved salons available to feature!" -ForegroundColor Yellow
        Write-Host "   You need at least one approved salon to test featuring" -ForegroundColor Yellow
    } else {
        Write-Host "   First salon: $($salons[0].name)" -ForegroundColor Cyan
        Write-Host "   ID: $($salons[0].id)" -ForegroundColor Cyan
    }
}
catch {
    Write-Host "❌ Failed to fetch approved salons" -ForegroundColor Red
}
Write-Host ""

Write-Host "Browser Console Test:" -ForegroundColor Yellow
Write-Host "Copy and paste this in browser console (F12) while logged in as admin:" -ForegroundColor White
Write-Host ""
Write-Host @"
// Test 1: Check featured salons management
fetch('/api/admin/salons/featured/manage', {
  credentials: 'include'
})
  .then(r => r.json())
  .then(d => console.log('Featured data:', d))
  .catch(e => console.error('Error:', e));

// Test 2: Feature a salon (replace SALON_ID with actual ID)
fetch('/api/admin/salons/SALON_ID/feature', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({ durationDays: 7 })
})
  .then(r => r.json())
  .then(d => console.log('Featured salon:', d))
  .catch(e => console.error('Error:', e));
"@ -ForegroundColor Gray

Write-Host ""
Write-Host "Done!" -ForegroundColor Cyan
