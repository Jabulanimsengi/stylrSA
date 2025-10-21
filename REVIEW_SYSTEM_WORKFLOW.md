# Review System Workflow - Complete Analysis

## Overview
The review system allows customers to leave reviews for salons after completing a booking. Reviews go through an admin approval process before becoming visible to the public.

---

## 1. Review Submission Process

### User Perspective (Client who made a booking)

**Where users can leave reviews:**
- **Location**: `/my-bookings` page
- **Trigger**: "Leave a Review" button appears ONLY for bookings with status `COMPLETED` that don't already have a review

**Component Flow:**
1. User navigates to "My Bookings" page (`frontend/src/app/my-bookings/page.tsx`)
2. Past bookings tab shows completed bookings
3. Each completed booking without a review displays a "Leave a Review" button
4. Clicking the button opens `ReviewModal` component

**ReviewModal (frontend/src/components/ReviewModal.tsx):**
- User selects a star rating (1-5 stars, **required**)
- User writes a comment (text field, **required**)
- On submit:
  - POST request to `/api/reviews`
  - Payload: `{ bookingId, rating, comment }`
  - Success: Toast notification "Thank you for your review!"

---

## 2. Backend Processing

### Review Creation (backend/src/reviews/reviews.service.ts)

**Validation:**
```typescript
- Booking must exist
- Booking must belong to the user submitting the review
- User can only review their own bookings
```

**Database Record:**
```typescript
Review {
  rating: number (1-5)
  comment: string
  authorId: string (user who wrote it)
  salonId: string (from booking)
  bookingId: string (links to booking)
  approvalStatus: 'PENDING' (default)
}
```

**Notifications Sent:**
- **Recipient**: ALL users with role `ADMIN`
- **Message**: "New review by [Author Name] for salon '[Salon Name]' is pending approval."
- **Link**: `/admin?tab=reviews`
- **Socket Event**: `newNotification` (real-time)

**Important**: Salon owners are NOT notified at this stage - only admins.

---

## 3. Admin Approval Process

### Admin Panel (frontend/src/app/admin/page.tsx)

**Location**: `/admin?tab=reviews`

**Admin View:**
- Shows all pending reviews
- Each review displays:
  - Author name
  - Salon name
  - Rating (stars)
  - Comment text
  - Approve/Reject buttons

### Backend Approval (backend/src/admin/admin.service.ts)

**Endpoint**: `PATCH /api/admin/reviews/:reviewId/status`

**When Admin Approves:**
1. Review `approvalStatus` updated to `APPROVED`
2. Salon's `avgRating` recalculated based on all APPROVED reviews
3. **Author notification sent:**
   - Message: "Your review for [Salon Name] has been approved."
   - Link: `/my-profile?tab=reviews`
   - Socket Event: `newNotification`

**When Admin Rejects:**
1. Review `approvalStatus` updated to `REJECTED`
2. **Author notification sent:**
   - Message: "Your review for [Salon Name] has been rejected."
   - Link: `/my-profile?tab=reviews`

**Critical Finding: Salon owners are NOT notified when reviews are approved or rejected**

---

## 4. Review Display to Public

### Where Reviews Appear

**Salon Profile Page (frontend/src/app/salons/[id]/SalonProfileClient.tsx):**
- Location: `/salons/:id`
- Reviews section shows in "Reviews" accordion
- **Only APPROVED reviews are displayed** (filtered in backend)

**Backend Filtering (backend/src/salons/salons.service.ts):**
```typescript
findOne(id: string) {
  return prisma.salon.findUnique({
    where: { id },
    include: {
      reviews: {
        where: { approvalStatus: 'APPROVED' },  // ✅ Only approved
        include: {
          author: {
            select: { firstName, lastName }
          }
        }
      }
    }
  })
}
```

**Display Format:**
- Author name (First name + Last initial)
- Star rating (★★★★☆)
- Comment text
- Lazy loading (shows 4 initially, loads more on scroll)

---

## 5. Notification System Summary

### Who Gets Notified and When:

| Event | Recipient | Message | Link | Timing |
|-------|-----------|---------|------|--------|
| Review submitted | ALL Admins | "New review by [Name] for salon '[Salon]' is pending approval." | `/admin?tab=reviews` | Immediate (socket + notification) |
| Review approved | Review Author | "Your review for [Salon] has been approved." | `/my-profile?tab=reviews` | Immediate (socket + notification) |
| Review rejected | Review Author | "Your review for [Salon] has been rejected." | `/my-profile?tab=reviews` | Immediate (socket + notification) |
| Booking completed | User | "Your booking for [Service] has been completed." | `/my-bookings` | When salon owner marks booking complete |

