# 📊 Analytics & Monitoring Quick Start Guide

## 🚀 5-Minute Setup

### 1. Set Environment Variables

Copy `.env.local.example` to `.env.local` and add:

```bash
# Google Analytics 4
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Sentry (optional but recommended)
NEXT_PUBLIC_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
NEXT_PUBLIC_SENTRY_ENVIRONMENT=development
```

### 2. Restart Development Server

```bash
# Stop current server (Ctrl+C)
npm run dev
```

### 3. Verify It's Working

Open browser console and navigate pages. You should see:
```
[Analytics] Page view tracked: /salons
[Performance] LCP: 1.2s (good)
```

---

## 📝 Common Use Cases

### Track Salon Views

**File:** `frontend/src/app/salons/[id]/SalonProfileClient.tsx`

```typescript
import { useSalonView } from '@/hooks/useAnalytics';

export default function SalonProfileClient({ salon }) {
  // Add this line
  useSalonView(salon?.id, salon?.name);
  
  // ... rest of component
}
```

---

### Track Bookings

**File:** `frontend/src/components/BookingModal.tsx`

```typescript
import { analytics } from '@/lib/analytics';

const handleBookingSubmit = async (data) => {
  try {
    // Track booking started
    analytics.startBooking(service.id, service.title);
    
    const result = await submitBooking(data);
    
    // Track booking completed
    analytics.completeBooking(service.id, service.price);
    
    toast.success('Booking confirmed!');
  } catch (error) {
    // Errors are automatically tracked by Sentry
    toast.error('Booking failed');
  }
};
```

---

### Track Search

**File:** `frontend/src/components/FilterBar/FilterBar.tsx`

```typescript
import { analytics } from '@/lib/analytics';

const handleSearchClick = () => {
  const filters = buildFilters();
  
  // Track search
  if (filters.service) {
    analytics.search(filters.service, salons.length);
  }
  
  // Track filters applied
  if (Object.keys(filters).length > 1) {
    analytics.filterSalons(filters);
  }
  
  triggerSearch(filters, true);
};
```

---

### Track Product Views

**File:** `frontend/src/components/ProductCard.tsx`

```typescript
import { analytics } from '@/lib/analytics';

const ProductCard = ({ product }) => {
  const handleClick = () => {
    // Track product view
    analytics.viewProduct(product.id, product.name);
    
    router.push(`/products/${product.id}`);
  };
  
  return (
    <div onClick={handleClick}>
      {/* ... */}
    </div>
  );
};
```

---

### Track Add to Cart

**File:** Wherever you handle cart actions

```typescript
import { analytics } from '@/lib/analytics';

const handleAddToCart = (product) => {
  // Add to cart logic
  addToCart(product);
  
  // Track event
  analytics.addToCart(product.id, product.price);
  
  toast.success('Added to cart!');
};
```

---

### Track Reviews

**File:** `frontend/src/components/ReviewModal.tsx`

```typescript
import { analytics } from '@/lib/analytics';

const handleSubmitReview = async (reviewData) => {
  try {
    await submitReview(reviewData);
    
    // Track review submission
    analytics.submitReview(salon.id, reviewData.rating);
    
    toast.success('Review submitted!');
  } catch (error) {
    toast.error('Failed to submit review');
  }
};
```

---

### Track Favorites

**File:** `frontend/src/app/salons/page.tsx`

```typescript
import { analytics } from '@/lib/analytics';

const handleToggleFavorite = async (salonId) => {
  const salon = salons.find(s => s.id === salonId);
  const action = salon.isFavorited ? 'remove' : 'add';
  
  try {
    await toggleFavorite(salonId);
    
    // Track favorite action
    analytics.favoriteSalon(salonId, action);
    
    toast.success(action === 'add' ? 'Added to favorites' : 'Removed from favorites');
  } catch (error) {
    toast.error('Failed to update favorites');
  }
};
```

---

### Track Chat

**File:** `frontend/src/components/ChatWidget.tsx`

```typescript
import { analytics } from '@/lib/analytics';

const handleStartConversation = (recipientId) => {
  // Track conversation started
  analytics.startConversation(recipientId);
  
  // ... rest of logic
};

const handleSend = () => {
  // Track message sent
  analytics.sendMessage();
  
  // ... rest of logic
};
```

---

### Track Authentication

**File:** `frontend/src/components/Login.tsx` and `Register.tsx`

```typescript
import { analytics } from '@/lib/analytics';

// In Login.tsx
const handleLogin = async (credentials) => {
  try {
    await login(credentials);
    
    // Track successful login
    analytics.login('email');
    
    router.push('/dashboard');
  } catch (error) {
    toast.error('Login failed');
  }
};

// In Register.tsx
const handleRegister = async (userData) => {
  try {
    await register(userData);
    
    // Track successful sign-up
    analytics.signUp('email');
    
    router.push('/dashboard');
  } catch (error) {
    toast.error('Registration failed');
  }
};
```

