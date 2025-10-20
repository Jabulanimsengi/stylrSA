# Google OAuth Role Selection - Implementation Guide

## ✅ **FIXED: Users Can Now Select Role Before Google Signup**

### **Problem:**
Previously, users signing up with Google were automatically assigned the `CLIENT` role, with no way to register as Service Providers or Product Sellers.

### **Solution:**
Users now select their role (Client, Service Provider, or Product Seller) BEFORE clicking "Continue with Google", and that role is applied during account creation.

---

## 🎯 **How It Works:**

### **User Flow:**

1. **User goes to Register page**
2. **Selects role:**
   - ○ I'm a Client (default)
   - ○ I'm a Service Provider
   - ○ I'm a Product Seller
3. **Clicks "Continue with Google"**
4. **System stores selected role in cookie**
5. **User redirects to Google for authentication**
6. **User approves permissions**
7. **System reads role from cookie**
8. **Backend creates account with selected role**
9. **User is redirected back with correct role! ✅**

---

## 🔧 **Technical Implementation:**

### **1. Frontend (Register.tsx)**
```typescript
const handleGoogleSignIn = () => {
  // Store selected role in cookie (expires in 10 minutes)
  document.cookie = `oauth_signup_role=${role}; path=/; max-age=600; SameSite=Lax`;
  
  // Redirect to Google OAuth
  signIn('google', { callbackUrl: '/salons' });
};
```

**Why Cookie?**
- ✅ Works across redirects (OAuth goes to Google and back)
- ✅ Accessible server-side (NextAuth callback runs on server)
- ✅ Auto-expires after 10 minutes (no cleanup needed)
- ✅ Secure with SameSite=Lax

---

### **2. NextAuth Callback ([...nextauth]/route.ts)**
```typescript
async jwt({ token, account, profile }) {
  if (account) {
    // Read role from cookie
    const cookieStore = cookies();
    const roleCookie = cookieStore.get('oauth_signup_role');
    const selectedRole = roleCookie?.value || 'CLIENT';
    
    // Clear cookie after reading
    cookieStore.delete('oauth_signup_role');
    
    // Pass role to backend SSO endpoint
    await fetch(`${backendOrigin}/api/auth/sso`, {
      method: 'POST',
      body: JSON.stringify({
        provider: account.provider,
        providerAccountId: account.providerAccountId,
        email: profile?.email,
        name: profile?.name,
        role: selectedRole, // ← Role sent here!
      })
    });
  }
}
```

---

### **3. Backend SSO Endpoint (auth.service.ts)**
```typescript
async sso(body: {
  provider: string;
  providerAccountId: string;
  email?: string | null;
  name?: string | null;
  role?: string | null; // ← New parameter!
}) {
  const { role } = body;
  
  // Validate role or default to CLIENT
  const validRoles = ['CLIENT', 'SALON_OWNER', 'PRODUCT_SELLER'];
  const userRole = role && validRoles.includes(role) ? role : 'CLIENT';
  
  // Create user with selected role
  user = await this.prisma.user.create({
    data: {
      email,
      firstName,
      lastName,
      role: userRole, // ← Applied here!
      emailVerified: true,
      oauthAccounts: {
        create: { provider, providerAccountId },
      },
    },
  });
}
```

---

## 📋 **What Changed:**

| File | Change |
|------|--------|
| `Register.tsx` | ✅ Added `handleGoogleSignIn()` to store role in cookie |
| `Register.tsx` | ✅ Shows selected role above Google button |
| `[...nextauth]/route.ts` | ✅ Reads role from cookie in NextAuth callback |
| `[...nextauth]/route.ts` | ✅ Passes role to backend SSO endpoint |
| `auth.service.ts` | ✅ Accepts `role` parameter in SSO method |
| `auth.service.ts` | ✅ Validates role and applies during user creation |
| `auth.controller.ts` | ✅ Updated SSO endpoint to accept role |

---

## 🧪 **Testing:**

### **Test Case 1: Sign up as Service Provider**
1. Go to Register page
2. Select "I'm a Service Provider" radio button
3. Click "Continue with Google"
4. Complete Google authentication
5. **Expected**: User created with `role: SALON_OWNER`
6. **Verify**: Check user role in database or admin panel

