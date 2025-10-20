# 🚨 CRITICAL SECURITY VULNERABILITY FOUND

## The Problem

**Unverified users CAN bypass email verification using Google OAuth login!**

### How the Bypass Works:

```
1. User registers with email/password
   └─→ emailVerified = FALSE
   └─→ Regular login BLOCKED ✅ (working correctly)

2. Same user clicks "Continue with Google"
   └─→ Google authenticates them
   └─→ Backend SSO endpoint finds user by email
   └─→ ❌ SSO endpoint DOES NOT CHECK emailVerified
   └─→ User gets JWT token and full access!
   └─→ 🚨 SECURITY BYPASSED!
```

### The Vulnerable Code:

In `backend/src/auth/auth.service.ts`, the `sso()` method:

```typescript
// Line ~395-410
if (!user && email) {
  user = await this.prisma.user.findUnique({ where: { email } });
  if (user) {
    await this.prisma.oAuthAccount.create({
      data: {
        userId: user.id,
        provider,
        providerAccountId,
      },
    });
  }
}

// ❌ NO emailVerified CHECK HERE!
// Immediately returns JWT token for ANY existing user
```

## The Fix

Add email verification check to the SSO endpoint.

### File: `backend/src/auth/auth.service.ts`

Replace the SSO method (starting around line 375):

```typescript
async sso(body: {
  provider: string;
  providerAccountId: string;
  email?: string | null;
  name?: string | null;
  role?: string | null;
}) {
  const { provider, providerAccountId, email, name, role } = body;
  if (!provider || !providerAccountId) {
    throw new UnauthorizedException('Invalid SSO payload');
  }

  // Try to find existing OAuth account
  let user = await this.prisma.user.findFirst({
    where: {
      oauthAccounts: {
        some: { provider, providerAccountId },
      },
    },
  });

  // If not found, try link by email
  if (!user && email) {
    user = await this.prisma.user.findUnique({ where: { email } });
    if (user) {
      // ✅ ADD THIS CHECK: Verify email before linking OAuth account
      if (!user.emailVerified) {
        throw new UnauthorizedException(
          'Please verify your email address before using OAuth login. Check your inbox for the verification link.'
        );
      }
      
      await this.prisma.oAuthAccount.create({
        data: {
          userId: user.id,
          provider,
          providerAccountId,
        },
      });
    }
  }

  // If still no user, create a new one
  if (!user) {
    const fullName = (name ?? '').trim();
    const [firstName, ...rest] = fullName ? fullName.split(' ') : ['User'];
    const lastName = rest.join(' ') || 'Account';
    const tempPassword = randomBytes(16).toString('hex');
    const passwordHash = await argon2.hash(tempPassword);
    
    // Validate role or default to CLIENT
    const validRoles = ['CLIENT', 'SALON_OWNER', 'PRODUCT_SELLER'];
    const userRole = role && validRoles.includes(role) ? role : 'CLIENT';
    
    user = await this.prisma.user.create({
      data: {
        email: email ?? `${provider}-${providerAccountId}@example.local`,
        password: passwordHash,
        firstName,
        lastName,
        role: userRole as any,
        emailVerified: true, // OAuth accounts are pre-verified
        oauthAccounts: {
          create: { provider, providerAccountId },
        },
      },
    });
  }

  // ✅ ADD THIS CHECK: Verify existing users who already had OAuth
  if (!user.emailVerified) {
    throw new UnauthorizedException(
      'Please verify your email address before logging in. Check your inbox for the verification link.'
    );
  }

  const accessToken = await this.signToken(user.id, user.email, user.role);
  const salon = await this.prisma.salon.findFirst({
    where: { ownerId: user.id },
    select: { id: true },
  });
  return {
    jwt: accessToken,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      salonId: salon?.id,
    },
  };
}
```

## Summary of Changes

### Added 2 Security Checks:

1. **When linking existing account to OAuth** (line ~405):
   ```typescript
   if (!user.emailVerified) {
     throw new UnauthorizedException(
       'Please verify your email address before using OAuth login.'
     );
   }
   ```

2. **Before issuing JWT token** (line ~445):
   ```typescript
   if (!user.emailVerified) {
     throw new UnauthorizedException(
       'Please verify your email address before logging in.'
     );
   }
   ```

## Testing the Fix

### Before Fix:
```
1. Register with email@test.com + password
2. Don't verify email
3. Click "Continue with Google" with same email
4. ❌ Gets full access (BYPASS!)
```

### After Fix:
```
1. Register with email@test.com + password
2. Don't verify email
3. Click "Continue with Google" with same email
4. ✅ BLOCKED: "Please verify your email address before using OAuth login"
5. Must verify email first
6. Then OAuth works
```

## Impact

### Who Was Affected:
- ❌ Anyone who registered but didn't verify
- ❌ Could bypass by using Google OAuth
- ❌ Full system access without verification

### What They Could Do:
- ✅ Create salons (if SALON_OWNER)
- ✅ Create products (if PRODUCT_SELLER)
- ✅ Make bookings
- ✅ Everything an authenticated user can do

### After Fix:
- ✅ OAuth login also checks email verification
- ✅ Consistent security across all login methods
- ✅ No bypass possible

## How to Deploy Fix

### 1. Apply the Code Change
Edit `backend/src/auth/auth.service.ts` with the changes above.

### 2. Restart Backend
```bash
cd backend
npm run build
npm run start:dev
```

### 3. Test All Login Methods

#### Test Regular Login (Should Still Block):
```bash
POST /api/auth/login
{
  "email": "unverified@test.com",
  "password": "password"
}

Expected: 401 "Please verify your email before logging in"
```

#### Test OAuth Login (Should Now Block):
```bash
1. Register user with email
2. Don't verify
3. Try "Continue with Google" with same email
Expected: 401 "Please verify your email address before using OAuth login"
```

#### Test New OAuth User (Should Work):
```bash
1. Use Google with NEW email (never registered)
Expected: Success (new user created with emailVerified=true)
```

### 4. Monitor Logs
Look for:
```
[EMAIL] logs showing verification attempts
UnauthorizedException for unverified users
```

## Additional Recommendations

### 1. Audit Existing Users
Check if any unverified users accessed system via OAuth:

```sql
SELECT 
  u.id, 
  u.email, 
  u.emailVerified, 
  u.lastLoginAt,
  COUNT(o.id) as oauth_accounts
FROM "User" u
LEFT JOIN "OAuthAccount" o ON u.id = o."userId"
WHERE u."emailVerified" = false 
  AND u."lastLoginAt" IS NOT NULL
GROUP BY u.id;
```

### 2. Add Logging
Log when OAuth bypass attempt detected:
```typescript
if (!user.emailVerified) {
  console.warn(`[SECURITY] OAuth bypass attempt for unverified user: ${user.email}`);
  throw new UnauthorizedException(...);
}
```

### 3. Consider Auto-Verify for OAuth
Alternative approach: If user comes through OAuth, auto-verify their email:
```typescript
if (user && !user.emailVerified) {
  // Since Google verified their email, we can trust it
  await this.prisma.user.update({
    where: { id: user.id },
    data: { emailVerified: true }
  });
}
```

**But this reduces security** - only do if you trust OAuth provider's email verification.

## Priority: CRITICAL

- [ ] Apply fix immediately
- [ ] Test all login paths
- [ ] Restart production backend
- [ ] Audit existing unverified users
- [ ] Monitor for bypass attempts

---

**Bottom Line:** The email verification check was missing from the OAuth/SSO login path, allowing unverified users to bypass security by using Google login. Fix applied above closes this vulnerability.
