# Render Database Deployment Fix

## Quick Diagnosis Steps

### 1. Check Render Deployment Logs

1. Go to https://dashboard.render.com
2. Click on your `thesalonhub` backend service
3. Go to "Logs" tab
4. Look for the specific error message

Common database errors:
- `connection timeout` - DATABASE_URL is incorrect or unreachable
- `relation does not exist` - Missing migrations
- `password authentication failed` - Wrong database credentials
- `too many connections` - Database connection pool exhausted

### 2. Verify Environment Variables

Go to your backend service → Environment tab and verify:

```
DATABASE_URL=postgresql://[user]:[password]@[host]:[port]/[database]?schema=public
```

**Important:** Make sure this connects to your production Postgres database. Replace the bracketed placeholders with your actual credentials.

### 3. Run Migrations (If Needed)

If you see "relation does not exist" errors, you need to run migrations:

**Option A: From Render Shell**
1. Go to your service → Shell tab
2. Run:
```bash
cd backend
npx prisma migrate deploy
npx prisma generate
```

**Option B: Locally (then redeploy)**
```bash
cd backend
npx prisma migrate deploy --preview-feature
```

### 4. Check if Prisma Client is Generated

In your build logs, you should see:
```
Running 'npm run build'
> prisma generate
> nest build
```

If `prisma generate` is missing, add it to your build command.

### 5. Update Build Command on Render

Your build command should be:
```bash
npm install && cd backend && npx prisma generate && npm run build
```

Or in package.json:
```json
{
  "scripts": {
    "postinstall": "cd backend && npx prisma generate",
    "build": "cd backend && npm run build"
  }
}
```

## Common Fixes

### Fix 1: Missing Prisma Generate

Add to `backend/package.json`:
```json
{
  "scripts": {
    "postinstall": "npx prisma generate"
  }
}
```

### Fix 2: Connection Pool Issues

Update DATABASE_URL to include connection pool limits:
```
DATABASE_URL=postgresql://[credentials]?schema=public&connection_limit=5&pool_timeout=30
```

### Fix 3: Outdated Migrations

If migrations are out of sync:
```bash
cd backend
npx prisma migrate reset --force
npx prisma migrate deploy
```

**⚠️ Warning:** `migrate reset` will delete all data. Only use in development!

### Fix 4: Generate Prisma Client After Dependencies

Add to your start command on Render:
```bash
npx prisma generate && node dist/src/main.js
```

## Specific to Your Setup

Your backend structure:
- Prisma schema: `backend/prisma/schema.prisma`
- Migrations: `backend/prisma/migrations/`
- Latest migration: `20251012135500_add_plan_payment_fields`

### Recommended Render Configuration

**Build Command:**
```bash
npm install && npx prisma generate && npm run build
```

**Start Command:**
```bash
npx prisma migrate deploy && node dist/src/main.js
```

**Environment Variables:**
- `DATABASE_URL` - Your PostgreSQL connection string
- `CORS_ORIGIN` - https://stylrsa.vercel.app,https://stylrsa-tsakanimsengi-gmailcoms-projects.vercel.app
- `NODE_ENV` - production
- `PORT` - 3000 (or auto from Render)

## Testing After Fix

Once fixed, test these endpoints:
1. `https://thesalonhub.onrender.com/api/health` (should return 200)
2. `https://thesalonhub.onrender.com/api/salons` (should return salons list)

## If Still Failing

Share the exact error message from Render logs and I can provide a more specific fix.
