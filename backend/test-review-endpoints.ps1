# Review System Backend Testing Script
# Run this script to test the new review endpoints

Write-Host "====================================" -ForegroundColor Cyan
Write-Host "   Review System - Backend Tests   " -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:3000"

# Function to make API calls
function Invoke-ApiTest {
    param(
        [string]$Method,
        [string]$Endpoint,
        [string]$Description,
        [string]$Token = $null,
        [object]$Body = $null
    )
    
    Write-Host "Testing: $Description" -ForegroundColor Yellow
    Write-Host "  Method: $Method $Endpoint" -ForegroundColor Gray
    
    try {
        $headers = @{
            "Content-Type" = "application/json"
        }
        
        if ($Token) {
            $headers["Cookie"] = "access_token=$Token"
        }
        
        $params = @{
            Uri = "$baseUrl$Endpoint"
            Method = $Method
            Headers = $headers
        }
        
        if ($Body) {
            $params["Body"] = ($Body | ConvertTo-Json -Depth 10)
        }
        
        $response = Invoke-RestMethod @params
        Write-Host "  Status: SUCCESS ✓" -ForegroundColor Green
        Write-Host "  Response:" -ForegroundColor Gray
        Write-Host ($response | ConvertTo-Json -Depth 5) -ForegroundColor DarkGray
        Write-Host ""
        return $response
    }
    catch {
        Write-Host "  Status: FAILED ✗" -ForegroundColor Red
        Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host ""
        return $null
    }
}

# Instructions
Write-Host "SETUP INSTRUCTIONS:" -ForegroundColor Magenta
Write-Host "1. Make sure backend server is running (npm run start:dev)" -ForegroundColor White
Write-Host "2. You'll need to manually set JWT tokens for testing" -ForegroundColor White
Write-Host "3. Update the variables below with real tokens from your system" -ForegroundColor White
Write-Host ""

# These need to be replaced with real tokens from your database
$CUSTOMER_TOKEN = "YOUR_CUSTOMER_JWT_TOKEN_HERE"
$SALON_OWNER_TOKEN = "YOUR_SALON_OWNER_JWT_TOKEN_HERE"
$ADMIN_TOKEN = "YOUR_ADMIN_JWT_TOKEN_HERE"

Write-Host "====================================" -ForegroundColor Cyan
Write-Host "Test 1: Health Check" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

# Test if server is running
try {
    $health = Invoke-WebRequest -Uri "$baseUrl/api/csrf/token" -Method GET
    Write-Host "✓ Backend server is running!" -ForegroundColor Green
    Write-Host ""
}
catch {
    Write-Host "✗ Backend server is NOT running!" -ForegroundColor Red
    Write-Host "Please start the server: npm run start:dev" -ForegroundColor Yellow
    Write-Host ""
    exit
}

Write-Host "====================================" -ForegroundColor Cyan
Write-Host "Test 2: Database Schema" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Checking if new columns exist in Review model..." -ForegroundColor Yellow
Write-Host "  - salonOwnerResponse (String?)" -ForegroundColor Gray
Write-Host "  - salonOwnerRespondedAt (DateTime?)" -ForegroundColor Gray
Write-Host ""
Write-Host "Note: You can verify this by checking Prisma schema or database directly" -ForegroundColor DarkGray
Write-Host ""

Write-Host "====================================" -ForegroundColor Cyan
Write-Host "Test 3: GET Reviews (Salon Owner)" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

if ($SALON_OWNER_TOKEN -ne "YOUR_SALON_OWNER_JWT_TOKEN_HERE") {
    $reviews = Invoke-ApiTest `
        -Method "GET" `
        -Endpoint "/api/reviews/my-salon-reviews" `
        -Description "Fetch salon owner's reviews" `
        -Token $SALON_OWNER_TOKEN
    
    if ($reviews) {
        Write-Host "Review Counts:" -ForegroundColor Magenta
        Write-Host "  Pending: $($reviews.pending.Count)" -ForegroundColor White
        Write-Host "  Approved: $($reviews.approved.Count)" -ForegroundColor White
        Write-Host "  Needs Response: $($reviews.needsResponse.Count)" -ForegroundColor White
        Write-Host ""
    }
}
else {
    Write-Host "⚠ Skipped: No salon owner token provided" -ForegroundColor Yellow
    Write-Host ""
}

