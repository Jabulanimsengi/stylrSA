# Featured/Recommended Salons Feature

## Overview
A monetization feature that allows admins to feature specific salon profiles on the homepage. Featured salons appear in a prominent carousel above the "Featured Services" section, giving them premium visibility.

## Business Model
- **Duration-based featuring**: Salons can be featured for 7, 14, 30, 60, or 90 days
- **Admin-controlled**: Only admins can feature/unfeature salons
- **Payment required**: This feature is designed to generate revenue for platform sustainability
- **Visibility boost**: Featured salons get premium placement on the homepage

## Implementation Details

### Backend APIs

#### Public Endpoint
- **GET** `/api/salons/featured`
  - Returns currently featured salons (where `featuredUntil > now()` and `approvalStatus = APPROVED`)
  - Ordered by `visibilityWeight DESC`
  - Includes favorite status if user is authenticated
  - Limit: 12 featured salons

#### Admin Endpoints
- **GET** `/api/admin/salons/featured/manage`
  - Returns: `{ featured: Salon[], available: Salon[] }`
  - `featured`: Currently featured salons
  - `available`: Approved salons not currently featured

- **POST** `/api/admin/salons/:salonId/feature`
  - Body: `{ durationDays: number }`
  - Features a salon for the specified duration
  - Sets `featuredUntil = now() + duration`
  - Notifies salon owner via in-app notification
  - Logs admin action

- **DELETE** `/api/admin/salons/:salonId/unfeature`
  - Removes featured status (sets `featuredUntil = null`)
  - Logs admin action

### Frontend Components

#### 1. SalonCard (Reusable Component)
**Location**: `frontend/src/components/SalonCard.tsx`

A reusable card component extracted from the explore page:
- Displays salon image, name, location, operating hours
- Includes favorite button (optional)
- Consistent styling across the app
- Responsive design

#### 2. FeaturedSalons Carousel
**Location**: `frontend/src/components/FeaturedSalons.tsx`

Features:
- **Responsive card display**:
  - Desktop (1200px+): 4 cards
  - Large tablet (1024-1199px): 3 cards
  - Tablet (768-1023px): 2 cards
  - Mobile (<768px): 1 card
- **Auto-advance**: Slides change every 5 seconds
- **Manual controls**: Previous/Next arrows and dot indicators
- **Pause on hover**: Auto-advance pauses when user hovers
- **Swipe-friendly**: Touch/swipe gestures supported
- **Favorite functionality**: Users can favorite salons directly from carousel
- **Loading states**: Skeleton loaders while fetching data

#### 3. Home Page Integration
**Location**: `frontend/src/app/page.tsx`

The "Recommended Salons" section appears:
- Above "Featured Services"
- Below the hero section
- Only visible when there are featured salons

#### 4. Admin Management UI
**Location**: `frontend/src/app/admin/page.tsx`

New "Featured Salons" tab in admin panel:
- **Currently Featured section**:
  - Lists all active featured salons
  - Shows expiration date
  - "Unfeature" button to remove
- **Feature a Salon section**:
  - Duration selector (7/14/30/60/90 days)
  - List of available approved salons
  - "Feature for X days" button
- Real-time updates after featuring/unfeaturing

### Database Schema
Uses existing `Salon` model with:
- `featuredUntil: DateTime?` - Expiration date for featured status
- `visibilityWeight: Int` - Determines ordering within featured salons
- `planCode: PlanCode` - Current subscription plan

### How to Use (Admin)

1. **Access Admin Panel**
   - Navigate to `/admin`
   - Click "Featured Salons" tab

2. **Feature a Salon**
   - Select duration from dropdown (7, 14, 30, 60, or 90 days)
   - Find the salon in the "Feature a Salon" list
   - Click "Feature for X days"
   - Salon owner receives notification

3. **Unfeature a Salon**
   - Find salon in "Currently Featured" list
   - Click "Unfeature" button
   - Featured status removed immediately

4. **Monitor Status**
   - "Currently Featured" shows expiration dates
   - Expired features automatically stop showing on homepage

