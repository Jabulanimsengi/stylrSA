# Backend Review System - Testing Guide

## Server Status: ✅ RUNNING

The backend server is running successfully with all new endpoints loaded.

---

## 🧪 Test Scenarios

### Prerequisite: Get Authentication Tokens

You'll need JWT tokens for different user roles:
- **Customer Token**: A user who has made bookings
- **Salon Owner Token**: A user who owns a salon (role: SALON_OWNER)
- **Admin Token**: A user with admin privileges (role: ADMIN)

---

## Test 1: Booking Completion → Customer Notification

### Setup:
1. Login as **Salon Owner**
2. Find a booking with status `CONFIRMED`
3. Mark it as `COMPLETED`

### Test Request:
```bash
curl -X PATCH http://localhost:3000/api/bookings/{bookingId}/status \
  -H "Content-Type: application/json" \
  -H "Cookie: access_token=YOUR_SALON_OWNER_JWT" \
  -d '{
    "status": "COMPLETED"
  }'
```

### Expected Results:
✅ Booking status changed to `COMPLETED`  
✅ Customer receives notification:  
   - Message: "Your booking for [Service] at [Salon] is complete! We'd love to hear about your experience. Please leave a review."  
   - Link: `/my-bookings?action=review`  
✅ Notification appears in customer's notification list  
✅ Socket event `newNotification` emitted to customer

---

## Test 2: Customer Submits Review

### Setup:
1. Login as **Customer**
2. Use a completed booking ID

### Test Request:
```bash
curl -X POST http://localhost:3000/api/reviews \
  -H "Content-Type: application/json" \
  -H "Cookie: access_token=YOUR_CUSTOMER_JWT" \
  -d '{
    "bookingId": "completed-booking-uuid",
    "rating": 5,
    "comment": "Excellent service! Highly recommend."
  }'
```

### Expected Results:
✅ Review created with `approvalStatus: PENDING`  
✅ All admins receive notification:  
   - Message: "New review by [Customer Name] for salon '[Salon Name]' is pending approval."  
   - Link: `/admin?tab=reviews`  
✅ Review author gets confirmation  
✅ Review is NOT visible on salon profile yet (pending approval)

---

## Test 3: Admin Approves Review → Salon Owner Notification

### Setup:
1. Login as **Admin**
2. Get pending review ID from previous test

### Test Request:
```bash
curl -X PATCH http://localhost:3000/api/admin/reviews/{reviewId}/status \
  -H "Content-Type: application/json" \
  -H "Cookie: access_token=YOUR_ADMIN_JWT" \
  -d '{
    "approvalStatus": "APPROVED"
  }'
```

### Expected Results:
✅ Review `approvalStatus` changed to `APPROVED`  
✅ Salon `avgRating` recalculated  
✅ **Customer** receives notification:  
   - Message: "Your review for [Salon] has been approved."  
   - Link: `/my-profile?tab=reviews`  
✅ **Salon Owner** receives notification:  
   - Message: "[Customer F.] left a 5-star review for your salon. Tap to view and respond."  
   - Link: `/dashboard?tab=reviews`  
✅ Review now visible on salon profile  
✅ Socket events sent to both customer and salon owner

---

## Test 4: Salon Owner Fetches Reviews (NEW ENDPOINT)

### Setup:
1. Login as **Salon Owner**

### Test Request:
```bash
curl -X GET http://localhost:3000/api/reviews/my-salon-reviews \
  -H "Cookie: access_token=YOUR_SALON_OWNER_JWT"
```

### Expected Response:
```json
{
  "pending": [
    {
      "id": "review-uuid-1",
      "rating": 4,
      "comment": "Great service!",
      "approvalStatus": "PENDING",
      "salonOwnerResponse": null,
      "salonOwnerRespondedAt": null,
      "createdAt": "2025-01-15T10:00:00Z",
      "author": {
        "firstName": "John",
        "lastName": "Doe"
      },
      "booking": {
        "service": {
          "title": "Haircut & Styling"
        }
      }
    }
  ],
  "approved": [
    {
      "id": "review-uuid-2",
      "rating": 5,
      "comment": "Excellent service!",
      "approvalStatus": "APPROVED",
      "salonOwnerResponse": "Thank you for your feedback!",
      "salonOwnerRespondedAt": "2025-01-16T12:00:00Z",
      "createdAt": "2025-01-14T10:00:00Z",
      "author": {
        "firstName": "Jane",
        "lastName": "Smith"
      },
      "booking": {
        "service": {
          "title": "Hair Coloring"
        }
      }
    }
  ],
  "needsResponse": [
    {
      "id": "review-uuid-3",
      "rating": 5,
      "comment": "Amazing experience!",
      "approvalStatus": "APPROVED",
      "salonOwnerResponse": null,
      "salonOwnerRespondedAt": null,
      "createdAt": "2025-01-15T14:00:00Z",
      "author": {
        "firstName": "Mike",
        "lastName": "Johnson"
      },
      "booking": {
        "service": {
          "title": "Beard Trim"
        }
      }
    }
  ]
}
```

### Expected Results:
✅ Returns object with 3 arrays: `pending`, `approved`, `needsResponse`  
✅ Only reviews for salon owner's salon  
✅ Includes author names, service titles, and booking info  
✅ Sorted by creation date (newest first)  
✅ `needsResponse` shows only approved reviews without salon response

---

## Test 5: Salon Owner Responds to Review (NEW ENDPOINT)

### Setup:
1. Login as **Salon Owner**
2. Get an approved review ID from Test 4

### Test Request:
```bash
curl -X PATCH http://localhost:3000/api/reviews/{reviewId}/respond \
  -H "Content-Type: application/json" \
  -H "Cookie: access_token=YOUR_SALON_OWNER_JWT" \
  -d '{
    "response": "Thank you so much for your wonderful review! We're thrilled you enjoyed your experience with us and look forward to seeing you again soon!"
  }'
```