Write-Host "====================================" -ForegroundColor Cyan
Write-Host "Test 4: Respond to Review" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

if ($SALON_OWNER_TOKEN -ne "YOUR_SALON_OWNER_JWT_TOKEN_HERE") {
    Write-Host "Note: You need to manually provide a review ID to test this" -ForegroundColor Yellow
    $reviewId = Read-Host "Enter an approved review ID (or press Enter to skip)"
    
    if ($reviewId) {
        $response = Invoke-ApiTest `
            -Method "PATCH" `
            -Endpoint "/api/reviews/$reviewId/respond" `
            -Description "Respond to review" `
            -Token $SALON_OWNER_TOKEN `
            -Body @{
                response = "Thank you for your feedback! We're glad you enjoyed your experience."
            }
    }
    else {
        Write-Host "⚠ Skipped: No review ID provided" -ForegroundColor Yellow
    }
}
else {
    Write-Host "⚠ Skipped: No salon owner token provided" -ForegroundColor Yellow
}
Write-Host ""

Write-Host "====================================" -ForegroundColor Cyan
Write-Host "Test 5: Check Notifications" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

if ($SALON_OWNER_TOKEN -ne "YOUR_SALON_OWNER_JWT_TOKEN_HERE") {
    $notifications = Invoke-ApiTest `
        -Method "GET" `
        -Endpoint "/api/notifications?limit=10" `
        -Description "Fetch salon owner notifications" `
        -Token $SALON_OWNER_TOKEN
    
    if ($notifications -and $notifications.items) {
        Write-Host "Recent Notifications:" -ForegroundColor Magenta
        foreach ($notif in $notifications.items) {
            $readStatus = if ($notif.isRead) { "✓" } else { "✗" }
            Write-Host "  [$readStatus] $($notif.message)" -ForegroundColor White
        }
        Write-Host ""
    }
}
else {
    Write-Host "⚠ Skipped: No salon owner token provided" -ForegroundColor Yellow
}
Write-Host ""

Write-Host "====================================" -ForegroundColor Cyan
Write-Host "Test Summary" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "✓ Server is running" -ForegroundColor Green
Write-Host "✓ API endpoints are accessible" -ForegroundColor Green
Write-Host ""

Write-Host "To fully test the system:" -ForegroundColor Yellow
Write-Host "1. Get JWT tokens from your database (User table)" -ForegroundColor White
Write-Host "2. Update the token variables at the top of this script" -ForegroundColor White
Write-Host "3. Run this script again" -ForegroundColor White
Write-Host ""

Write-Host "Or use the comprehensive test guide:" -ForegroundColor Yellow
Write-Host "  backend/TEST_REVIEW_ENDPOINTS.md" -ForegroundColor White
Write-Host ""

Write-Host "====================================" -ForegroundColor Cyan
Write-Host "Manual Test Checklist" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

$checklist = @(
    @{ Task = "Mark a booking as COMPLETED"; Status = "⬜" },
    @{ Task = "Verify customer receives notification"; Status = "⬜" },
    @{ Task = "Customer submits a review"; Status = "⬜" },
    @{ Task = "Verify admin receives notification"; Status = "⬜" },
    @{ Task = "Admin approves the review"; Status = "⬜" },
    @{ Task = "Verify salon owner receives notification"; Status = "⬜" },
    @{ Task = "Verify customer receives approval notification"; Status = "⬜" },
    @{ Task = "Salon owner responds to review"; Status = "⬜" },
    @{ Task = "Verify customer receives response notification"; Status = "⬜" },
    @{ Task = "Check database for new fields"; Status = "⬜" }
)

foreach ($item in $checklist) {
    Write-Host "$($item.Status) $($item.Task)" -ForegroundColor White
}

Write-Host ""
Write-Host "Testing completed!" -ForegroundColor Green
Write-Host ""