### **Test Case 2: Sign up as Product Seller**
1. Go to Register page
2. Select "I'm a Product Seller" radio button
3. Click "Continue with Google"
4. Complete Google authentication
5. **Expected**: User created with `role: PRODUCT_SELLER`
6. **Verify**: User should see product seller dashboard

### **Test Case 3: Sign up as Client (Default)**
1. Go to Register page
2. Keep "I'm a Client" selected (default)
3. Click "Continue with Google"
4. Complete Google authentication
5. **Expected**: User created with `role: CLIENT`

### **Test Case 4: Existing User Login**
1. User with existing Google account logs in
2. **Expected**: Role unchanged (uses existing role)
3. **Verify**: Cookie is cleared even if not used

---

## 🛡️ **Security Considerations:**

### **1. Role Validation**
✅ Backend validates role against whitelist: `['CLIENT', 'SALON_OWNER', 'PRODUCT_SELLER']`
✅ Invalid roles default to `CLIENT`
✅ User cannot inject arbitrary roles

### **2. Cookie Security**
✅ Cookie expires in 10 minutes (short-lived)
✅ `SameSite=Lax` prevents CSRF attacks
✅ Cookie cleared immediately after use
✅ No sensitive data stored (just role selection)

### **3. Existing User Protection**
✅ Role only applied for **NEW** users
✅ Existing users keep their current role
✅ Cannot change role via OAuth re-authentication

---

## 📝 **User Experience:**

### **Before Fix:**
```
User: "I want to register as a service provider"
System: "Please sign up with Google"
User: *Signs up with Google*
System: "Account created as CLIENT"
User: "Wait, I wanted to be a service provider!" ❌
```

### **After Fix:**
```
User: "I want to register as a service provider"
User: *Selects "I'm a Service Provider"*
User: *Sees: "Selected role: Service Provider"*
User: *Clicks "Continue with Google"*
System: "Account created as SALON_OWNER" ✅
User: "Perfect!" 😊
```

---

## 🔍 **Debugging:**

### **Check Role Cookie:**
```javascript
// In browser console before clicking Google button
document.cookie.split(';').find(c => c.includes('oauth_signup_role'))
// Should show: oauth_signup_role=SALON_OWNER (or CLIENT or PRODUCT_SELLER)
```

### **Check Backend Logs:**
```bash
# Backend should log:
[Auth] SSO request received with role: SALON_OWNER
[Auth] Creating new user with role: SALON_OWNER
```

### **Check Database:**
```sql
-- Verify user role in database
SELECT id, email, role, "emailVerified" FROM "User" 
WHERE email = 'user@gmail.com';

-- Should show:
-- role: CLIENT | SALON_OWNER | PRODUCT_SELLER
-- emailVerified: true (OAuth users auto-verified)
```

---

## ⚠️ **Important Notes:**

1. **Cookie Lifetime**: 10 minutes
   - Enough time for OAuth flow
   - Auto-expires if user doesn't complete signup
   
2. **Default Role**: CLIENT
   - If cookie is missing/expired → defaults to CLIENT
   - Safe fallback behavior

3. **Existing Users**:
   - Role only affects **new account creation**
   - Existing users login with their current role unchanged

4. **Regular Email Signup**:
   - Still works as before
   - Role selected via radio buttons
   - No cookie needed (direct backend call)

---

## 🚀 **Next Steps:**

### **Optional Enhancements:**

1. **Role Confirmation Page**
   - Show role selection after Google auth
   - Allow user to change before finalizing

2. **Visual Indicators**
   - Show different icons for each role
   - More prominent role selection UI

3. **Role-Specific Onboarding**
   - Redirect to role-specific tutorials
   - Show relevant features based on role

4. **Analytics**
   - Track which roles users select
   - Monitor OAuth signup conversion rates

---

## ✅ **Summary:**

**What We Fixed:**
- ✅ Users can select role before Google OAuth
- ✅ Selected role is preserved through OAuth flow
- ✅ Backend creates account with correct role
- ✅ Secure cookie-based implementation
- ✅ Works for all 3 roles: Client, Service Provider, Product Seller

**Status**: COMPLETE and READY TO TEST! 🎉

**Next Action**: Test Google OAuth signup with each role to verify it works correctly.

---

**Last Updated**: January 18, 2025
**Implemented By**: Factory AI Assistant
