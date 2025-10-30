# Mobile Connection Fix - ERR_CONNECTION_REFUSED

## Problem
Mobile devices were getting "ERR_CONNECTION_REFUSED" because:
1. Backend CORS only allowed localhost origins
2. Backend cookie domain was set to localhost
3. Production domains were blocked

## Solutions Applied

### 1. Backend CORS Configuration (CRITICAL)
Update Railway environment variables with these values:

```bash
CORS_ORIGIN="http://localhost:3001,http://localhost:3000,https://www.stylrsa.co.za,https://stylrsa.co.za,https://stylrsa.vercel.app,https://stylrsa-git-main-tsakanimsengi-gmailcoms-projects.vercel.app"

COOKIE_DOMAIN=".stylrsa.co.za"
```

**To update on Railway:**
1. Go to Railway Dashboard: https://railway.app
2. Select your backend project (stylrsa-production)
3. Go to Variables tab
4. Update `CORS_ORIGIN` to include all production domains
5. Update `COOKIE_DOMAIN` to `.stylrsa.co.za` (the dot allows subdomains)
6. Click "Deploy" to apply changes

### 2. Vercel Environment Variables
Ensure these are set in Vercel Dashboard (Settings → Environment Variables):

**Production Variables:**
```bash
NEXT_PUBLIC_API_ORIGIN=https://stylrsa-production.up.railway.app
NEXT_PUBLIC_API_URL=https://stylrsa-production.up.railway.app
NEXT_PUBLIC_BASE_PATH=https://stylrsa-production.up.railway.app
NEXT_PUBLIC_WS_URL=https://stylrsa-production.up.railway.app
NEXT_PUBLIC_SITE_URL=https://www.stylrsa.co.za
NEXTAUTH_URL=https://www.stylrsa.co.za
```

**To update on Vercel:**
1. Go to Vercel Dashboard: https://vercel.com
2. Select your project (stylrsa)
3. Go to Settings → Environment Variables
4. Ensure all production variables are set for "Production" environment
5. Redeploy if needed

## Testing
After deploying:
1. Test on desktop browser: https://www.stylrsa.co.za
2. Test on mobile browser
3. Check browser console for CORS errors
4. Verify cookies are being set properly

## Notes
- `.env.local` is for local development only (not deployed)
- Railway needs environment variables set in dashboard
- Vercel needs environment variables set in dashboard
- Backend changes require Railway redeployment
- Frontend changes require Vercel redeployment
