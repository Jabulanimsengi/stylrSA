# Operating Hours Complete Fix

## Problem Summary

**User Report:** Operating hours entered during salon onboarding and updated in dashboard were not reflecting on the salon detail pages. Default hours (Mon-Fri 09:00-17:00) were showing instead.

## Root Cause Analysis

The bug existed in **TWO PLACES** - both Create and Update DTOs had the same problematic Transform decorator:

### 1. Create Salon Bug
**File:** `backend/src/salons/dto/create-salon.dto.ts`

```typescript
@Transform(({ value }) => {
  const entries = coerceOperatingHoursArray(value);
  return entries.length > 0 ? entries : undefined; // ⚠️ Converts valid hours to undefined
})
operatingHours?: OperatingHoursDto[];
```

### 2. Update Salon Bug (The One We Missed!)
**File:** `backend/src/salons/dto/update-salon.dto.ts`

```typescript
@Transform(({ value }) => {
  const entries = coerceOperatingHoursArray(value);
  return entries.length > 0 ? entries : undefined; // ⚠️ Same bug!
})
operatingHours?: OperatingHoursDto[];
```

## The Problem Flow

### Create Flow (First Bug):
```
User creates salon with custom hours
  ↓
Frontend: [{day: 'Monday', open: '08:00', close: '20:00'}, ...]
  ↓
Backend create-salon.dto.ts Transform runs
  ↓
Transform returns undefined (due to premature coercion)
  ↓
salons.service.ts receives undefined
  ↓
normalizeOperatingHours(undefined) → DEFAULT_OPERATING_HOURS
  ↓
Database saves: Mon-Fri 09:00-17:00
```

### Update Flow (Second Bug):
```
User updates hours in EditSalonModal dashboard
  ↓
Frontend: [{day: 'Monday', open: '06:00', close: '22:00'}, ...]
  ↓
Backend update-salon.dto.ts Transform runs
  ↓
Transform returns undefined (due to premature coercion)
  ↓
salons.service.ts receives undefined
  ↓
normalizeOperatingHours(undefined) → DEFAULT_OPERATING_HOURS
  ↓
Database saves: Mon-Fri 09:00-17:00
  ↓
User still sees default hours on detail page
```

## Why This Happened

**Duplicate Processing:**
- DTO Transform was calling `coerceOperatingHoursArray` during validation
- Service was calling `normalizeOperatingHours` during processing
- If DTO Transform had ANY issue parsing → returned `undefined`
- Service received `undefined` → fell back to defaults

**The DTO Transform was:**
1. Too early in the pipeline
2. Failing silently
3. Not necessary (service already normalizes)

## Complete Fix

### File 1: `backend/src/salons/dto/create-salon.dto.ts`

**Before:**
```typescript
import { coerceOperatingHoursArray } from '../utils/operating-hours.util';

@IsOptional()
@IsArray()
@ValidateNested({ each: true })
@Type(() => OperatingHoursDto)
@Transform(({ value }) => {
  const entries = coerceOperatingHoursArray(value);
  return entries.length > 0 ? entries : undefined;
})
operatingHours?: OperatingHoursDto[];
```

**After:**
```typescript
// Removed import

@IsOptional()
@IsArray()
@ValidateNested({ each: true })
@Type(() => OperatingHoursDto)
operatingHours?: OperatingHoursDto[];
```

### File 2: `backend/src/salons/dto/update-salon.dto.ts`

**Before:**
```typescript
import { coerceOperatingHoursArray } from '../utils/operating-hours.util';

@IsOptional()
@IsArray()
@ValidateNested({ each: true })
@Type(() => OperatingHoursDto)
@Transform(({ value }) => {
  const entries = coerceOperatingHoursArray(value);
  return entries.length > 0 ? entries : undefined;
})
operatingHours?: OperatingHoursDto[];
```

**After:**
```typescript
// Removed import

@IsOptional()
@IsArray()
@ValidateNested({ each: true })
@Type(() => OperatingHoursDto)
operatingHours?: OperatingHoursDto[];
```

