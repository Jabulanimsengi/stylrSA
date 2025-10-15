# Production Deployment Guide

## Backend Environment Variables (Render)

Your backend on **thesalonhub.onrender.com** needs the following environment variable:

### Required:
```
CORS_ORIGIN=https://stylrsa.vercel.app,https://stylrsa-tsakanimsengi-gmailcoms-projects.vercel.app
```

**Important:** This must include all production frontend URLs that will connect to your backend.

## Frontend Environment Variables (Vercel)

Your frontend on **stylrsa.vercel.app** needs the following environment variable:

### Required:
```
NEXT_PUBLIC_API_ORIGIN=https://thesalonhub.onrender.com
```

This tells the frontend where your backend API is located.

## How to Set Environment Variables

### On Render (Backend):
1. Go to https://dashboard.render.com
2. Select your `thesalonhub` service
3. Go to "Environment" tab
4. Add/Update the `CORS_ORIGIN` variable
5. Click "Save Changes"
6. Render will automatically redeploy

### On Vercel (Frontend):
1. Go to https://vercel.com/dashboard
2. Select your `stylrsa` project
3. Go to "Settings" → "Environment Variables"
4. Add `NEXT_PUBLIC_API_ORIGIN` with value `https://thesalonhub.onrender.com`
5. Select all environments (Production, Preview, Development)
6. Click "Save"
7. Redeploy from the "Deployments" tab

## What Was Fixed

1. **WebSocket CORS Error** - WebSocketGateway was using wildcard `*` which doesn't work with credentials. Now uses the CORS_ORIGIN environment variable.

2. **API Routing** - Removed incorrect localhost rewrites from vercel.json. The next.config.ts now properly handles all API routing using NEXT_PUBLIC_API_ORIGIN.

3. **Mobile Responsiveness** - Dashboard cards (Manage Bookings, Your Services, Manage Gallery) now properly fit on 375px screens.

4. **Mobile Navbar Color** - Changed from purple to black as requested.

## Testing After Deployment

After setting the environment variables and redeploying:

1. Open https://stylrsa.vercel.app in incognito mode
2. Check browser console - there should be no CORS errors
3. Try logging in - should work without 401 errors
4. Test on mobile device or Chrome DevTools mobile view (375px)
5. Verify all dashboard cards display properly without requiring zoom

## Troubleshooting

If you still see CORS errors:
- Verify the CORS_ORIGIN on Render includes the exact Vercel URL
- Check that Render redeployed after changing the environment variable
- Clear browser cache or test in incognito mode

If API calls fail:
- Verify NEXT_PUBLIC_API_ORIGIN is set on Vercel
- Check that it matches your Render backend URL exactly
- Redeploy the frontend after adding the variable
