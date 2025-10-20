# Email Verification - New Users Only

## How It Works

### For Existing Users (Before Oct 20, 2025)
✅ **Automatically marked as verified** - Can log in immediately
- All 50 existing users have been grandfathered in
- Their `emailVerified` field is set to `true`
- No action required from them

### For New Users (After Oct 20, 2025)
📧 **Email verification required** - Must verify before login
- New registrations get `emailVerified = false`
- Verification email sent automatically
- Must click link in email to verify
- Cannot log in until verified

## Database Schema

```prisma
model User {
  // Email verification fields
  emailVerified        Boolean         @default(false)
  verificationToken    String?         @unique
  verificationExpires  DateTime?
  
  // ... other fields
}
```

## Login Flow

### Existing Users
1. Enter email/password
2. ✅ Login successful (already verified)

### New Users
1. Register account
2. Receive verification email
3. Click verification link
4. `emailVerified` set to `true`
5. Now can log in

### OAuth Users (Google, etc.)
- Automatically verified (`emailVerified = true`)
- No verification email needed

## Verification Script

A one-time script was run to verify all existing users:

**File:** `backend/scripts/verify-existing-users.ts`

**What it did:**
- Found all users created before Oct 20, 2025
- Set `emailVerified = true` for those users
- Updated 50 users total

**Result:**
```
✓ Updated 50 users to verified status
```

## API Endpoints

### Register (New Users)
```
POST /api/auth/register
```
- Creates user with `emailVerified = false`
- Sends verification email
- Returns success message

### Verify Email
```
POST /api/auth/verify-email
Body: { token: "verification-token" }
```
- Validates token
- Sets `emailVerified = true`
- Allows user to log in

### Resend Verification
```
POST /api/auth/resend-verification
Body: { email: "user@example.com" }
```
- Generates new verification token
- Sends new verification email
- Rate limited: 3 attempts per 15 minutes

### Login
```
POST /api/auth/login
Body: { email, password }
```
- Checks `emailVerified` field
- ❌ Blocks login if `false`
- ✅ Allows login if `true`

## Error Messages

### Unverified Email on Login
```json
{
  "statusCode": 401,
  "message": "Please verify your email before logging in. Check your inbox for the verification link."
}
```

### Already Verified
```json
{
  "statusCode": 403,
  "message": "Email already verified"
}
```

## Configuration

### Backend `.env`
```env
# Email Service (Resend)
RESEND_API_KEY=re_xxxxx
FROM_EMAIL=onboarding@resend.dev
FRONTEND_URL=http://localhost:3001

# Verification token expires in 24 hours (handled in code)
```

### Verification Email Template
Handled by `MailService` in `backend/src/mail/mail.service.ts`

## Testing

### Test New User Registration
```powershell
# Register new user
$body = @{
  email = "newuser@example.com"
  password = "Password123!"
  firstName = "Test"
  lastName = "User"
  role = "CLIENT"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:5000/api/auth/register" `
  -Method POST `
  -Body $body `
  -ContentType "application/json"
```

Expected: Success, verification email sent

### Test Login Before Verification
```powershell
$body = @{
  email = "newuser@example.com"
  password = "Password123!"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:5000/api/auth/login" `
  -Method POST `
  -Body $body `
  -ContentType "application/json"
```

Expected: 401 error with message about email verification

### Test Email Verification
```powershell
# Get token from email or database
$body = @{ token = "verification-token-from-email" } | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:5000/api/auth/verify-email" `
  -Method POST `
  -Body $body `
  -ContentType "application/json"
```

Expected: Success, user can now log in

## Admin Actions

### Manually Verify a User (Database)
```typescript
// Using Prisma
await prisma.user.update({
  where: { email: "user@example.com" },
  data: { 
    emailVerified: true,
    verificationToken: null,
    verificationExpires: null
  }
});
```

### Check Verification Status
```typescript
const user = await prisma.user.findUnique({
  where: { email: "user@example.com" },
  select: { 
    email: true, 
    emailVerified: true,
    verificationExpires: true
  }
});

console.log(user);
```

## Future Enhancements

Potential improvements:
- [ ] Admin panel to manually verify users
- [ ] Email verification bypass for trusted domains
- [ ] Configurable verification expiry time
- [ ] Verification reminder emails
- [ ] Two-step verification (already implemented for 2FA)

## Troubleshooting

### Users Can't Receive Verification Email
1. Check `RESEND_API_KEY` is set
2. Check `FROM_EMAIL` is configured
3. Check user's spam/junk folder
4. Use resend verification endpoint

### Old Users Can't Log In
If an existing user still can't log in after the migration:
```powershell
# Run verification script again
cd backend
npx ts-node scripts/verify-existing-users.ts
```

### Verification Link Expired
Token expires after 24 hours. User should:
1. Try logging in
2. Get error message
3. Click "Resend verification email"
4. Check inbox for new link

## Security Notes

- Verification tokens are 32-byte random hex strings
- Tokens are hashed before storage
- Tokens expire after 24 hours
- Rate limiting: 3 resend attempts per 15 minutes
- OAuth users bypass email verification (trusted providers)
- Admin accounts can enable 2FA for additional security
