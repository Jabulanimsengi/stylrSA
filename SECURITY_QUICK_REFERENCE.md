# 🔒 Security Quick Reference Guide

## Quick Commands

### Test Rate Limiting
```bash
# Test login rate limit (should block after 5 attempts)
for i in {1..6}; do curl -X POST http://localhost:5000/api/auth/login -H "Content-Type: application/json" -d '{"email":"test@test.com","password":"wrong"}'; done
```

### Use Sanitization Functions

```typescript
import { sanitizeText, sanitizeHtml, sanitizeUrl, sanitizeRichText } from '@/lib/sanitize';

// Plain text (removes ALL HTML)
const safe = sanitizeText(userInput);

// Rich text (allows safe HTML tags)
const safeHtml = sanitizeRichText(description);

// URLs (blocks javascript:, data:, etc.)
const safeUrl = sanitizeUrl(userProvidedLink);
```

---

## Rate Limits

| Endpoint | Limit | Time Window |
|----------|-------|-------------|
| **All API calls** | 100 requests | per minute |
| **Login** | 5 attempts | per 15 minutes |
| **Register** | 5 attempts | per 15 minutes |
| **File uploads** | 5 uploads | per 10 minutes |

---

## When to Use Each Sanitization Function

| Function | Use Case | Example |
|----------|----------|---------|
| `sanitizeText()` | User names, comments, plain text | Reviews, chat messages |
| `sanitizeHtml()` | Limited HTML formatting | Comments with bold/italic |
| `sanitizeRichText()` | Descriptions, articles | Salon descriptions |
| `sanitizeUrl()` | User-provided links | Website URLs |
| `sanitizeSearchQuery()` | Search inputs | Search bars |
| `sanitizeFilename()` | File uploads | Image filenames |
| `sanitizePhone()` | Phone numbers | Contact forms |
| `sanitizeEmail()` | Email addresses | Login/register |

---

## Error Boundary Usage

```tsx
// Automatically wraps entire app
// Located in: frontend/src/app/layout.tsx

// Custom fallback for specific sections:
<ErrorBoundary fallback={<CustomErrorUI />}>
  <YourComponent />
</ErrorBoundary>
```

---

## Security Checklist

**Before Deploying:**
- [ ] Rate limiting tested
- [ ] Error boundary tested
- [ ] All user inputs sanitized
- [ ] XSS tests passed
- [ ] SQL injection tests passed
- [ ] No sensitive data in logs

**After Deploying:**
- [ ] Monitor rate limit violations
- [ ] Check error logs
- [ ] Review security headers
- [ ] Test production endpoints

---

## Common Security Mistakes to Avoid

❌ **DON'T:**
```typescript
// Dangerous - No sanitization
<div>{userInput}</div>

// Dangerous - Using dangerouslySetInnerHTML
<div dangerouslySetInnerHTML={{ __html: userInput }} />

// Dangerous - No rate limiting
@Post('login')
async login() { ... }

// Dangerous - Exposing errors
catch (error) {
  return error.message; // Don't expose stack traces
}
```

✅ **DO:**
```typescript
// Safe - Sanitized
<div>{sanitizeText(userInput)}</div>

// Safe - Only for JSON-LD structured data
<script type="application/ld+json">
  {JSON.stringify(structuredData)}
</script>

// Safe - Rate limited
@Throttle({ auth: { limit: 5, ttl: 900000 } })
@Post('login')
async login() { ... }

// Safe - Generic error
catch (error) {
  logger.error(error);
  return { message: 'An error occurred' };
}
```

---

## Debugging Tips

### Rate Limiting Issues
```typescript
// Check ThrottlerGuard logs
// Look for: "ThrottlerGuard: Rate limit exceeded"

// Test with curl:
curl -v http://localhost:5000/api/salons
// Check response headers: X-RateLimit-*
```

### Sanitization Issues
```typescript
// Test sanitization in console
import { sanitizeText } from '@/lib/sanitize';
console.log(sanitizeText('<script>alert("xss")</script>Hello'));
// Expected: "Hello" (script removed)
```

### Error Boundary Issues
```typescript
// Force trigger error boundary for testing
function TestError() {
  throw new Error('Test error boundary');
}

// Temporarily add to page:
<TestError />
```

---

## Quick Fixes

### "Too Many Requests" Error
**Problem:** Getting 429 status  
**Solution:** Wait for TTL to expire or increase limits in `app.module.ts`

### "Content Not Showing" After Sanitization
**Problem:** Content disappearing  
**Solution:** Use `sanitizeRichText()` instead of `sanitizeText()` for formatted content

### Error Boundary Not Catching
**Problem:** Errors not caught  
**Solution:** Error boundaries only catch errors in child components, not in event handlers. Use try-catch for event handlers.

---

## Need Help?

1. Check `PHASE1_SECURITY_IMPROVEMENTS.md` for detailed docs
2. Review code comments in sanitization functions
3. Test with provided examples
4. Check browser console for warnings
