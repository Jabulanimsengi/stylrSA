# Operating Hours Bug Analysis

## Problem
User-entered operating hours during salon onboarding are not displaying on the salon profile page. Instead, default hours (Mon-Fri 09:00-17:00) are shown.

## Data Flow Investigation

### 1. Frontend Submission (create-salon/page.tsx)
```javascript
// Lines 100-104
const hoursArray = days.map((d) => ({
  day: d,
  open: hours[d].open,
  close: hours[d].close,
}));
payload.operatingHours = hoursArray;
```

**Sent to API:**
```json
{
  "operatingHours": [
    { "day": "Monday", "open": "09:00", "close": "17:00" },
    { "day": "Tuesday", "open": "10:00", "close": "18:00" },
    ...
  ]
}
```

### 2. Backend Processing (salons.service.ts)
```javascript
// Line 86-88
const normalizedOperatingHours = normalizeOperatingHours(
  (dto as any).operatingHours,
);
```

**Then saved to database:**
```javascript
// Line 109
operatingHours: normalizedOperatingHours,
```

### 3. Normalization Logic (operating-hours.util.ts)
```javascript
// Line 166-169
export function normalizeOperatingHours(raw: unknown): OperatingHourEntry[] {
  const entries = coerceOperatingHoursArray(raw);
  return entries.length > 0 ? entries : DEFAULT_OPERATING_HOURS;
}
```

**⚠️ ISSUE FOUND: If `coerceOperatingHoursArray` returns empty array, it falls back to DEFAULT_OPERATING_HOURS!**

### 4. Retrieval (salons.service.ts findOne)
```javascript
// Line 261-302
async findOne(id: string) {
  const salon = await this.prisma.salon.findUnique({
    where: { id },
    include: { ... }
  });
  return salon; // Returns raw data from DB
}
```

**No transformation on retrieval - returns whatever is in the database.**

### 5. Frontend Display (SalonProfileClient.tsx)
```javascript
// Line 254-278
const hoursRecord = useMemo(() => {
  const oh = salon?.operatingHours as unknown;
  if (!oh) return null;
  if (Array.isArray(oh)) {
    const rec: Record<string, string> = {};
    (oh as Array<{ day?: string; open?: string; close?: string }>).forEach((it) => {
      const day = it?.day;
      const open = it?.open;
      const close = it?.close;
      if (day && (open || close)) rec[day] = `${open ?? ''} - ${close ?? ''}`.trim();
    });
    return rec;
  }
  // ... other cases
}, [salon?.operatingHours]);
```

## Root Cause Analysis

### Hypothesis 1: `coerceOperatingHoursArray` Returns Empty Array
The normalization function might be failing to parse the array correctly, causing it to return an empty array, which triggers the DEFAULT_OPERATING_HOURS fallback.

**Testing needed:**
- Check what `canonicalizeDay("Monday")` returns
- Check what `extractTimes({ day: "Monday", open: "09:00", close: "17:00" })` returns
- Verify TIME_REGEX pattern: `/^([0-2]?\d):([0-5]\d)$/`

### Hypothesis 2: Data Saved Correctly But Retrieved Incorrectly
The data might be saved correctly in the database as JSON, but when retrieved, it's not being parsed properly by Prisma.

**Testing needed:**
- Query database directly to see what's stored in `operatingHours` column
- Check if Prisma Json type is being serialized/deserialized correctly

### Hypothesis 3: Frontend Form State Issue
The frontend might not be collecting the hours correctly before submission.

**Less likely because:** The code clearly maps the hours array before sending.

## Debugging Steps

1. **Add console.log in backend normalization:**
   ```typescript
   const normalizedOperatingHours = normalizeOperatingHours(
     (dto as any).operatingHours,
   );
   console.log('Received:', (dto as any).operatingHours);
   console.log('Normalized:', normalizedOperatingHours);
   ```

2. **Check database directly:**
   ```sql
   SELECT id, name, "operatingHours" FROM "Salon" WHERE id = '<salon-id>';
   ```

3. **Add frontend logging:**
   ```javascript
   console.log('Submitting hours:', payload.operatingHours);
   ```

4. **Check API response:**
   ```javascript
   console.log('Salon data from API:', salon?.operatingHours);
   ```

## Likely Fix

If `coerceOperatingHoursArray` is returning empty, the issue is likely in:
- `canonicalizeDay` not recognizing the day names
- `extractTimes` not extracting from the object format
- `normalizeTimeString` rejecting the time format

**Most likely culprit:** The frontend might be sending times in a format that doesn't match the `TIME_REGEX` pattern or the object structure expected by `extractTimes`.

## Next Steps

1. Add logging to backend to see what's being received
2. Add logging to see what's being saved to database
3. Query database directly to confirm what's stored
4. If data is correct in DB, issue is in frontend display logic
5. If data is DEFAULT_OPERATING_HOURS in DB, issue is in backend normalization