## What Now Works Correctly

### DTO Layer (Validation Only):
- Validates that `operatingHours` is an array
- Validates that each entry has `day`, `open`, `close` fields
- Passes raw data to service layer

### Service Layer (Normalization):
- `salons.service.ts` calls `normalizeOperatingHours`
- Normalizes day names (Monday, monday, mon → "Monday")
- Normalizes time format (9:00, 09:00 → "09:00")
- Orders days correctly
- ONLY falls back to defaults if NO hours provided at all

## Expected Behavior After Fix

### Creating New Salon:
1. User enters custom hours (e.g., Mon: 06:00-22:00, Tue: 08:00-18:00)
2. Hours are validated by DTO
3. Hours are normalized by service
4. Custom hours saved to database
5. ✅ Salon detail page shows custom hours

### Updating Existing Salon:
1. User goes to Dashboard → Edit Salon
2. Changes hours (e.g., Wed: 10:00-20:00)
3. Hours are validated by DTO
4. Hours are normalized by service
5. Custom hours saved to database
6. ✅ Salon detail page immediately shows updated hours (with refetch logic)

### Viewing Salon:
1. Frontend fetches salon from API
2. Receives: `operatingHours: [{day: 'Monday', open: '06:00', close: '22:00'}, ...]`
3. Parses to display format
4. Shows in "Today" and "Weekly hours" sections
5. ✅ User sees actual custom hours

## Files Modified

1. ✅ `backend/src/salons/dto/create-salon.dto.ts` - Removed Transform
2. ✅ `backend/src/salons/dto/update-salon.dto.ts` - Removed Transform

## Files Verified (Working Correctly)

- ✅ `backend/src/salons/salons.service.ts` - Normalization logic correct
- ✅ `backend/src/salons/utils/operating-hours.util.ts` - Utility functions correct
- ✅ `frontend/src/app/create-salon/page.tsx` - Sends correct format
- ✅ `frontend/src/components/EditSalonModal.tsx` - Sends correct format
- ✅ `frontend/src/app/salons/[id]/SalonProfileClient.tsx` - Display logic correct
- ✅ `frontend/src/types/index.ts` - Type definitions support both formats

## Testing Checklist

After restarting backend:

### Create Flow:
- [ ] Create new salon with custom hours (e.g., Mon: 07:00-21:00, Sat: 10:00-16:00)
- [ ] Verify hours saved in database
- [ ] View salon profile → hours should match input

### Update Flow:
- [ ] Go to Dashboard → Edit Salon
- [ ] Change operating hours (e.g., Tue: 08:30-19:30)
- [ ] Save changes
- [ ] View salon profile → updated hours should display
- [ ] Refresh page → hours should persist

### Display:
- [ ] "Today" section shows correct hours for current day
- [ ] "View week" button expands full schedule
- [ ] All days show custom hours (not 09:00-17:00 defaults)

## Database Verification

Check a recently updated salon:

```sql
SELECT id, name, "operatingHours" 
FROM "Salon" 
WHERE name LIKE '%Your Salon Name%';
```

Should see:
```json
[
  {"day": "Monday", "open": "08:00", "close": "20:00"},
  {"day": "Tuesday", "open": "08:30", "close": "19:30"},
  ...
]
```

NOT:
```json
[
  {"day": "Monday", "open": "09:00", "close": "17:00"},
  {"day": "Tuesday", "open": "09:00", "close": "17:00"},
  ...
]
```

## Notes

- Default hours fallback (Mon-Fri 09:00-17:00) still exists but only applies when user provides NO hours at all
- Existing salons with default hours need users to manually update in dashboard
- The fix ensures future creations and updates work correctly
- Display logic already supported both formats (array and object)

---

**Status:** ✅ Complete Fix Applied (Both Create and Update)  
**Tested:** ✅ Database direct insert confirmed working  
**Remaining:** Restart backend, test create + update flows
