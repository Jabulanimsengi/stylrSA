# 🚀 Setup Instructions for New Features

**Last Updated:** October 25, 2025

---

## ⚠️ IMPORTANT: Manual Steps Required

The following features have been **fully implemented in code**, but require **your action** to become fully functional:

---

## 1. 📧 Email Verification Setup (CRITICAL)

### Current Status: ⏳ **Awaiting Domain Verification**

### Steps to Complete:

#### Step 1: Go to Resend Dashboard
1. Visit: https://resend.com/domains
2. Log in with your Resend account

#### Step 2: Add Your Domain
1. Click **"Add Domain"**
2. Enter: `stylrsa.co.za`
3. Click **"Add Domain"**

#### Step 3: Configure DNS Records
Resend will provide you with DNS records to add. You'll need to add these to your domain provider (e.g., Namecheap, GoDaddy, Cloudflare).

**Typical records:**

```
Type: TXT
Name: _resend
Value: [provided by Resend]

Type: CNAME  
Name: resend._domainkey
Value: [provided by Resend]
```

#### Step 4: Add DNS Records to Your Domain Provider
1. Log in to your domain provider (where you registered stylrsa.co.za)
2. Go to DNS settings
3. Add the TXT and CNAME records exactly as shown in Resend
4. Save changes

#### Step 5: Wait for Verification
- Usually takes **5-15 minutes**
- Resend will automatically verify once DNS propagates
- Refresh the Resend dashboard to check status

#### Step 6: Confirm Verification
- Domain should show **"Verified"** status with a green checkmark ✅
- Once verified, emails will be sent from `info@stylrsa.co.za`

### Testing Email Verification:

```bash
# 1. Start backend server
cd backend
npm run start:dev

# 2. Start frontend server (in new terminal)
cd frontend
npm run dev

# 3. Open browser to http://localhost:3000
# 4. Register a new account
# 5. Check email inbox for verification code
# 6. Enter code and verify it works
```

### If Emails Not Received:
1. Check **spam/junk folder**
2. Verify domain is **"Verified"** in Resend
3. Check backend console for errors
4. Verify `FROM_EMAIL=info@stylrsa.co.za` in `backend/.env`

---

## 2. 🎬 Vimeo Video Setup (REQUIRED FOR VIDEOS)

### Current Status: ⏳ **Awaiting Access Token**

### Steps to Complete:

#### Step 1: Create Vimeo Developer Account
1. Go to: https://developer.vimeo.com/
2. Sign up or log in
3. You can use the **free trial** to test

#### Step 2: Create a New App
1. Go to: https://developer.vimeo.com/apps
2. Click **"Create App"**
3. Fill in details:
   - **Name:** Stylr SA Video Uploads
   - **Description:** Video uploads for service providers
   - **App URL:** https://stylrsa.co.za

#### Step 3: Generate Access Token
1. Open your new app
2. Go to **"Authentication"** tab
3. Under **"Personal Access Tokens"**, click **"Generate New Token"**
4. Select these scopes:
   - ✅ `upload` - Upload videos
   - ✅ `video_files` - Access video files
   - ✅ `delete` - Delete videos
   - ✅ `edit` - Edit video metadata
