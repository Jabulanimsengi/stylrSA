# Debug Guide: Admin Featured Salons Not Working

## Steps to Debug

### Step 1: Open Browser Console
1. Go to `http://localhost:3000/admin`
2. Press **F12** to open Developer Tools
3. Go to the **Console** tab
4. Keep it open

### Step 2: Click Featured Salons Tab
1. In the admin panel, click **"Featured Salons"** tab
2. Watch the console for log messages

**Look for:**
```
Fetching featured salons management data... { hasAuth: true/false }
Fetch featured salons response: { status: XXX, ok: true/false }
```

**Expected:**
- `hasAuth: true` (you have authentication)
- `status: 200` and `ok: true` (request succeeded)

**If you see:**
- `hasAuth: false` → **Problem: No JWT token** (see Solution A below)
- `status: 401` → **Problem: Unauthorized** (see Solution B below)
- `status: 404` → **Problem: Route not found** (see Solution C below)
- `status: 500` → **Problem: Backend error** (check backend logs)

### Step 3: Try to Feature a Salon
1. Select a duration (7, 14, 30, 60, or 90 days)
2. Click **"Feature for X days"** on any salon
3. Watch the console

**Look for:**
```
Featuring salon: { salonId: "...", durationDays: X, hasAuth: true/false }
Feature salon response: { status: XXX, ok: true/false }
```

**Success looks like:**
```
✅ Feature salon response: { status: 200, ok: true }
✅ Salon featured successfully: { ... }
✅ Toast: "Salon featured for X days"
```

**Failure looks like:**
```
❌ Failed to feature salon: { status: 401, message: "Unauthorized" }
❌ Toast: "Failed to feature salon (401): Unauthorized"
```

---

## Common Issues & Solutions

### Solution A: No JWT Token (hasAuth: false)

**Problem:** The session doesn't have `backendJwt`

**Fix:**
1. **Log out** and **log back in**
   - Click your profile → Logout
   - Login again as admin
   
2. **Check session in console:**
   ```javascript
   // Paste this in browser console
   import('next-auth/react').then(m => 
     m.getSession().then(s => console.log('Session:', s))
   );
   ```
   
3. **Expected session structure:**
   ```json
   {
     "user": { "id": "...", "role": "ADMIN" },
     "backendJwt": "eyJhbG..." // Should have this!
   }
   ```

4. If `backendJwt` is missing:
   - Check backend logs when logging in
   - Ensure `/api/auth/login` returns JWT
   - Restart both frontend and backend

### Solution B: Unauthorized (401)

**Problem:** JWT exists but backend rejects it

**Possible causes:**
1. **JWT expired** → Log out and log back in
2. **User is not ADMIN** → Check user role in database
3. **Backend auth guard issue** → Check backend logs

**Check user role:**
```sql
-- In your database
SELECT id, email, role FROM "User" WHERE email = 'your-admin-email@example.com';
```

Role should be `'ADMIN'`, not `'CLIENT'` or `'SALON_OWNER'`

**Backend check:**
Look at backend terminal when you click "Feature for X days":
```
POST /api/admin/salons/[id]/feature
```

If you see 401 errors, check:
- Is the JWT being sent? (should see `Authorization: Bearer ...` header)
- Is the auth guard working? (check `RolesGuard` and `@Roles('ADMIN')`)

### Solution C: Route Not Found (404)

**Problem:** Backend doesn't have the route

**Fix:**
1. **Restart the backend:**
   ```bash
   # Stop backend (Ctrl+C)
   cd backend
   npm run start:dev
   ```

2. **Verify routes loaded:**
   Look for these in backend terminal:
   ```
   GET /api/admin/salons/featured/manage
   POST /api/admin/salons/:salonId/feature
   DELETE /api/admin/salons/:salonId/unfeature
   ```

3. **Test route manually:**
   ```bash
   # In PowerShell
   Invoke-WebRequest -Uri "http://localhost:5000/api/admin/salons/featured/manage"
   ```
   
   Should return 401 (not 404!) because it needs auth

### Solution D: Network Tab Analysis

1. Open **Network** tab in DevTools (F12)
2. Click "Feature for X days"
3. Find the request to `/api/admin/salons/[id]/feature`
4. Click on it

**Check Request:**
- **URL:** Should be `/api/admin/salons/[salon-id]/feature`
- **Method:** Should be `POST`
- **Headers:** Should include:
  - `Content-Type: application/json`
  - `Authorization: Bearer eyJhbG...` (if session has JWT)
- **Payload:** Should be `{"durationDays": 7}` (or whatever you selected)

**Check Response:**
- **Status:** Should be 200
- **Body:** Should be the updated salon object with `featuredUntil` set

**If headers don't include Authorization:**
- Session is missing `backendJwt`
- Follow Solution A

---

## Quick Test in Browser Console

Paste this in browser console (F12) while on the admin page:

```javascript
// Test 1: Check session
import('next-auth/react').then(m => 
  m.getSession().then(s => {
    console.log('=== SESSION CHECK ===');
    console.log('Has session:', !!s);
    console.log('Has JWT:', !!s?.backendJwt);
    console.log('User role:', s?.user?.role);
    console.log('Full session:', s);
  })
);

// Test 2: Manually feature a salon (replace SALON_ID)
fetch('/api/admin/salons/SALON_ID/feature', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({ durationDays: 7 })
})
  .then(r => {
    console.log('Status:', r.status);
    return r.json();
  })
  .then(d => console.log('Response:', d))
  .catch(e => console.error('Error:', e));

// Test 3: Fetch management data
fetch('/api/admin/salons/featured/manage', { credentials: 'include' })
  .then(r => {
    console.log('Status:', r.status);
    return r.json();
  })
  .then(d => {
    console.log('Featured:', d.featured?.length || 0);
    console.log('Available:', d.available?.length || 0);
    console.log('Full data:', d);
  })
  .catch(e => console.error('Error:', e));
```

---

## Expected Flow

**When everything works:**

1. Click "Featured Salons" tab
   ```
   Console: Fetching featured salons management data... { hasAuth: true }
   Console: Fetch featured salons response: { status: 200, ok: true }
   Console: Featured salons loaded: { featured: 0, available: 8 }
   ```

2. Click "Feature for 7 days"
   ```
   Console: Featuring salon: { salonId: "...", durationDays: 7, hasAuth: true }
   Console: Feature salon response: { status: 200, ok: true }
   Console: Salon featured successfully: { featuredUntil: "2024-..." }
   Toast: "Salon featured for 7 days"
   Console: Fetching featured salons management data... { hasAuth: true }
   Console: Featured salons loaded: { featured: 1, available: 7 }
   ```

3. Homepage shows the featured salon in the carousel

---

## Still Not Working?

Share these details:

1. **Console logs** when clicking "Featured Salons" tab
2. **Console logs** when clicking "Feature for X days"
3. **Network tab** screenshot of the failed request
4. **Backend terminal** output when making the request
5. **Session data** from the browser console test above

This will help identify the exact issue!