### Who Does NOT Get Notified:
- **Salon owners**: No notification when reviews are submitted, approved, or rejected
- **Salon owners**: Must check their salon profile page manually to see new reviews

---

## 6. User Journey for Leaving a Review

```
1. User books a service → Status: PENDING
2. Salon owner confirms booking → Status: CONFIRMED
3. Service is provided
4. Salon owner marks booking complete → Status: COMPLETED
   └─> User gets notification: "Your booking for [Service] has been completed."
5. User visits /my-bookings page
6. Under "Past" tab, sees completed booking with "Leave a Review" button
7. Clicks button → ReviewModal opens
8. Submits rating + comment
   └─> Review saved with approvalStatus: 'PENDING'
   └─> All admins notified
9. Admin reviews submission at /admin?tab=reviews
10. Admin approves review
    └─> Review becomes visible on salon profile
    └─> User notified of approval
    └─> Salon avgRating recalculated
```

---

## 7. Identified Gaps

### Missing Features:

1. **No automatic reminder to leave reviews**
   - Users are not proactively reminded after completing a booking
   - They must remember to visit "My Bookings" page

2. **Salon owners have no visibility into pending reviews**
   - Cannot see that a review has been submitted
   - Cannot respond to reviews
   - Cannot see their pending reviews

3. **No notification to salon owners when reviews are approved**
   - Salon owners discover new reviews only by checking their profile
   - No dashboard or notification system for new reviews

4. **No review management in salon owner dashboard**
   - Salon owners cannot see a list of all their reviews
   - No analytics or insights about review ratings
   - No ability to respond to reviews

5. **Booking status "COMPLETED" is manual**
   - Salon owners must manually mark bookings as complete
   - No automatic completion after booking date/time passes
   - If salon owner forgets, users cannot leave reviews

---

## 8. API Endpoints Summary

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| POST | `/api/reviews` | JWT (user) | Create a new review |
| GET | `/api/admin/reviews/pending` | JWT (admin) | List pending reviews |
| PATCH | `/api/admin/reviews/:id/status` | JWT (admin) | Approve/reject review |
| GET | `/api/salons/:id` | Optional JWT | Fetch salon (includes approved reviews) |
| GET | `/api/bookings/my-bookings` | JWT (user) | List user's bookings |
| PATCH | `/api/bookings/:id/status` | JWT (salon owner) | Update booking status |

---

## 9. Database Schema Relationships

```
User (customer)
  └─> Booking (userId)
       └─> Review (bookingId)
            ├─> authorId → User
            └─> salonId → Salon
                 └─> ownerId → User (salon owner)

Review fields:
- id: string
- rating: number (1-5)
- comment: string
- authorId: string
- salonId: string
- bookingId: string (unique - one review per booking)
- approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED'
- createdAt: DateTime
- updatedAt: DateTime
```

---

## 10. Key Files Reference

### Frontend:
- `frontend/src/components/ReviewModal.tsx` - Review submission form
- `frontend/src/app/my-bookings/page.tsx` - Where users can leave reviews
- `frontend/src/app/salons/[id]/SalonProfileClient.tsx` - Where reviews are displayed
- `frontend/src/app/admin/page.tsx` - Admin review management

### Backend:
- `backend/src/reviews/reviews.controller.ts` - Review API endpoints
- `backend/src/reviews/reviews.service.ts` - Review business logic
- `backend/src/admin/admin.service.ts` - Admin approval logic
- `backend/src/salons/salons.service.ts` - Salon data fetching (with reviews)
- `backend/src/bookings/bookings.service.ts` - Booking status management

---

## Conclusion

The review system is functional but has significant gaps in user experience:

1. **Manual Process**: Relies on users remembering to leave reviews
2. **No Salon Owner Involvement**: Owners are completely excluded from the review lifecycle
3. **Limited Automation**: No automatic reminders or status updates
4. **No Review Response**: Salon owners cannot respond to reviews

**Recommendations for Improvement:**
- Add automated email/notification reminders 24-48 hours after booking completion
- Create a reviews section in salon owner dashboard
- Notify salon owners when new reviews are approved
- Allow salon owners to respond to reviews
- Consider auto-completing bookings after scheduled time + buffer period
