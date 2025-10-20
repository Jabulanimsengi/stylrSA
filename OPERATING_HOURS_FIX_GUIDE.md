# Operating Hours Fix - Implementation Guide

## Problem
Salon owners couldn't mark days as "CLOSED" - they could only set times. This meant salons that are closed on Sundays (or any day) had no way to indicate this on their profile.

## Solution
Created a reusable `OperatingHoursInput` component with checkboxes to mark days as open/closed, plus helper functions for data handling.

## New Files Created
- ✅ `frontend/src/components/OperatingHoursInput.tsx` - Main component
- ✅ `frontend/src/components/OperatingHoursInput.module.css` - Styling
- ✅ Backup created: `frontend/src/app/create-salon/page.tsx.backup`

## Integration Steps

### 1. Update Create Salon Page (`frontend/src/app/create-salon/page.tsx`)

#### A. Update imports (at the top of the file):
```typescript
import OperatingHoursInput, { 
  OperatingHours, 
  initializeOperatingHours, 
  serializeOperatingHours 
} from '@/components/OperatingHoursInput';
```

#### B. Replace the hours state (around line 31):
**FIND:**
```typescript
const [hours, setHours] = useState<Record<string,{open:string,close:string}>>(
  Object.fromEntries(days.map(d => [d, { open: '09:00', close: '17:00' }])) as Record<string,{open:string,close:string}>
);
```

**REPLACE WITH:**
```typescript
const [hours, setHours] = useState<OperatingHours>(initializeOperatingHours());
```

#### C. Update handleSubmit function (around line 97):
**FIND:**
```typescript
// Send operatingHours as a record Day -> "HH:MM - HH:MM" to match details view
const hoursArray = days.map((d) => ({
  day: d,
  open: hours[d].open,
  close: hours[d].close,
}));
payload.operatingHours = hoursArray;
payload.operatingDays = hoursArray.map((entry) => entry.day);
```

**REPLACE WITH:**
```typescript
// Serialize operating hours with open/closed status
const serializedHours = serializeOperatingHours(hours);
payload.operatingHours = serializedHours.operatingHours;
payload.operatingDays = serializedHours.operatingDays;
```

#### D. Replace the operating hours JSX (around line 344):
**FIND** (this entire section):
```jsx
<div className={`${styles.inputGroup} ${styles.fullWidth}`}>
  <label>Operating Hours</label>
  <div style={{display:'grid',gap:'0.5rem'}}>
    <div style={{display:'flex',gap:'0.5rem',alignItems:'center'}}>
      <span style={{minWidth:100,fontWeight:600}}>Apply to all</span>
      <input type="time" value={hours['Monday'].open} onChange={(e)=>{
        const v=e.target.value; setHours(prev=>{ const next={...prev}; days.forEach(d=>next[d]={...next[d],open:v}); return next;});
      }} className={styles.input} style={{maxWidth:160}} />
      <span>to</span>
      <input type="time" value={hours['Monday'].close} onChange={(e)=>{
        const v=e.target.value; setHours(prev=>{ const next={...prev}; days.forEach(d=>next[d]={...next[d],close:v}); return next;});
      }} className={styles.input} style={{maxWidth:160}} />
    </div>
    {days.map(d=> (
      <div key={d} style={{display:'flex',gap:'0.5rem',alignItems:'center'}}>
        <span style={{minWidth:100}}>{d}</span>
        <input type="time" value={hours[d].open} onChange={(e)=> setHours(prev=> ({...prev,[d]:{...prev[d],open:e.target.value}}))} className={styles.input} style={{maxWidth:160}} />
        <span>to</span>
        <input type="time" value={hours[d].close} onChange={(e)=> setHours(prev=> ({...prev,[d]:{...prev[d],close:e.target.value}}))} className={styles.input} style={{maxWidth:160}} />
      </div>
    ))}
  </div>
</div>
```

**REPLACE WITH:**
```jsx
<div className={`${styles.inputGroup} ${styles.fullWidth}`}>
  <label>Operating Hours</label>
  <OperatingHoursInput hours={hours} onChange={setHours} />
</div>
```

### 2. Update Edit Salon Modal (`frontend/src/components/EditSalonModal.tsx`)

#### A. Update imports (at the top of the file):
```typescript
import OperatingHoursInput, { 
  OperatingHours, 
  parseOperatingHours, 
  serializeOperatingHours 
} from './OperatingHoursInput';
```

#### B. Replace the hours state (around line 52):
**FIND:**
```typescript
const [hours, setHours] = useState<Record<string, { open: string; close: string }>>(
  Object.fromEntries(days.map(d => [d, { open: '09:00', close: '17:00' }])) as Record<string, { open: string; close: string }>
);
```

**REPLACE WITH:**
```typescript
const [hours, setHours] = useState<OperatingHours>(initializeOperatingHours());
```

#### C. Update the useEffect hook that loads salon data (around line 78):
**FIND** (the operating hours parsing section):
```typescript
const rawHours = salon.operatingHours as unknown;
let hoursRecord: Record<string, string> | null = null;
if (Array.isArray(rawHours)) {
  const derived: Record<string, string> = {};
  rawHours.forEach((entry: { day?: string; open?: string; close?: string }) => {
    if (!entry?.day) return;
    const open = entry.open ?? '';
    const close = entry.close ?? '';
    if (!open && !close) return;
    derived[entry.day] = `${open} - ${close}`.trim();
  });
  hoursRecord = Object.keys(derived).length > 0 ? derived : null;
} else if (rawHours && typeof rawHours === 'object') {
  hoursRecord = rawHours as Record<string, string>;
}

if (hoursRecord) {
  const parsedHours = { ...hours };
  Object.entries(hoursRecord).forEach(([day, hoursStr]) => {
    const match = hoursStr.match(/(\d{2}:\d{2})\s*-\s*(\d{2}:\d{2})/);
    if (match && parsedHours[day]) {
      parsedHours[day] = { open: match[1], close: match[2] };
    }
  });
  setHours(parsedHours);
}
```

