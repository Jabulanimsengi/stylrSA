# How to Enable Email Verification (When Domain is Available)

## Current Status: ⏸️ DISABLED

Email verification is currently **disabled** because a custom domain is required to send emails via Resend. Users can register and log in without email verification.

---

## Prerequisites

Before enabling email verification, you need:

1. **✅ Custom Domain** (e.g., `thesalonhub.com`, `stylrsa.com`)
   - Purchase from: Namecheap, Google Domains, Cloudflare, etc.
   - Cost: ~$8-15/year

2. **✅ Domain Verified in Resend**
   - Add domain at https://resend.com/domains
   - Configure DNS records (TXT, CNAME)
   - Wait for verification (5-10 minutes)

---

## Step 1: Configure Domain in Resend

### 1.1 Add Domain
```
1. Go to https://resend.com/domains
2. Click "Add Domain"
3. Enter your domain (e.g., thesalonhub.com)
4. Click "Add Domain"
```

### 1.2 Add DNS Records
Resend will provide DNS records. Add them to your domain registrar:

**Example DNS Records:**
```
Type: TXT
Name: @
Value: resend-verification=abc123xyz456...

Type: CNAME  
Name: resend._domainkey
Value: resend._domainkey.thesalonhub.com.resend.com

Type: MX (optional, for bounce handling)
Name: @
Priority: 10
Value: feedback-smtp.resend.com
```

### 1.3 Wait for Verification
- Usually takes 5-10 minutes
- Check status in Resend dashboard
- Status should show ✅ Verified

---

## Step 2: Update Backend Environment Variables

Edit `backend/.env`:

```env
# BEFORE (using Resend's default domain - limited)
FROM_EMAIL=onboarding@resend.dev

# AFTER (using your custom domain - unrestricted)
FROM_EMAIL=noreply@thesalonhub.com
# or
FROM_EMAIL=verify@stylrsa.com
# or
FROM_EMAIL=hello@yourdomain.com
```

**Recommended Email Addresses:**
- `noreply@yourdomain.com` - Professional, indicates automated email
- `verify@yourdomain.com` - Clear purpose
- `hello@yourdomain.com` - Friendly, can receive replies
- `support@yourdomain.com` - If you want to handle support emails

---

## Step 3: Enable Verification Enforcement in Code

### 3.1 Enable Login Verification Check

Edit `backend/src/auth/auth.service.ts`:

**Find this commented block (around line 203):**
```typescript
// EMAIL VERIFICATION ENFORCEMENT - CURRENTLY DISABLED
// TODO: Enable this when custom domain is verified in Resend
// Uncomment the code below to require email verification for new users

/*
const isNewUser = user.createdAt >= this.VERIFICATION_ENFORCEMENT_DATE;
const isManualSignup = !user.oauthAccounts || user.oauthAccounts.length === 0;

if (isNewUser && !user.emailVerified && isManualSignup) {
  throw new UnauthorizedException(
    'Please verify your email address before logging in. Check your inbox for the verification code.'
  );
}
*/
```

**Uncomment it to:**
```typescript
// EMAIL VERIFICATION ENFORCEMENT - ENABLED
const isNewUser = user.createdAt >= this.VERIFICATION_ENFORCEMENT_DATE;
const isManualSignup = !user.oauthAccounts || user.oauthAccounts.length === 0;

if (isNewUser && !user.emailVerified && isManualSignup) {
  throw new UnauthorizedException(
    'Please verify your email address before logging in. Check your inbox for the verification code.'
  );
}
```

### 3.2 Update Registration Messages

Edit `backend/src/auth/auth.service.ts`:

**Find (around line 128):**
```typescript
return { 
  message: 'Registration successful! You can now log in.',
  requiresVerification: false, // Changed to false - no verification needed
  isExisting: false,
};
```

**Change to:**
```typescript
return { 
  message: 'Registration successful! Please check your email for a 6-digit verification code.',
  requiresVerification: true,
  isExisting: false,
};
```

**Also update existing user messages (around lines 74 and 91):**

Change both instances from:
```typescript
requiresVerification: false,
```

To:
```typescript
requiresVerification: true,
```

### 3.3 Remove Try-Catch Wrappers (Optional)

Since domain is now configured, you can remove the try-catch wrappers around email sending:

**Find (around line 116):**
```typescript
// Send verification email with code (will fail silently if domain not configured)
try {
  await this.mailService.sendVerificationEmail(
    user.email,
    verificationCode,
    user.firstName,
  );
} catch (error) {
  console.log('[AUTH] Email sending failed (domain not configured), but registration continues:', error.message);
}
```

**Simplify to:**
```typescript
// Send verification email with code
await this.mailService.sendVerificationEmail(
  user.email,
  verificationCode,
  user.firstName,
);
```

Do this for all 3 locations where emails are sent in the register method.

---

## Step 4: Restart Backend

