# Fix: Users Can't Login - 500 Internal Server Error

## Issue Found
The backend login endpoint (`/api/auth/login`) is returning **500 Internal Server Error**

## Root Causes (Possible)

### 1. Backend Server Needs Restart
The backend might still be running with old configuration before we added `PORT=5000`

### 2. CORS Not Configured for localhost:3001
The backend might not allow requests from `http://localhost:3001`

### 3. Database Connection Issue
The PostgreSQL database might be unreachable or credentials expired

### 4. Missing CORS_ORIGIN Environment Variable
Backend `main.ts` reads `process.env.CORS_ORIGIN` but it's not set in `.env`

## Solutions

### Solution 1: Add CORS Configuration to .env (RECOMMENDED)

Add this line to `backend/.env`:
```env
CORS_ORIGIN=http://localhost:3001,http://localhost:3000
```

Then restart the backend server.

### Solution 2: Restart Backend Server

**Kill the current backend process:**
```powershell
# Find the process ID using port 5000
netstat -ano | findstr ":5000"

# Kill it (replace PID with the actual ID)
Stop-Process -Id <PID> -Force
```

**Start fresh:**
```powershell
cd C:\Users\ramos\all_coding\hairprosdirectory\backend
Remove-Item -Recurse -Force dist -ErrorAction SilentlyContinue
npm run start:dev
```

### Solution 3: Check Backend Terminal for Errors

Look at your backend terminal window for error messages like:
- `Error: connect ECONNREFUSED` (database connection failed)
- `PrismaClientInitializationError` (Prisma not initialized)
- `JwtModule` errors (JWT configuration issue)

### Solution 4: Test Database Connection

```powershell
cd C:\Users\ramos\all_coding\hairprosdirectory\backend
npx prisma db pull
```

If this fails, your database connection is broken.

## Quick Fix Script

Run this to fix CORS and restart:

```powershell
# Navigate to backend
cd C:\Users\ramos\all_coding\hairprosdirectory\backend

# Add CORS_ORIGIN if not exists
if (-not (Select-String -Path ".env" -Pattern "CORS_ORIGIN" -Quiet)) {
    Add-Content -Path ".env" -Value "`nCORS_ORIGIN=http://localhost:3001,http://localhost:3000"
    Write-Host "✓ Added CORS_ORIGIN to .env" -ForegroundColor Green
}

# Kill backend process
$backendPid = (netstat -ano | findstr ":5000" | findstr "LISTENING" | ForEach-Object { $_ -split '\s+' } | Select-Object -Last 1)
if ($backendPid) {
    Stop-Process -Id $backendPid -Force
    Write-Host "✓ Stopped old backend process" -ForegroundColor Green
}

# Wait
Start-Sleep -Seconds 3

# Clean build
Remove-Item -Recurse -Force dist -ErrorAction SilentlyContinue
Write-Host "✓ Cleaned dist folder" -ForegroundColor Green

# Start fresh
Write-Host "`nStarting backend..." -ForegroundColor Cyan
npm run start:dev
```

## Verification Steps

After restarting backend:

### 1. Test Auth Status
```powershell
Invoke-WebRequest -Uri "http://localhost:5000/api/auth/status" -UseBasicParsing
```
**Expected:** 401 Unauthorized (correct - no auth token)

### 2. Test Login Endpoint (with wrong credentials)
```powershell
$body = @{ email = "test@test.com"; password = "test123" } | ConvertTo-Json
Invoke-WebRequest -Uri "http://localhost:5000/api/auth/login" -Method POST -Body $body -ContentType "application/json" -UseBasicParsing
```
**Expected:** 401 Unauthorized or 400 Bad Request (NOT 500!)

### 3. Test CORS
```powershell
Invoke-WebRequest -Uri "http://localhost:5000/api/auth/status" -Headers @{"Origin"="http://localhost:3001"} -Method OPTIONS -UseBasicParsing
```
**Expected:** 200 OK with CORS headers

### 4. Test Login from Frontend
1. Open http://localhost:3001
2. Click "Sign In"
3. Try logging in with valid credentials
4. Should work now!

## If Still Not Working

### Check Backend Logs
Look for these errors in the backend terminal:

**Database Connection Error:**
```
Error: P1001: Can't reach database server
```
**Solution:** Check DATABASE_URL, verify database is online

**Prisma Client Error:**
```
PrismaClient is unable to be run in the browser
```
**Solution:** Regenerate Prisma client
```powershell
cd backend
npx prisma generate
```

**JWT Module Error:**
```
Nest can't resolve dependencies of the JwtModule
```
**Solution:** Check JWT_SECRET is set in .env

### Enable Debug Logging

Add to `backend/.env`:
```env
LOG_LEVEL=debug
```

Restart backend and check detailed logs.

## Prevention

To avoid this in the future:

1. Always set CORS_ORIGIN in development .env
2. Test auth endpoints after any config changes
3. Keep backend terminal visible to see errors
4. Use the dev scripts in START_DEV_SERVERS.md