**REPLACE WITH:**
```typescript
const parsedHours = parseOperatingHours(salon.operatingHours);
setHours(parsedHours);
```

#### D. Update handleSubmit function (around line 194):
**FIND:**
```typescript
// Compose operatingHours as array entries compatible with backend DTO
const hoursArray = days.map((d) => ({
  day: d,
  open: hours[d].open,
  close: hours[d].close,
}));
payload.operatingHours = hoursArray;
payload.operatingDays = hoursArray.map((entry) => entry.day);
```

**REPLACE WITH:**
```typescript
// Serialize operating hours with open/closed status
const serializedHours = serializeOperatingHours(hours);
payload.operatingHours = serializedHours.operatingHours;
payload.operatingDays = serializedHours.operatingDays;
```

#### E. Replace the operating hours JSX (around line 420):
**FIND** (this entire section):
```jsx
<h3 className={styles.subheading}>Operating Hours</h3>
<div className={styles.grid}>
  <div className={styles.fullWidth}>
    <div style={{display:'flex',gap:'0.5rem',alignItems:'center',marginBottom:8}}>
      <span style={{minWidth:120,fontWeight:600}}>Apply to all</span>
      <input type="time" value={hours['Monday'].open} onChange={(e)=>{
        const v=e.target.value; setHours(prev=>{ const next={...prev}; days.forEach(d=>next[d]={...next[d],open:v}); return next;});
      }} className={styles.input} style={{maxWidth:160}} />
      <span>to</span>
      <input type="time" value={hours['Monday'].close} onChange={(e)=>{
        const v=e.target.value; setHours(prev=>{ const next={...prev}; days.forEach(d=>next[d]={...next[d],close:v}); return next;});
      }} className={styles.input} style={{maxWidth:160}} />
    </div>
    <div style={{display:'grid',gap:8}}>
      {days.map((d)=> (
        <div key={d} style={{display:'flex',gap:'0.5rem',alignItems:'center'}}>
          <span style={{minWidth:100}}>{d}</span>
          <input type="time" value={hours[d].open} onChange={(e)=> setHours(prev=> ({...prev,[d]:{...prev[d],open:e.target.value}}))} className={styles.input} style={{maxWidth:160}} />
          <span>to</span>
          <input type="time" value={hours[d].close} onChange={(e)=> setHours(prev=> ({...prev,[d]:{...prev[d],close:e.target.value}}))} className={styles.input} style={{maxWidth:160}} />
        </div>
      ))}
    </div>
  </div>
</div>
```

**REPLACE WITH:**
```jsx
<h3 className={styles.subheading}>Operating Hours</h3>
<div className={styles.grid}>
  <div className={styles.fullWidth}>
    <OperatingHoursInput hours={hours} onChange={setHours} />
  </div>
</div>
```

## Features of the New Component

### ✅ Open/Closed Toggle
- Each day has a checkbox to mark it as open or closed
- Closed days are visually grayed out and show "Closed" label
- Time inputs are hidden when a day is marked as closed

### ✅ Bulk Actions
- **Apply hours to all open days**: Sets the same open/close times for all days marked as open
- **Mark all as open**: Quickly opens all days
- **Mark all as closed**: Quickly closes all days (useful for vacation mode)

### ✅ Visual Feedback
- Open days: White background, bold text, time inputs visible
- Closed days: Gray background, lighter text, dashed border, "Closed" label
- Hover effects on each day row

### ✅ Responsive Design
- Desktop: Horizontal layout with all controls in one row
- Mobile: Stacked layout for better touch interaction

### ✅ Data Handling
- `initializeOperatingHours()`: Creates default hours (9 AM - 5 PM, all days open)
- `parseOperatingHours()`: Converts API response to component format
- `serializeOperatingHours()`: Converts component format back to API format

## Testing

After making the changes:

1. **Create a new salon**:
   - Go to `/create-salon`
   - Mark Sunday as closed (uncheck the box)
   - Set different hours for weekdays
   - Submit and verify

2. **Edit existing salon**:
   - Go to dashboard
   - Edit salon profile
   - Change operating hours
   - Mark some days as closed
   - Save and verify

3. **View salon profile**:
   - Visit the salon's public profile
   - Verify closed days don't show in operating hours
   - Check that open days show correct times

## Backend Compatibility

The new component is fully compatible with the existing backend:
- Sends empty strings for open/close on closed days
- Only includes open days in `operatingDays` array
- Backend already handles this format correctly

## Rollback (If Needed)

If issues arise, restore the backup:
```bash
cd frontend/src/app/create-salon
cp page.tsx.backup page.tsx
```

## Benefits

✅ **Better UX**: Clear indication of open vs closed days  
✅ **Flexibility**: Salon owners can close on specific days  
✅ **Bulk actions**: Quick setup for standard schedules  
✅ **Reusable**: Same component for create and edit forms  
✅ **Maintainable**: Single source of truth for operating hours logic  
✅ **Responsive**: Works on all screen sizes  

## Next Steps

1. Apply the changes outlined above
2. Test thoroughly on both create and edit forms
3. If everything works, delete the backup file
4. Consider using this component pattern for other forms

---

**Need Help?** If you encounter issues during integration, you can:
1. Check the console for any TypeScript errors
2. Ensure all imports are correct
3. Verify the component files were created in the right location
4. Test each form separately to isolate issues
