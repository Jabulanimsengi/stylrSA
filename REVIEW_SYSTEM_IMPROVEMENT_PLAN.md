# Review System Improvement - Implementation Plan

## Overview
This document outlines the complete implementation for an improved review system with automated notifications, salon owner responses, and visual review badges.

---

## Phase 1: Backend Database Schema Changes

### 1.1 Update Review Model (Prisma Schema)

**File**: `backend/prisma/schema.prisma`

```prisma
model Review {
  id              String   @id @default(uuid())
  rating          Int
  comment         String
  salonOwnerResponse String?  // NEW: Salon owner's response to review
  salonOwnerRespondedAt DateTime? // NEW: When salon owner responded
  authorId        String
  author          User     @relation("ReviewAuthor", fields: [authorId], references: [id])
  salonId         String
  salon           Salon    @relation(fields: [salonId], references: [id], onDelete: Cascade)
  bookingId       String   @unique
  booking         Booking  @relation(fields: [bookingId], references: [id])
  approvalStatus  ApprovalStatus @default(PENDING)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}
```

**Migration Command:**
```bash
npx prisma migrate dev --name add_salon_owner_response_to_reviews
```

---

## Phase 2: Backend Service Updates

### 2.1 Update Booking Completion Flow

**File**: `backend/src/bookings/bookings.service.ts`

**Current Code:**
```typescript
async updateStatus(user: any, id: string, status: 'CONFIRMED' | 'CANCELLED' | 'COMPLETED')
```

**Update to:**
```typescript
async updateStatus(
  user: any,
  id: string,
  status: 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'DECLINED',
) {
  // ... existing validation ...

  const updatedBooking = await this.prisma.booking.update({
    where: { id },
    data: { status },
  });

  // Existing notification
  let notificationMessage = `Your booking for ${booking.service.title} has been ${status.toLowerCase()}.`;
  
  // NEW: Special message for COMPLETED bookings
  if (status === 'COMPLETED') {
    notificationMessage = `Your booking for ${booking.service.title} at ${booking.service.salon.name} is complete! We'd love to hear about your experience. Please leave a review.`;
  }

  const notification = await this.notificationsService.create(
    booking.userId,
    notificationMessage,
    {
      bookingId: booking.id,
      link: status === 'COMPLETED' ? '/my-bookings?action=review' : '/my-bookings',
    },
  );

  this.eventsGateway.sendNotificationToUser(
    booking.userId,
    'newNotification',
    notification,
  );

  return updatedBooking;
}
```

---

### 2.2 Update Review Approval to Notify Salon Owner

**File**: `backend/src/admin/admin.service.ts`

**Find the `updateReviewStatus` method and update:**

```typescript
async updateReviewStatus(
  reviewId: string,
  status: ApprovalStatus,
  adminId?: string,
) {
  const existing = await this.prisma.review.findUnique({
    where: { id: reviewId },
    select: { 
      salonId: true,
      rating: true,
      comment: true,
    },
  });
  
  const updated = await this.prisma.review.update({
    where: { id: reviewId },
    data: { approvalStatus: status },
    include: {
      author: { 
        select: { 
          id: true,
          firstName: true,
          lastName: true,
        } 
      },
      salon: { 
        select: { 
          name: true,
          ownerId: true,  // NEW: Get salon owner ID
        } 
      },
    },
  });

  // Recalculate salon average rating
  if (existing?.salonId) {
    const agg = await this.prisma.review.aggregate({
      where: { salonId: existing.salonId, approvalStatus: 'APPROVED' },
      _avg: { rating: true },
    });
    await this.prisma.salon.update({
      where: { id: existing.salonId },
      data: { avgRating: agg._avg.rating ?? 0 },
    });
  }

  // Notify review author
  if (updated.author) {
    const authorMessage = `Your review for ${updated.salon?.name ?? 'the salon'} has been ${status.toLowerCase()}.`;
    const authorNotification = await this.notificationsService.create(
      updated.author.id,
      authorMessage,
      { link: '/my-profile?tab=reviews' },
    );
    this.eventsGateway.sendNotificationToUser(
      updated.author.id,
      'newNotification',
      authorNotification,
    );
  }

  // NEW: Notify salon owner when review is approved
  if (status === 'APPROVED' && updated.salon?.ownerId) {
    const authorName = updated.author
      ? `${updated.author.firstName} ${updated.author.lastName.charAt(0)}.`
      : 'A customer';
    
    const ownerMessage = `${authorName} left a ${updated.rating}-star review for your salon. Tap to view and respond.`;
    
    const ownerNotification = await this.notificationsService.create(
      updated.salon.ownerId,
      ownerMessage,
      { link: '/dashboard?tab=reviews' },
    );
    
    this.eventsGateway.sendNotificationToUser(
      updated.salon.ownerId,
      'newNotification',
      ownerNotification,
    );
  }

  if (adminId) {
    void this.logAction({
      adminId,
      action: 'REVIEW_STATUS_UPDATE',
      targetType: 'REVIEW',
      targetId: reviewId,
      metadata: { status },
    });
  }

  return updated;
}
```

---

### 2.3 Create Review Response Endpoints

**File**: `backend/src/reviews/reviews.controller.ts`

```typescript
import { Controller, Post, Body, UseGuards, Param, Get, Patch } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/auth/decorator/get-user.decorator';
import { CreateReviewDto } from './dto/create-review.dto';