### How It Works (User Experience)

1. **Homepage Visibility**
   - Featured salons appear in carousel below hero section
   - Section titled "Recommended Salons"
   - Auto-advances every 5 seconds
   - Users can navigate with arrows or dots

2. **Click Behavior**
   - Clicking a salon card navigates to full salon profile
   - Clicking favorite heart adds to user's favorites
   - Cards maintain consistent design with explore page

3. **Responsive Experience**
   - Mobile: Single card, swipeable
   - Tablet: 2-3 cards visible
   - Desktop: 4 cards visible
   - Smooth transitions between slides

### Monetization Strategy

**Pricing Tiers** (Suggested):
- 7 days: R149
- 14 days: R249
- 30 days: R449
- 60 days: R799
- 90 days: R1,099

**Payment Flow**:
1. Salon owner contacts admin/support
2. Agrees to featuring duration and price
3. Makes payment via existing payment methods
4. Admin verifies payment
5. Admin features the salon for agreed duration
6. Salon appears on homepage immediately

**Future Enhancements**:
- Self-service featuring (salon owners can purchase directly)
- Automated payment verification
- Featured status as part of premium plans
- Analytics dashboard showing featured performance
- A/B testing for featured positioning

### Testing Checklist

- [ ] Featured salons appear on homepage when `featuredUntil > now()`
- [ ] Expired features automatically disappear
- [ ] Carousel auto-advances every 5 seconds
- [ ] Pause on hover works correctly
- [ ] Navigation arrows work (prev/next)
- [ ] Dot indicators work
- [ ] Responsive layout shows correct number of cards per screen size
- [ ] Favorite button works in carousel
- [ ] Admin can feature a salon with duration
- [ ] Admin can unfeature a salon
- [ ] Salon owner receives notification when featured
- [ ] Featuring logs admin action
- [ ] Only approved salons can be featured
- [ ] Test on mobile (320px, 375px, 414px)
- [ ] Test on tablet (768px, 1024px)
- [ ] Test on desktop (1280px, 1920px)

### Files Modified/Created

**Backend**:
- `backend/src/salons/salons.controller.ts` - Added `GET /featured` endpoint
- `backend/src/salons/salons.service.ts` - Added `findFeatured()` method
- `backend/src/admin/admin.controller.ts` - Added feature/unfeature endpoints
- `backend/src/admin/admin.service.ts` - Added feature management methods

**Frontend**:
- `frontend/src/components/SalonCard.tsx` - NEW reusable component
- `frontend/src/components/SalonCard.module.css` - NEW styling
- `frontend/src/components/FeaturedSalons.tsx` - NEW carousel component
- `frontend/src/components/FeaturedSalons.module.css` - NEW carousel styling
- `frontend/src/app/page.tsx` - Added "Recommended Salons" section
- `frontend/src/app/admin/page.tsx` - Added "Featured Salons" tab and management UI

**Documentation**:
- `FEATURED_SALONS_FEATURE.md` - This file

### Next Steps

1. **Test the implementation**:
   ```bash
   # Terminal 1: Start backend
   cd backend
   npm run start:dev
   
   # Terminal 2: Start frontend
   cd frontend
   npm run dev
   ```

2. **Test as admin**:
   - Go to `/admin`
   - Click "Featured Salons" tab
   - Feature a salon for 7 days
   - Go to homepage and verify it appears

3. **Test responsive design**:
   - Use browser dev tools
   - Test at 320px, 768px, 1024px, 1920px widths
   - Verify correct number of cards shown

4. **Optional refactoring** (if desired):
   - Update explore salons page to use new `SalonCard` component
   - Reduces code duplication
   - Ensures consistent design

### Notes

- Featured salons are ordered by `visibilityWeight` (higher weight = better positioning)
- The `featuredUntil` field is already present in the database schema (no migration needed)
- Admin actions are logged to `AdminActionLog` table
- Salon owners receive in-app notifications when featured
- The feature integrates seamlessly with existing favorites system
- No breaking changes to existing functionality
