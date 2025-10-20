# Fix: Featured Salons Not Showing on Homepage

## Root Cause Found ✅

Your `.env.local` file was pointing to the **production server** (`https://thesalonhub.onrender.com`) instead of your local backend (`http://localhost:5000`).

### What I Fixed:
Changed in `frontend/.env.local`:
- `NEXT_PUBLIC_API_ORIGIN` from `https://thesalonhub.onrender.com` → `http://localhost:5000`
- `NEXT_PUBLIC_API_URL` from `https://thesalonhub.onrender.com` → `http://localhost:5000`
- `NEXT_PUBLIC_WS_URL` from `https://thesalonhub.onrender.com` → `http://localhost:5000`

## Manual Steps to Test

### 1. Start Backend (Terminal 1)
```powershell
cd C:\Users\ramos\all_coding\hairprosdirectory\backend
npm run start:dev
```
**Wait for**: "Application is running on: http://localhost:5000"

### 2. Test Backend Endpoint
In another terminal:
```powershell
Invoke-WebRequest -Uri "http://localhost:5000/api/salons/featured" -UseBasicParsing
```
**Expected**: Status 200, JSON array with 2 salons

### 3. Start Frontend (Terminal 2)
```powershell
cd C:\Users\ramos\all_coding\hairprosdirectory\frontend
npm run dev
```
**Wait for**: "Local: http://localhost:3001"

### 4. Test in Browser
Open: http://localhost:3001

**Look for**: "Recommended Salons" section with carousel showing:
- Glow & Grace Salon
- Bridget Salon and Style

## Verification Checklist

- [ ] Backend running on port 5000
- [ ] Frontend running on port 3001  
- [ ] http://localhost:5000/api/salons/featured returns JSON
- [ ] http://localhost:3001/api/salons/featured returns same JSON (via proxy)
- [ ] Homepage shows "Recommended Salons" section
- [ ] Carousel displays 2 salon cards
- [ ] Navigation arrows and dots work

## If Featured Salons Still Don't Display

Check browser console (F12) for errors:
1. Network tab: Verify `/api/salons/featured` returns 200 (not 404/500)
2. Console tab: Look for JavaScript errors
3. React DevTools: Check if `FeaturedSalons` component has `salons` array populated

## To Switch Back to Production

When you want to use the production backend again, edit `frontend/.env.local`:
```
NEXT_PUBLIC_API_URL=https://thesalonhub.onrender.com
NEXT_PUBLIC_API_ORIGIN=https://thesalonhub.onrender.com
NEXT_PUBLIC_WS_URL=https://thesalonhub.onrender.com
```
Then restart frontend: `npm run dev`

## Production Deployment Note

The production server at `https://thesalonhub.onrender.com` **also needs the UUID constraint fix** applied to `backend/src/salons/salons.controller.ts`:

```typescript
@Get(":id([0-9a-fA-F-]{36})")  // Line 86
```

Deploy the updated controller to production to fix the featured route there too.
