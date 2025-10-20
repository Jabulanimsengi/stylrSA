# How to Run Frontend and Backend for Development

## Method 1: Two Separate Terminals (Recommended)

### Terminal 1 - Backend
```powershell
cd C:\Users\ramos\all_coding\hairprosdirectory\backend
npm run start:dev
```
**Wait for:** `Nest application successfully started` (usually takes 10-15 seconds)
**Port:** http://localhost:5000

### Terminal 2 - Frontend
```powershell
cd C:\Users\ramos\all_coding\hairprosdirectory\frontend
npm run dev
```
**Wait for:** `Local: http://localhost:3001` (usually takes 15-20 seconds)
**Port:** http://localhost:3001

### Open in Browser
Navigate to: http://localhost:3001

---

## Method 2: PowerShell Script (Automated)

I can create a startup script for you. Would you like me to create one?

---

## Method 3: Using VS Code Terminal Splits

1. Open VS Code
2. Open integrated terminal (Ctrl + `)
3. Click the **split terminal** icon (or Ctrl+Shift+5)
4. In **left terminal**: `cd backend && npm run start:dev`
5. In **right terminal**: `cd frontend && npm run dev`

---

## Quick Reference

| Server   | Command              | Port | URL                    |
|----------|----------------------|------|------------------------|
| Backend  | `npm run start:dev`  | 5000 | http://localhost:5000  |
| Frontend | `npm run dev`        | 3001 | http://localhost:3001  |

---

## Checking Server Status

```powershell
# Check if servers are running
netstat -ano | findstr "LISTENING" | findstr -E ":5000|:3001"

# Test backend API
Invoke-WebRequest -Uri "http://localhost:5000/api/salons/featured" -UseBasicParsing

# Test frontend proxy
Invoke-WebRequest -Uri "http://localhost:3001/api/salons/featured" -UseBasicParsing
```

---

## Stopping Servers

**In Terminal:** Press `Ctrl + C` in each terminal window

**Kill All Node Processes:**
```powershell
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
```

---

## Troubleshooting

### Port Already in Use
```powershell
# Kill all Node processes
Get-Process node | Stop-Process -Force

# Wait a few seconds, then restart
Start-Sleep -Seconds 3
```

### Backend Won't Start
- Check `backend/.env` has `PORT=5000`
- Check database connection in `backend/.env`
- Delete `backend/dist` folder: `Remove-Item backend/dist -Recurse -Force`

### Frontend Won't Start
- Check `frontend/.env.local` has `NEXT_PUBLIC_API_ORIGIN=http://localhost:5000`
- Delete `.next` cache: `Remove-Item frontend/.next -Recurse -Force`
- Port 3001 in use? Edit `frontend/package.json` dev script to use different port

### API Returns 404
- Make sure backend is running on port 5000
- Check `frontend/.env.local` points to `http://localhost:5000`
- Restart frontend server after changing `.env.local`

---

## Environment Configuration

### Backend (`backend/.env`)
```env
PORT=5000
DATABASE_URL="your-database-url"
JWT_SECRET="your-secret"
```

### Frontend (`frontend/.env.local`)
```env
NEXT_PUBLIC_API_ORIGIN=http://localhost:5000
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_WS_URL=http://localhost:5000
NEXTAUTH_URL=http://localhost:3001
```

---

## Development Workflow

1. **Start Backend First** - Always start backend before frontend
2. **Check Backend API** - Test endpoints before starting frontend
3. **Start Frontend** - Frontend will proxy API calls to backend
4. **Hot Reload** - Both servers support hot reload (changes auto-refresh)

### Making Changes
- **Backend changes:** Server auto-restarts, wait 2-3 seconds
- **Frontend changes:** Page auto-refreshes in browser
- **Environment changes:** Manual restart required

---

## Production vs Development

### Development (Current Setup)
- Backend: http://localhost:5000
- Frontend: http://localhost:3001
- Hot reload enabled
- Debug mode enabled

### Production
- Backend: https://thesalonhub.onrender.com
- Frontend: https://thesalonhub.vercel.app
- To switch back, update `frontend/.env.local` URLs