5. Click **"Generate Token"**
6. **IMPORTANT:** Copy the token immediately (you can't see it again)

#### Step 4: Add Token to Backend .env
1. Open: `backend/.env`
2. Find line: `VIMEO_ACCESS_TOKEN=your_vimeo_access_token_here`
3. Replace with your actual token:
   ```env
   VIMEO_ACCESS_TOKEN=abc123your_actual_token_here
   ```
4. Save the file

#### Step 5: Restart Backend Server
```bash
cd backend
# Press Ctrl+C to stop current server
npm run start:dev
```

### Testing Video Upload:

```bash
# 1. Log in as salon owner with Growth/Pro/Elite plan
# 2. Upload a video (max 60 seconds, max 50MB)
# 3. Check it uploads successfully
# 4. Approve as admin
# 5. Check home page for video
```

### Vimeo Free Trial Limits:
- **Storage:** 5GB
- **Upload:** 500MB per week
- **Duration:** Unlimited
- **Videos:** Unlimited

### When to Upgrade:
- After free trial ends
- **Standard Plan:** $15/month
  - 250GB storage/year
  - Better upload speeds
  - No weekly limits

---

## 3. 🗄️ Database Migration (ALREADY DONE ✅)

### Status: ✅ **COMPLETE**

The database schema has been successfully updated with:
- ✅ `BeforeAfterPhoto` table
- ✅ `ServiceVideo` table
- ✅ All required relationships

**No action needed from you.**

---

## 4. 📦 Frontend Dependencies (ALREADY INSTALLED ✅)

### Status: ✅ **COMPLETE**

The following package has been installed:
- ✅ `react-compare-image` - For before/after slider

**No action needed from you.**

---

## 5. 🎨 Admin UI Pages (OPTIONAL - NOT YET BUILT)

### Status: ⏳ **Pending Future Implementation**

Currently, admins can approve/reject content using **API endpoints directly** (via Postman, Thunder Client, etc.).

### API Endpoints Available:

**Before/After Photos:**
```
GET    /api/before-after/pending        # View pending photos
PATCH  /api/before-after/:id/approve    # Approve photo
PATCH  /api/before-after/:id/reject     # Reject photo
```

**Videos:**
```
GET    /api/videos/pending              # View pending videos
PATCH  /api/videos/:id/approve          # Approve video
PATCH  /api/videos/:id/reject           # Reject video
```

### Future Implementation:
We can build dedicated admin UI pages at `/admin/before-after` and `/admin/videos` in a future update.

---

## 6. 🖼️ Upload Interfaces (OPTIONAL - NOT YET BUILT)

### Status: ⏳ **Pending Future Implementation**

Currently, service providers can upload content using **API endpoints directly**.

### API Endpoints Available:

**Upload Before/After:**
```
POST /api/before-after/upload
Body (multipart/form-data):
  - images: [file, file] (2 files)
  - salonId: string
  - serviceId?: string
  - caption?: string
```

**Upload Video:**
```
POST /api/videos/upload
Body (multipart/form-data):
  - video: file (max 50MB, max 60 seconds)
  - salonId: string
  - serviceId?: string
  - caption?: string
```

### Future Implementation:
We can build user-friendly upload interfaces in the dashboard in a future update.

---

## 🚀 Quick Start Checklist

Use this checklist to track your progress:

### Email Verification:
- [ ] Log in to Resend dashboard
- [ ] Add domain `stylrsa.co.za`
- [ ] Get DNS records from Resend
- [ ] Add DNS records to domain provider
- [ ] Wait for verification (5-15 minutes)
- [ ] Confirm "Verified" status in Resend
- [ ] Test registration and email delivery

### Vimeo Videos:
- [ ] Create Vimeo developer account
- [ ] Create new app
- [ ] Generate access token with required scopes
- [ ] Add token to `backend/.env`
- [ ] Restart backend server
- [ ] Test video upload with Growth+ plan

### Optional (Future):
- [ ] Build admin approval UI
- [ ] Build service provider upload UI
- [ ] Add analytics dashboard

---

## 🧪 Testing Scenarios

### Scenario 1: New User Registration
1. Go to: http://localhost:3000 (or https://stylrsa.co.za)
2. Click "Register"
3. Fill in registration form
4. Submit
5. **Expected:** Receive email with 6-digit code
6. Enter code on verification screen
7. **Expected:** Account verified, can now log in

### Scenario 2: Before/After Upload (via API)
1. Log in as salon owner
2. Use Postman to POST to `/api/before-after/upload`
3. Include 2 image files + salonId
4. **Expected:** Upload succeeds, status = PENDING
5. Log in as admin
6. Approve via `/api/before-after/:id/approve`
7. **Expected:** Photo appears on home page slideshow

### Scenario 3: Video Upload (via API)
1. Log in as salon owner with Growth/Pro/Elite plan
2. Use Postman to POST to `/api/videos/upload`
3. Include video file + salonId
4. **Expected:** Upload to Vimeo succeeds, status = PENDING
5. Log in as admin
6. Approve via `/api/videos/:id/approve`
7. **Expected:** Video appears on home page slideshow

---

## ❓ FAQ

### Q: What if I don't set up Resend domain verification?
**A:** Email verification will fail. Users won't receive verification codes and won't be able to complete registration.

**Solution:** Follow Step 1 above to verify your domain.

### Q: What if I don't set up Vimeo?
**A:** Video uploads will fail. The video feature won't work at all.

**Solution:** Follow Step 2 above to get a Vimeo access token.

### Q: Can I test locally without domain verification?
**A:** For emails, Resend will still send emails to the console in development, but they won't be delivered to real email addresses. For production, domain verification is **required**.

### Q: How much will Vimeo cost after the free trial?
**A:** $15/month for the Standard plan (250GB storage/year). You can stay on free tier if storage is sufficient.

### Q: Can I use a different video hosting service?
**A:** Yes, but you'll need to modify the `VimeoService` to integrate with a different provider (e.g., Cloudflare Stream, Mux, AWS S3).

---

## 📞 Support

If you encounter issues:

1. **Check backend logs:** Console where `npm run start:dev` is running
2. **Check frontend console:** Browser DevTools (F12)
3. **Check database:** Run `npx prisma studio` to view data
4. **Email:** info@stylrsa.co.za

---

## 📝 Summary

### What's Already Done:
✅ All code implemented  
✅ Database schema updated  
✅ Frontend components created  
✅ Backend API endpoints ready  
✅ Dark mode support  
✅ Mobile responsive design  

### What You Need to Do:
⏳ Verify domain in Resend (5-15 minutes)  
⏳ Get Vimeo access token (5 minutes)  
⏳ Test email and video features  

### Estimated Setup Time:
**10-20 minutes** (excluding DNS propagation wait time)

---

**Good luck! 🚀**

If you need help with any step, let me know!
