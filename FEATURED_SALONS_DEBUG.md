# Featured Salons - Debug Guide

## Issue
Getting "Failed to fetch featured salons" error on the homepage.

## Quick Diagnosis

### Step 1: Check if Backend is Running
Open a browser and go to:
```
http://localhost:5000/api/salons/featured
```

**Expected Result:**
- If working: `[]` (empty array) or `[{salon objects}]`
- If not working: Error message or "Cannot GET /api/salons/featured"

### Step 2: Check Backend Logs
Look at your backend terminal for any errors when the page loads.

**Common Issues:**
- Route not found (404)
- Authentication errors
- Database connection issues

### Step 3: Restart Backend
The new route might not be loaded. Restart the backend:

```bash
# Stop the backend (Ctrl+C in the terminal)
# Then restart:
cd backend
npm run start:dev
```

After restart, refresh the homepage and check if the error is gone.

### Step 4: Test the Endpoint Manually

#### Using Browser Console (F12):
```javascript
fetch('http://localhost:5000/api/salons/featured', {
  credentials: 'include'
})
  .then(r => r.json())
  .then(data => console.log('Featured salons:', data))
  .catch(err => console.error('Error:', err));
```

#### Using PowerShell:
```powershell
Invoke-WebRequest -Uri "http://localhost:5000/api/salons/featured" -UseBasicParsing | Select-Object -ExpandProperty Content
```

### Step 5: Check if Any Salons are Featured

The endpoint returns salons where `featuredUntil` > now. If no salons are featured, it returns an empty array (which is correct behavior).

To feature a salon:
1. Go to `/admin` (as admin)
2. Click "Featured Salons" tab
3. Select a duration (7, 14, 30, 60, or 90 days)
4. Click "Feature for X days" on any approved salon

## Temporary Fix (Hide Section if No Salons)

If you want to hide the section when there are no featured salons, the component already does this:

```tsx
// In FeaturedSalons.tsx (line ~140)
if (salons.length === 0) {
  return null; // Don't show section if no featured salons
}
```

This means the section won't appear if:
- No salons are featured, OR
- The API returns an empty array

## Common Errors and Solutions

### Error: "Failed to fetch"
**Cause:** Backend is not running or CORS issue
**Solution:** 
1. Check if backend is running on port 5000
2. Restart backend
3. Check browser console for CORS errors

### Error: "404 Not Found"
**Cause:** Route not registered in NestJS
**Solution:**
1. Restart backend to reload routes
2. Check that `salons.controller.ts` has the route
3. Check that `salons.module.ts` imports the controller

### Error: "Unauthorized" or "403"
**Cause:** Authentication guard issue
**Solution:** The route uses `OptionalJwtAuthGuard` which should work even without login. Check backend logs for details.

### Empty Array (No Error)
**Behavior:** This is CORRECT! It means no salons are currently featured.
**Action:** Feature a salon using the admin panel.

## Backend Route Verification

Check the route is registered:

### In `backend/src/salons/salons.controller.ts`:
```typescript
@UseGuards(OptionalJwtAuthGuard)
@Get('featured')
findFeatured(@GetUser() user?: any) {
  return this.salonsService.findFeatured(user);
}
```

### Route Order (Important!)
The `featured` route MUST come BEFORE the `:id` route:
```typescript
@Get('featured')      // ✅ Specific route first
findFeatured() { ... }

@Get(':id')           // ✅ Parameterized route last
findOne() { ... }
```

If `:id` comes first, it will catch `/salons/featured` and try to find a salon with id="featured".

## Network Tab Inspection

1. Open browser DevTools (F12)
2. Go to Network tab
3. Refresh the homepage
4. Look for the request to `/api/salons/featured`
5. Check:
   - **Status Code**: Should be 200
   - **Response**: Should be JSON array
   - **Headers**: Check CORS headers

## Fix Checklist

- [ ] Backend is running on port 5000
- [ ] Backend has been restarted after adding the route
- [ ] Can access `http://localhost:5000/api/salons/featured` in browser
- [ ] Endpoint returns `[]` or `[{...}]` (JSON array)
- [ ] Frontend is running on port 3000
- [ ] Browser console shows no CORS errors
- [ ] Network tab shows 200 status for the request

## Still Not Working?

### Check Backend Terminal Output
Look for lines like:
```
GET /api/salons/featured 200
```
or
```
GET /api/salons/featured 404
```

### Check Frontend Console
Open browser console (F12) and look for:
- Red error messages
- CORS errors
- Network errors
- The specific error message from `toast.error()`

### Nuclear Option: Full Restart
```bash
# Terminal 1: Backend
cd backend
# Ctrl+C to stop
npm run start:dev

# Terminal 2: Frontend
cd frontend
# Ctrl+C to stop
npm run dev
```

Then visit `http://localhost:3000` and check if the error persists.

## Next Steps After Fix

Once the error is resolved:
1. Feature a salon using admin panel
2. Refresh homepage
3. Featured salons carousel should appear
4. Test the carousel (arrows, dots, auto-advance)

---

**Need More Help?**
Share:
1. The exact error message from browser console
2. Backend terminal output when accessing the route
3. Screenshot of the Network tab showing the failed request