```powershell
# In project root
.\FORCE_RESTART.ps1
```

Or manually:
```powershell
cd backend
npm run build
npm run start:dev
```

---

## Step 5: Test Email Verification

### 5.1 Test Registration
```
1. Register new account at /register
2. Check email inbox (and spam folder)
3. Should receive email with 6-digit code
4. Enter code in verification UI
5. Account should verify successfully
```

### 5.2 Test Login Without Verification
```
1. Register new account
2. Close browser WITHOUT verifying
3. Try to log in
4. Should be blocked with: "Please verify your email..."
5. Verification code UI should appear
6. Enter code from email
7. Should auto-log in after verification
```

### 5.3 Test Resend Code
```
1. Register account
2. Click "Resend Code"
3. Should receive new code
4. Old code should be invalidated
5. New code should work
```

---

## Step 6: Update VERIFICATION_ENFORCEMENT_DATE (Optional)

If you want ALL users (including existing ones) to verify:

Edit `backend/src/auth/auth.service.ts` (line 23):

```typescript
// BEFORE - only new users after Oct 21, 2025
private readonly VERIFICATION_ENFORCEMENT_DATE = new Date('2025-10-21T00:00:00Z');

// AFTER - all users must verify
private readonly VERIFICATION_ENFORCEMENT_DATE = new Date('2000-01-01T00:00:00Z');
```

**⚠️ Warning:** This will require ALL existing users to verify their email before they can log in again.

---

## Verification Flow Summary

### When Enabled:
```
┌─────────────────────┐
│  User Registers     │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Email Sent with     │
│ 6-digit Code        │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ User Enters Code    │
│ in UI               │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Account Verified    │
│ Can Log In          │
└─────────────────────┘

IF USER TRIES TO LOG IN WITHOUT VERIFYING:
┌─────────────────────┐
│ Login Blocked       │
│ Code Sent Again     │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Verification UI     │
│ Shown in Modal      │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ After Verification  │
│ Auto Logs In        │
└─────────────────────┘
```

---

## Troubleshooting

### Email Not Sending
```
✅ Check FROM_EMAIL uses your verified domain
✅ Check domain is verified in Resend dashboard
✅ Check Resend API key is correct in .env
✅ Check backend logs for errors
✅ Test email from Resend dashboard directly
```

### Users Can't Verify
```
✅ Check code expiry (15 minutes)
✅ User can resend code if expired
✅ Check spam folder
✅ Test with your own email first
```

### Old Users Being Blocked
```
✅ Check VERIFICATION_ENFORCEMENT_DATE
✅ Adjust date to exclude old users
✅ Or manually verify old users in database:
   UPDATE users SET "emailVerified" = true WHERE "createdAt" < '2025-10-21';
```

---

## Cost Breakdown

### Domain Cost
- **Namecheap:** $8-12/year (.com)
- **Google Domains:** $12/year
- **Cloudflare:** $9-10/year

### Resend Cost (Current Free Tier)
- **3,000 emails/month** - FREE
- **100 emails/day** - FREE
- Sufficient for small-medium apps

If you exceed free tier:
- **$20/month** - 50,000 emails
- **$80/month** - 500,000 emails

---

## Security Best Practices (When Enabled)

1. **Monitor Failed Verification Attempts**
   - Track repeated failed attempts
   - Consider rate limiting per email

2. **Code Expiry**
   - Currently set to 15 minutes (secure)
   - Don't increase beyond 30 minutes

3. **Audit Old Unverified Accounts**
   - Clean up accounts created >30 days ago without verification
   - Send reminder emails before deletion

4. **HTTPS Only**
   - Ensure production uses HTTPS
   - Verification codes in emails aren't encrypted

---

## Current Code Features (Ready to Use)

✅ 6-digit numeric verification codes
✅ 15-minute code expiry
✅ Beautiful verification UI with animations
✅ Auto-focus and auto-advance inputs
✅ Paste support for codes
✅ Resend code functionality
✅ Error shake animations
✅ Success checkmark indicator
✅ Mobile responsive design
✅ Accessible (ARIA labels)
✅ Selective enforcement (old vs new users)
✅ OAuth bypass (Google accounts pre-verified)

---

## Summary Checklist

- [ ] Purchase custom domain
- [ ] Verify domain in Resend dashboard
- [ ] Update `FROM_EMAIL` in backend/.env
- [ ] Uncomment verification enforcement code in auth.service.ts
- [ ] Change `requiresVerification: false` to `true` in registration responses
- [ ] Remove try-catch wrappers around email sending (optional)
- [ ] Restart backend
- [ ] Test registration flow
- [ ] Test login without verification
- [ ] Test code expiry and resend
- [ ] Monitor for any issues

---

**When Ready:** After completing these steps, email verification will be fully functional and all new users will be required to verify their email before accessing the platform.

**Status File:** Delete or rename this file once verification is enabled to avoid confusion.
