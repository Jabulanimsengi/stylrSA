# Promotion Booking Modal Flicker Fix

## Problem
When clicking "Book Now" on a promotion card, the screen was flickering and the booking confirmation modal was appearing incorrectly within the item card instead of as a proper overlay.

## Root Cause
The issue had two parts:

### 1. CSS Stacking Context Problem
The `.card` element in `PromotionCard.module.css` uses a `transform` property for hover effects:
```css
.card {
  transition: transform 0.2s, box-shadow 0.2s;
}

.card:hover {
  transform: translateY(-2px);
}
```

When a parent element has a `transform` property, it creates a **new stacking context**. This causes child elements with `position: fixed` to be positioned relative to the transformed parent instead of the viewport, making the modal appear trapped inside the card.

### 2. Rapid State Updates
The button's loading state was being reset immediately in a `finally` block while the modal was still opening, causing unnecessary re-renders and flickering.

## Solution

### Fixed Files:
1. `frontend/src/components/PromotionCard.tsx`
2. `frontend/src/components/BookingConfirmationModal/BookingConfirmationModal.tsx`
3. `frontend/src/components/BookingConfirmationModal/BookingConfirmationModal.module.css`
4. `frontend/src/components/PromotionDetailsModal/PromotionDetailsModal.tsx`

### Changes Made:

#### 1. React Portal Implementation
Both `BookingConfirmationModal` and `PromotionDetailsModal` now use **React Portal** to render at the document body level, completely outside the card's DOM hierarchy:

```tsx
import { createPortal } from 'react-dom';

// Render modal using portal at document body level
return createPortal(modalContent, document.body);
```

This ensures the modal's `position: fixed` works correctly relative to the viewport, not the card.

#### 2. Improved State Management
In `PromotionCard.tsx`:
- Removed the `finally` block that was resetting `isLoadingBooking` immediately
- Added `useCallback` hooks to memoize modal handlers
- Loading state now persists while the modal is open
- Loading state resets only when the user interacts with the modal (accept or cancel)

```tsx
const handleConfirmationAccept = useCallback(() => {
  setShowConfirmation(false);
  setSalonData(null);
  setIsLoadingBooking(false); // Reset here
  if (linkHref && linkHref !== '#') {
    router.push(linkHref);
  }
}, [linkHref, router]);
```

#### 3. Higher Z-Index
Increased the modal overlay z-index from `9998` to `10000` to ensure it appears above all other content.

## Benefits
- ✅ No more flickering when clicking "Book Now"
- ✅ Modal appears correctly as a full-screen overlay
- ✅ Better UX with button staying in "Loading..." state while modal is open
- ✅ No re-render issues from memoized handlers
- ✅ Works correctly regardless of parent element CSS properties

## Testing
Test the fix by:
1. Navigate to the Promotions page
2. Click "Book Now" on any promotion card
3. Verify the booking confirmation modal appears smoothly as a centered overlay
4. Verify no flickering occurs
5. Verify the button shows "Loading..." until you interact with the modal
