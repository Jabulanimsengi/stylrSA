# Media Approval System Implementation

## Overview
Implemented a comprehensive admin approval system for before-and-after photos and short videos with complete notification workflows for both admins and users.

## Features Implemented

### 1. Database Schema Updates
- ✅ Added `rejectionReason` field to `BeforeAfterPhoto` model
- ✅ Added `rejectionReason` field to `ServiceVideo` model
- ✅ Both fields are optional strings to store admin feedback when rejecting content

### 2. Backend Notifications System

#### Before/After Photos (`backend/src/before-after/before-after.service.ts`)
- **Upload Notifications:**
  - Salon owner receives confirmation of submission
  - All admins are notified when new content is uploaded
  
- **Approval Notifications:**
  - Salon owner receives approval confirmation
  - Rejection reason is cleared on approval
  
- **Rejection Notifications:**
  - Salon owner receives rejection with specific reason
  - Default reason: "Content does not meet our guidelines"

#### Videos (`backend/src/videos/videos.service.ts`)
- **Upload Notifications:**
  - Salon owner receives confirmation of submission
  - All admins are notified when new content is uploaded
  
- **Approval Notifications:**
  - Salon owner receives approval confirmation
  - Rejection reason is cleared on approval
  
- **Rejection Notifications:**
  - Salon owner receives rejection with specific reason
  - Default reason: "Content does not meet our guidelines"

### 3. API Endpoints

#### Admin Centralized Endpoints (`backend/src/admin/admin.controller.ts`)
All accessible via `/api/admin` with ADMIN role guard:

**Before/After Photos:**
- `GET /before-after/pending` - Get all pending before/after photos
- `PATCH /before-after/:id/approve` - Approve a before/after photo
- `PATCH /before-after/:id/reject` - Reject with optional reason
  ```json
  { "reason": "Inappropriate content" }
  ```

**Videos:**
- `GET /videos/pending` - Get all pending videos
- `PATCH /videos/:id/approve` - Approve a video
- `PATCH /videos/:id/reject` - Reject with optional reason
  ```json
  { "reason": "Video quality does not meet standards" }
  ```

#### Original Module Endpoints
The original endpoints in `before-after.controller.ts` and `videos.controller.ts` remain functional for backward compatibility.

### 4. Frontend Admin UI

#### New Component: `AdminMediaReview`
Location: `frontend/src/components/AdminMediaReview.tsx`

**Features:**
- Tab-based interface for Photos and Videos
- Real-time count badges
- Side-by-side before/after photo display
- Embedded video player (Vimeo iframe)
- Detailed information display:
  - Salon name and location
  - Associated service (if any)
  - Caption
  - Upload date
  - Video duration (for videos)

**Actions:**
- **Approve:** One-click approval with instant feedback
- **Reject:** Opens a form to enter rejection reason
  - Required field validation
  - Confirmation/Cancel buttons
  - Reason is sent to backend and stored

**Styling:**
- Responsive grid layout
- Hover animations
- Gradient buttons matching app design
- Mobile-optimized (single column on small screens)

#### Integration in Admin Dashboard
- New "Media Review" tab added to admin page
- Located between "Pending Promotions" and "Deleted Profiles"
- Seamlessly integrated with existing tab system

### 5. Module Dependencies Updated
- `BeforeAfterModule` now imports `NotificationsModule`
- `VideosModule` now imports `NotificationsModule`
- `AdminModule` now imports `BeforeAfterModule` and `VideosModule`

## Notification Flow

### Upload Flow
1. Salon owner uploads media → 
2. Content status set to PENDING →
3. Notification sent to owner: "Submitted for approval" →
4. Notifications sent to all admins: "New content awaiting review"

### Approval Flow
1. Admin clicks "Approve" →
2. Status changed to APPROVED →
3. Notification sent to owner: "Content approved and now visible"

### Rejection Flow
1. Admin clicks "Reject" →
2. Admin enters rejection reason →
3. Status changed to REJECTED →
4. Notification sent to owner with reason →
5. Owner can see why content was rejected

## Database Migration
Executed `npx prisma db push` to sync schema:
- Added `rejectionReason` column to `BeforeAfterPhoto` table
- Added `rejectionReason` column to `ServiceVideo` table

## Notification Links
All notifications include direct links to relevant pages:
- Owners: `/dashboard/my-before-after` or `/dashboard/my-videos`
- Admins: `/admin/before-after-pending` or `/admin/videos-pending`

## Testing Checklist
- [ ] Upload before/after photos and verify admin notification
- [ ] Upload video and verify admin notification
- [ ] Approve content and verify owner notification
- [ ] Reject content with reason and verify owner receives it
- [ ] Check that approved content appears in public feeds
- [ ] Check that rejected content doesn't appear in public feeds
- [ ] Verify notification bell updates in real-time
- [ ] Test on mobile devices for responsive design

## Future Enhancements
- Bulk approve/reject actions
- Image preview lightbox for before/after photos
- Video preview without leaving the page
- Filter by salon/date range
- Statistics dashboard (approval rate, average review time)
- Email notifications in addition to in-app notifications
- Content flagging by users

## Files Modified

### Backend
1. `backend/prisma/schema.prisma` - Added rejectionReason fields
2. `backend/src/before-after/before-after.service.ts` - Added notifications
3. `backend/src/before-after/before-after.controller.ts` - Updated reject endpoint
4. `backend/src/before-after/before-after.module.ts` - Added NotificationsModule
5. `backend/src/videos/videos.service.ts` - Added notifications
6. `backend/src/videos/videos.controller.ts` - Updated reject endpoint
7. `backend/src/videos/videos.module.ts` - Added NotificationsModule
8. `backend/src/admin/admin.controller.ts` - Added media endpoints
9. `backend/src/admin/admin.module.ts` - Imported BeforeAfter and Videos modules

### Frontend
1. `frontend/src/components/AdminMediaReview.tsx` - New component
2. `frontend/src/components/AdminMediaReview.module.css` - New styles
3. `frontend/src/app/admin/page.tsx` - Added media review tab

## API Response Examples

### GET /api/admin/before-after/pending
```json
[
  {
    "id": "uuid",
    "beforeImageUrl": "https://cloudinary.com/...",
    "afterImageUrl": "https://cloudinary.com/...",
    "caption": "Hair transformation",
    "createdAt": "2025-10-25T12:00:00Z",
    "salon": {
      "id": "uuid",
      "name": "Beauty Salon",
      "city": "Cape Town",
      "province": "Western Cape"
    },
    "service": {
      "id": "uuid",
      "title": "Haircut & Color"
    }
  }
]
```

### GET /api/admin/videos/pending
```json
[
  {
    "id": "uuid",
    "videoUrl": "https://vimeo.com/...",
    "thumbnailUrl": "https://i.vimeocdn.com/...",
    "duration": 45,
    "caption": "Quick styling tutorial",
    "createdAt": "2025-10-25T12:00:00Z",
    "salon": {
      "id": "uuid",
      "name": "Hair Studio",
      "city": "Johannesburg",
      "province": "Gauteng",
      "planCode": "PRO"
    },
    "service": {
      "id": "uuid",
      "title": "Styling"
    }
  }
]
```

## Conclusion
The media approval system is now fully functional with comprehensive notifications. Admins can efficiently review and moderate content, while salon owners receive timely updates on their submission status with clear feedback when content is rejected.