@Controller('api/reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  create(@Body() createReviewDto: CreateReviewDto, @GetUser() user: any) {
    return this.reviewsService.create(user.id, createReviewDto);
  }

  // NEW: Get salon owner's reviews
  @UseGuards(AuthGuard('jwt'))
  @Get('my-salon-reviews')
  getMySalonReviews(@GetUser() user: any) {
    return this.reviewsService.getSalonOwnerReviews(user.id);
  }

  // NEW: Respond to a review
  @UseGuards(AuthGuard('jwt'))
  @Patch(':reviewId/respond')
  respondToReview(
    @Param('reviewId') reviewId: string,
    @Body() body: { response: string },
    @GetUser() user: any,
  ) {
    return this.reviewsService.respondToReview(reviewId, user.id, body.response);
  }
}
```

---

### 2.4 Implement Review Response Service Methods

**File**: `backend/src/reviews/reviews.service.ts`

```typescript
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { EventsGateway } from '../events/events.gateway';

@Injectable()
export class ReviewsService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
    private eventsGateway: EventsGateway,
  ) {}

  // ... existing create method ...

  // NEW: Get all reviews for salon owner's salon
  async getSalonOwnerReviews(userId: string) {
    // Find the salon owned by this user
    const salon = await this.prisma.salon.findFirst({
      where: { ownerId: userId },
      select: { id: true },
    });

    if (!salon) {
      throw new NotFoundException('You do not own a salon.');
    }

    // Get all reviews for this salon
    const reviews = await this.prisma.review.findMany({
      where: { salonId: salon.id },
      include: {
        author: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        booking: {
          include: {
            service: {
              select: {
                title: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Group by status
    return {
      pending: reviews.filter((r) => r.approvalStatus === 'PENDING'),
      approved: reviews.filter((r) => r.approvalStatus === 'APPROVED'),
      needsResponse: reviews.filter(
        (r) => r.approvalStatus === 'APPROVED' && !r.salonOwnerResponse,
      ),
    };
  }

  // NEW: Respond to a review
  async respondToReview(reviewId: string, userId: string, response: string) {
    // Get the review and verify ownership
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
      include: {
        salon: {
          select: {
            ownerId: true,
            name: true,
          },
        },
        author: {
          select: {
            id: true,
            firstName: true,
          },
        },
      },
    });

    if (!review) {
      throw new NotFoundException('Review not found.');
    }

    if (review.salon.ownerId !== userId) {
      throw new ForbiddenException(
        'You can only respond to reviews for your own salon.',
      );
    }

    if (review.approvalStatus !== 'APPROVED') {
      throw new ForbiddenException(
        'You can only respond to approved reviews.',
      );
    }

    // Update the review with the response
    const updated = await this.prisma.review.update({
      where: { id: reviewId },
      data: {
        salonOwnerResponse: response.trim(),
        salonOwnerRespondedAt: new Date(),
      },
    });

    // Notify the review author
    const notification = await this.notificationsService.create(
      review.author.id,
      `${review.salon.name} responded to your review.`,
      { link: `/salons/${review.salonId}?highlight=review-${reviewId}` },
    );

    this.eventsGateway.sendNotificationToUser(
      review.author.id,
      'newNotification',
      notification,
    );

    return updated;
  }
}
```

---

## Phase 3: Frontend - Dashboard "My Reviews" Tab

### 3.1 Update Dashboard Component

**File**: `frontend/src/app/dashboard/page.tsx`

**Add new tab:**

```typescript
const [activeTab, setActiveTab] = useState<'services' | 'bookings' | 'reviews' | 'gallery'>('services');
```

**Add tab button in the tabs section:**

```tsx
<button
  onClick={() => setActiveTab('reviews')}
  className={`${styles.tabButton} ${activeTab === 'reviews' ? styles.activeTab : ''}`}
>
  My Reviews
</button>
```

**Add conditional rendering:**

```tsx
{activeTab === 'reviews' && <ReviewsTab />}
```

---

### 3.2 Create ReviewsTab Component

**File**: `frontend/src/components/ReviewsTab/ReviewsTab.tsx`

```tsx
'use client';

import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import styles from './ReviewsTab.module.css';

interface Review {
  id: string;
  rating: number;
  comment: string;
  salonOwnerResponse: string | null;
  salonOwnerRespondedAt: string | null;
  approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  author: {
    firstName: string;
    lastName: string;
  };
  booking: {
    service: {
      title: string;
    };
  };
}

interface ReviewsData {
  pending: Review[];
  approved: Review[];
  needsResponse: Review[];
}

export default function ReviewsTab() {
  const [reviews, setReviews] = useState<ReviewsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [respondingTo, setRespondingTo] = useState<string | null>(null);
  const [responseText, setResponseText] = useState('');
  const [view, setView] = useState<'needsResponse' | 'approved' | 'pending'>('needsResponse');

  const fetchReviews = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/reviews/my-salon-reviews', {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to fetch reviews');
      const data = await res.json();
      setReviews(data);
    } catch (error) {
      toast.error('Failed to load reviews');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleRespond = async (reviewId: string) => {
    if (!responseText.trim()) {
      toast.error('Please enter a response');
      return;
    }

    try {
      const res = await fetch(`/api/reviews/${reviewId}/respond`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ response: responseText }),
      });

      if (!res.ok) throw new Error('Failed to submit response');

      toast.success('Response submitted successfully!');
      setRespondingTo(null);
      setResponseText('');
      fetchReviews();
    } catch (error) {
      toast.error('Failed to submit response');
    }
  };

  if (isLoading) {
    return <div className={styles.loading}>Loading reviews...</div>;
  }

  if (!reviews) {
    return <div className={styles.empty}>No reviews yet</div>;
  }

  const currentReviews = reviews[view];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>My Reviews</h2>
        <div className={styles.stats}>
          <span className={styles.statItem}>
            Needs Response: <strong>{reviews.needsResponse.length}</strong>
          </span>
          <span className={styles.statItem}>
            Pending Approval: <strong>{reviews.pending.length}</strong>
          </span>
          <span className={styles.statItem}>
            Total Approved: <strong>{reviews.approved.length}</strong>
          </span>
        </div>
      </div>

      <div className={styles.tabs}>
        <button
          onClick={() => setView('needsResponse')}
          className={`${styles.tabButton} ${view === 'needsResponse' ? styles.activeTab : ''}`}
        >
          Needs Response ({reviews.needsResponse.length})
        </button>
        <button
          onClick={() => setView('approved')}
          className={`${styles.tabButton} ${view === 'approved' ? styles.activeTab : ''}`}
        >
          All Approved ({reviews.approved.length})
        </button>
        <button
          onClick={() => setView('pending')}
          className={`${styles.tabButton} ${view === 'pending' ? styles.activeTab : ''}`}
        >
          Pending Approval ({reviews.pending.length})
        </button>
      </div>

      <div className={styles.reviewsList}>
        {currentReviews.length === 0 ? (
          <div className={styles.empty}>
            {view === 'needsResponse' && 'All reviews have been responded to!'}
            {view === 'pending' && 'No reviews pending approval.'}
            {view === 'approved' && 'No approved reviews yet.'}
          </div>
        ) : (
          currentReviews.map((review) => (
            <div key={review.id} className={styles.reviewCard}>
              <div className={styles.reviewHeader}>
                <div className={styles.authorInfo}>
                  <strong>
                    {review.author.firstName} {review.author.lastName.charAt(0)}.
                  </strong>
                  <span className={styles.service}>
                    for {review.booking.service.title}
                  </span>
                </div>
                <div className={styles.rating}>
                  {'★'.repeat(review.rating)}
                  {'☆'.repeat(5 - review.rating)}
                </div>
              </div>

              <p className={styles.comment}>{review.comment}</p>

              {review.salonOwnerResponse && (
                <div className={styles.response}>
                  <strong>Your Response:</strong>
                  <p>{review.salonOwnerResponse}</p>
                  <span className={styles.responseDate}>
                    Responded on{' '}
                    {new Date(review.salonOwnerRespondedAt!).toLocaleDateString()}
                  </span>
                </div>
              )}

              {!review.salonOwnerResponse && view === 'needsResponse' && (
                <>
                  {respondingTo === review.id ? (
                    <div className={styles.responseForm}>
                      <textarea
                        value={responseText}
                        onChange={(e) => setResponseText(e.target.value)}
                        placeholder="Write your response to this review..."
                        className={styles.textarea}
                        rows={4}
                      />
                      <div className={styles.responseActions}>
                        <button
                          onClick={() => setRespondingTo(null)}
                          className={styles.cancelButton}
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleRespond(review.id)}
                          className={styles.submitButton}
                        >
                          Submit Response
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setRespondingTo(review.id)}
                      className={styles.respondButton}
                    >
                      Respond to this review
                    </button>
                  )}
                </>
              )}

              <div className={styles.reviewFooter}>
                <span className={styles.date}>
                  {new Date(review.createdAt).toLocaleDateString()}
                </span>
                <span className={`${styles.status} ${styles[review.approvalStatus.toLowerCase()]}`}>
                  {review.approvalStatus}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
```

---

### 3.3 Create ReviewsTab Styles

**File**: `frontend/src/components/ReviewsTab/ReviewsTab.module.css`

```css
.container {
  padding: 1.5rem;
}

.header {
  margin-bottom: 2rem;
}

.header h2 {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: var(--color-text-strong);
}

.stats {
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
}

.statItem {
  font-size: 0.9rem;
  color: var(--color-text-muted);
}

.statItem strong {
  color: var(--color-primary);
  font-size: 1.1rem;
}

.tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  border-bottom: 2px solid var(--color-border);
  padding-bottom: 0.5rem;
}

.tabButton {
  padding: 0.5rem 1rem;
  border: none;
  background: transparent;
  color: var(--color-text-muted);
  font-weight: 600;
  cursor: pointer;
  border-radius: 0.5rem;
  transition: all 0.2s ease;
}

.tabButton:hover {
  background: var(--color-surface-elevated);
  color: var(--color-text-strong);
}

.activeTab {
  background: var(--color-primary);
  color: white;
}

.activeTab:hover {
  background: var(--color-primary);
  color: white;
}

.reviewsList {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.reviewCard {
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  border-radius: 0.75rem;
  padding: 1.5rem;
  transition: box-shadow 0.2s ease;
}

.reviewCard:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.reviewHeader {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.authorInfo {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.authorInfo strong {
  font-size: 1rem;
  color: var(--color-text-strong);
}

.service {
  font-size: 0.85rem;
  color: var(--color-text-muted);
}

.rating {
  font-size: 1.2rem;
  color: var(--accent-gold);
}

.comment {
  margin: 1rem 0;
  padding: 1rem;
  background: var(--color-surface);
  border-left: 3px solid var(--color-primary);
  border-radius: 0.5rem;
  font-style: italic;
  color: var(--color-text);
}

.response {
  margin-top: 1rem;
  padding: 1rem;
  background: var(--color-surface-subtle);
  border-left: 3px solid var(--color-success);
  border-radius: 0.5rem;
}

.response strong {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--color-text-strong);
}

.response p {
  color: var(--color-text);
  margin-bottom: 0.5rem;
}

.responseDate {
  font-size: 0.8rem;
  color: var(--color-text-muted);
}

.responseForm {
  margin-top: 1rem;
}

.textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: 0.5rem;
  font-family: inherit;
  font-size: 0.95rem;
  resize: vertical;
  background: var(--color-surface);
  color: var(--color-text);
}

.textarea:focus {
  outline: none;
  border-color: var(--color-primary);
}

.responseActions {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.75rem;
  justify-content: flex-end;
}

.cancelButton,
.submitButton {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.cancelButton {
  background: var(--color-surface-elevated);
  color: var(--color-text-strong);
}

.cancelButton:hover {
  background: var(--color-surface-subtle);
}

.submitButton {
  background: var(--color-primary);
  color: white;
}

.submitButton:hover {
  background: var(--color-primary-dark);
}

.respondButton {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.respondButton:hover {
  background: var(--color-primary-dark);
}

.reviewFooter {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--color-border);
}

.date {
  font-size: 0.85rem;
  color: var(--color-text-muted);
}

.status {
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
}

.status.pending {
  background: rgba(255, 165, 0, 0.15);
  color: orange;
}

.status.approved {
  background: rgba(34, 197, 94, 0.15);
  color: green;
}

.status.rejected {
  background: rgba(239, 68, 68, 0.15);
  color: red;
}

.loading,
.empty {
  text-align: center;
  padding: 3rem;
  color: var(--color-text-muted);
  font-size: 1rem;
}

@media (max-width: 768px) {
  .container {
    padding: 1rem;
  }

  .header h2 {
    font-size: 1.25rem;
  }

  .stats {
    gap: 1rem;
  }

  .reviewCard {
    padding: 1rem;
  }

  .tabs {
    flex-direction: column;
  }

  .tabButton {
    width: 100%;
  }
}
```

---

## Phase 4: Visual Review Badge Component

### 4.1 Create ReviewBadge Component

**File**: `frontend/src/components/ReviewBadge/ReviewBadge.tsx`

```tsx
import styles from './ReviewBadge.module.css';

interface ReviewBadgeProps {
  reviewCount: number;
  avgRating: number;
}

export default function ReviewBadge({ reviewCount, avgRating }: ReviewBadgeProps) {
  if (reviewCount === 0) return null;

  return (
    <div className={styles.badge}>
      <div className={styles.rating}>{avgRating.toFixed(1)}</div>
      <div className={styles.count}>({reviewCount})</div>
    </div>
  );
}
```

---

### 4.2 Create ReviewBadge Styles

**File**: `frontend/src/components/ReviewBadge/ReviewBadge.module.css`

```css
.badge {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.35rem 0.5rem;
  background: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(8px);
  border-radius: 0.375rem;
  color: white;
  font-weight: 700;
  z-index: 2;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.rating {
  font-size: 0.9rem;
  color: var(--accent-gold);
  display: flex;
  align-items: center;
  gap: 0.15rem;
}

.rating::before {
  content: '★';
  font-size: 0.85rem;
}

.count {
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.85);
  font-weight: 600;
}

@media (max-width: 768px) {
  .badge {
    padding: 0.25rem 0.4rem;
  }

  .rating {
    font-size: 0.8rem;
  }

  .rating::before {
    font-size: 0.75rem;
  }

  .count {
    font-size: 0.65rem;
  }
}
```

---

### 4.3 Add ReviewBadge to Salon Cards

**File**: `frontend/src/app/salons/page.tsx`

**Update the salon card rendering:**

```tsx
import ReviewBadge from '@/components/ReviewBadge/ReviewBadge';

// In the salonGrid map function:
<div className={styles.salonCard}>
  <button /* favorite button */ />
  
  {/* NEW: Add review badge */}
  <ReviewBadge 
    reviewCount={salon.reviews?.length || 0} 
    avgRating={salon.avgRating || 0} 
  />
  
  <Link href={`/salons/${salon.id}`} className={styles.salonLink}>
    {/* existing content */}
  </Link>
</div>
```

---

### 4.4 Add ReviewBadge to Service Cards

**File**: `frontend/src/components/ServiceCard.tsx`

```tsx
import ReviewBadge from '@/components/ReviewBadge/ReviewBadge';

export default function ServiceCard({ service, onBook, onSendMessage, onImageClick }: ServiceCardProps) {
  return (
    <div className={styles.card}>
      <div className={styles.imageWrapper} onClick={handleImageClick}>
        {/* NEW: Add review badge */}
        <ReviewBadge 
          reviewCount={service.salon?.reviews?.length || 0} 
          avgRating={service.salon?.avgRating || 0} 
        />
        
        <Image /* existing image */ />
      </div>
      {/* rest of the card */}
    </div>
  );
}
```

---

## Phase 5: Update Types

**File**: `frontend/src/types/index.ts`

```typescript
export interface Review {
  id: string;
  rating: number;
  comment: string;
  salonOwnerResponse: string | null;  // NEW
  salonOwnerRespondedAt: string | null;  // NEW
  approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  author: {
    id: string;
    firstName: string;
    lastName: string;
  };
  booking?: {
    service: {
      title: string;
    };
  };
}

export interface Salon {
  id: string;
  name: string;
  avgRating: number;  // Make sure this exists
  reviews?: Review[];  // Make sure this is included in API responses
  // ... other fields
}
```

---

## Implementation Summary

### What We're Building:

1. **Automated Notification Flow**
   - User completes booking → Gets "Leave a review" notification
   - User submits review → Admin notified
   - Admin approves → Salon owner AND user notified
   - Salon owner responds → User notified

2. **Salon Owner Dashboard - My Reviews Tab**
   - View all reviews (pending, approved, needs response)
   - Statistics overview
   - Respond to approved reviews
   - Track review status

3. **Visual Review Badges**
   - Small transparent box with white text
   - Shows: ★4.5 (12) format
   - Appears on salon cards and service cards
   - Top-right corner positioning

### Files to Create:
- `frontend/src/components/ReviewsTab/ReviewsTab.tsx`
- `frontend/src/components/ReviewsTab/ReviewsTab.module.css`
- `frontend/src/components/ReviewBadge/ReviewBadge.tsx`
- `frontend/src/components/ReviewBadge/ReviewBadge.module.css`

### Files to Modify:
- `backend/prisma/schema.prisma`
- `backend/src/bookings/bookings.service.ts`
- `backend/src/admin/admin.service.ts`
- `backend/src/reviews/reviews.controller.ts`
- `backend/src/reviews/reviews.service.ts`
- `frontend/src/app/dashboard/page.tsx`
- `frontend/src/app/salons/page.tsx`
- `frontend/src/components/ServiceCard.tsx`
- `frontend/src/types/index.ts`

---

## Next Steps

Would you like me to:
1. Start implementing Phase 1 (Backend changes)?
2. Create all the necessary files?
3. Update the existing files with the new code?

Let me know which phase you'd like to tackle first!