### Expected Results:
✅ Review updated with `salonOwnerResponse`  
✅ `salonOwnerRespondedAt` timestamp set  
✅ **Customer** (review author) receives notification:  
   - Message: "[Salon Name] responded to your review."  
   - Link: `/salons/{salonId}?highlight=review-{reviewId}`  
✅ Socket event sent to customer  
✅ Response visible on salon profile page

---

## Test 6: Verify Database Schema Changes

### Test Query:
```sql
-- Connect to your PostgreSQL database and run:
SELECT 
  id,
  rating,
  comment,
  "salonOwnerResponse",
  "salonOwnerRespondedAt",
  "approvalStatus"
FROM "Review"
WHERE "salonOwnerResponse" IS NOT NULL
LIMIT 5;
```

### Expected Results:
✅ `salonOwnerResponse` column exists  
✅ `salonOwnerRespondedAt` column exists  
✅ Both columns are nullable (optional)  
✅ Existing reviews have NULL values (backwards compatible)

---

## Test 7: Error Handling Tests

### Test 7a: Non-Owner Tries to Respond
```bash
curl -X PATCH http://localhost:3000/api/reviews/{reviewId}/respond \
  -H "Content-Type: application/json" \
  -H "Cookie: access_token=DIFFERENT_SALON_OWNER_JWT" \
  -d '{"response": "This should fail"}'
```

**Expected**: ❌ 403 Forbidden - "You can only respond to reviews for your own salon."

---

### Test 7b: Try to Respond to Pending Review
```bash
curl -X PATCH http://localhost:3000/api/reviews/{pendingReviewId}/respond \
  -H "Content-Type: application/json" \
  -H "Cookie: access_token=YOUR_SALON_OWNER_JWT" \
  -d '{"response": "This should fail"}'
```

**Expected**: ❌ 403 Forbidden - "You can only respond to approved reviews."

---

### Test 7c: User Without Salon Tries to Fetch Reviews
```bash
curl -X GET http://localhost:3000/api/reviews/my-salon-reviews \
  -H "Cookie: access_token=CUSTOMER_JWT_NO_SALON"
```

**Expected**: ❌ 404 Not Found - "You do not own a salon."

---

### Test 7d: Empty Response Text
```bash
curl -X PATCH http://localhost:3000/api/reviews/{reviewId}/respond \
  -H "Content-Type: application/json" \
  -H "Cookie: access_token=YOUR_SALON_OWNER_JWT" \
  -d '{"response": "   "}'
```

**Expected**: Response is trimmed, should reject if empty after trim

---

## Test 8: End-to-End Notification Flow

### Complete Journey:
1. ✅ Salon owner marks booking COMPLETED
2. ✅ Customer gets notification "Leave a review"
3. ✅ Customer submits 5-star review
4. ✅ Admin gets notification "New review pending"
5. ✅ Admin approves review
6. ✅ Customer gets notification "Review approved"
7. ✅ **Salon owner gets notification "New 5-star review"**
8. ✅ Salon owner responds to review
9. ✅ Customer gets notification "Salon responded"

### Verify Notifications:
```bash
# Check customer notifications
curl -X GET http://localhost:3000/api/notifications \
  -H "Cookie: access_token=CUSTOMER_JWT"

# Check salon owner notifications
curl -X GET http://localhost:3000/api/notifications \
  -H "Cookie: access_token=SALON_OWNER_JWT"

# Check admin notifications
curl -X GET http://localhost:3000/api/notifications \
  -H "Cookie: access_token=ADMIN_JWT"
```

---

## 🔍 Quick Verification Checklist

### Database:
- [ ] `Review` table has `salonOwnerResponse` column
- [ ] `Review` table has `salonOwnerRespondedAt` column
- [ ] Existing reviews still work (backwards compatible)

### API Endpoints:
- [ ] `GET /api/reviews/my-salon-reviews` returns grouped reviews
- [ ] `PATCH /api/reviews/:id/respond` updates review with response
- [ ] Both endpoints require authentication
- [ ] Proper authorization checks in place

### Notifications:
- [ ] Booking completion sends "Leave review" notification to customer
- [ ] Review approval sends notification to salon owner (NEW)
- [ ] Review approval sends notification to customer (existing)
- [ ] Salon response sends notification to customer (NEW)

### Business Logic:
- [ ] Only salon owners can fetch their reviews
- [ ] Only salon owners can respond to their reviews
- [ ] Only approved reviews can be responded to
- [ ] Salon avgRating recalculates on approval
- [ ] Reviews grouped correctly (pending/approved/needsResponse)

---

## 🚨 Common Issues & Solutions

### Issue 1: JWT Token Expired
**Solution**: Re-login to get fresh token

### Issue 2: CORS Error
**Solution**: Ensure frontend origin is in CORS whitelist

### Issue 3: Socket Connection Failed
**Solution**: Check WebSocket gateway is running on correct port

### Issue 4: Notification Not Received
**Solution**: 
- Check user is authenticated
- Verify socket connection is active
- Check NotificationsService logs

---

## 📊 Success Criteria

All tests should pass with:
✅ No TypeScript/compilation errors  
✅ All endpoints return correct status codes  
✅ All notifications delivered via socket  
✅ Database integrity maintained  
✅ Authorization checks enforced  
✅ Backwards compatibility preserved  

---

## 🎯 Ready for Production

Once all tests pass:
1. Review logs for any errors
2. Check database performance
3. Monitor notification delivery
4. Verify WebSocket stability
5. Test with real user accounts

**Backend is production-ready!** 🚀