---

### Track API Calls Performance

**File:** `frontend/src/lib/api.ts`

```typescript
import { trackAPICall } from '@/lib/performance';

export async function apiJson<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  // Get endpoint name from URL
  const endpoint = typeof input === 'string' ? input : input.toString();
  
  // Track API call performance
  return trackAPICall(endpoint, async () => {
    const res = await apiFetch(input, init);
    return res.json();
  });
}
```

---

## 🎯 Automatic Tracking

These are tracked automatically (no code changes needed):

✅ **Page Views** - Every page navigation
✅ **Errors** - All uncaught errors
✅ **Performance** - Web Vitals (LCP, FID, CLS)
✅ **API Errors** - Failed fetch requests
✅ **Route Changes** - Next.js navigation

---

## 🐛 Debugging

### Check if Analytics is Working:

```typescript
import { isAnalyticsEnabled } from '@/lib/analytics';

console.log('Analytics enabled:', isAnalyticsEnabled());
// Should log: true (if GA_MEASUREMENT_ID is set)
```

### Check if Sentry is Working:

```typescript
import * as Sentry from '@sentry/nextjs';

// Temporarily add to a page:
Sentry.captureMessage('Test Sentry integration');

// Should appear in Sentry dashboard within 1 minute
```

### View Events in Real-Time:

1. Open GA4 Dashboard
2. Go to Reports → Realtime
3. Navigate your app
4. See events appear in real-time

---

## 🔥 Advanced Usage

### Custom Event Tracking:

```typescript
import { event } from '@/lib/analytics';

// Track any custom event
event({
  action: 'video_play',
  category: 'engagement',
  label: 'Salon Tour Video',
  value: 1,
});
```

### Track User Properties:

```typescript
import { setUserProperties } from '@/lib/analytics';

// After user logs in
setUserProperties({
  userId: user.id,
  userRole: user.role,
  accountType: user.subscription,
  signUpDate: user.createdAt,
});
```

### E-commerce Tracking:

```typescript
import { ecommerce } from '@/lib/analytics';

// When showing product list
ecommerce.viewItemList(products.map(p => ({
  item_id: p.id,
  item_name: p.name,
  price: p.price,
})), 'Search Results');

// When user completes purchase
ecommerce.purchase(orderId, items, totalValue);
```

### Performance Tracking:

```typescript
import { perfMonitor } from '@/lib/performance';

const handleComplexOperation = async () => {
  // Automatic performance tracking
  return await perfMonitor.measure('complex-operation', async () => {
    return await complexOperation();
  });
};
```

### Error Context:

```typescript
import * as Sentry from '@sentry/nextjs';

try {
  await riskyOperation();
} catch (error) {
  // Add context to errors
  Sentry.captureException(error, {
    tags: {
      section: 'booking',
      feature: 'payment',
    },
    extra: {
      userId: user.id,
      salonId: salon.id,
      amount: booking.price,
    },
  });
}
```

---

## 📊 Metrics to Monitor

### Daily:
- [ ] Total page views
- [ ] Error rate (< 1%)
- [ ] Average session duration
- [ ] Conversion rate (bookings/views)

### Weekly:
- [ ] Top performing salons
- [ ] Most searched services
- [ ] User retention rate
- [ ] Performance metrics (LCP, FID, CLS)

### Monthly:
- [ ] Growth trends
- [ ] Feature adoption
- [ ] Revenue metrics
- [ ] User satisfaction (reviews)

---

## 🚨 Important Notes

1. **Privacy:** Never track sensitive data (passwords, credit cards, personal messages)
2. **Performance:** Tracking is async and doesn't block UI
3. **Development:** Analytics work in dev but can be disabled
4. **Testing:** Use separate GA4 property for testing
5. **Sentry:** Free tier is 5K errors/month (sufficient for small apps)

---

## 🎓 Learn More

- [Google Analytics 4 Docs](https://developers.google.com/analytics/devguides/collection/ga4)
- [Sentry Next.js Guide](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Web Vitals Explained](https://web.dev/vitals/)

---

## ✅ Checklist

Before deploying to production:

- [ ] Set GA4 Measurement ID in environment variables
- [ ] Set Sentry DSN in environment variables
- [ ] Test analytics in development
- [ ] Verify events appear in GA4 dashboard
- [ ] Test error tracking in Sentry
- [ ] Add tracking to key user actions
- [ ] Set up alerts in Sentry
- [ ] Create GA4 custom reports

---

**Need Help?**
- Check browser console for error messages
- Verify environment variables are set
- Test in incognito mode (disables extensions)
- Check GA4 Real-Time reports
- Review Sentry dashboard for errors
