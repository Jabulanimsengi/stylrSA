# Promotions Feature - Enhancements Implementation Plan

## Overview
This document outlines the implementation plan for enhancing the promotions feature with better UX, responsive design, and integration with salon profiles.

---

## 🎯 Requirements

### 1. **Add "Book Now" Button to Promotion Cards**
- Pink background (#E91E63 / var(--color-primary))
- White text
- Positioned at bottom of card
- Navigates to salon page for booking

### 2. **Responsive Vertical Grid Layout**
- Match featured services layout from home page
- Responsive breakpoints:
  - **Large screens (>640px)**: Auto-fill grid with min 250px columns
  - **Medium/Mobile (≤640px)**: 2 columns
  - **Small (≤400px)**: 2 columns with smaller gap

### 3. **Clickable Images with Lightbox**
- Click on promotion card image opens lightbox
- Show full-size image(s)
- Navigate between multiple images if available
- Close button and overlay dismiss

### 4. **Promotion Indicators on Salon Profile**
- Show "Promotion Available" sticker on service cards
- Badge positioned on top-right of service card image
- Click sticker → Opens promotion details modal or navigates to promotions page
- Display promotional price, original price, discount %

---

## 📋 Implementation Plan

### **Phase 1: Update Promotion Card Component**

#### **A. Add "Book Now" Button**

**File**: `frontend/src/components/PromotionCard.tsx`

**Changes**:
1. Add button at bottom of card content
2. Style with pink background, white text
3. On click → Navigate to salon page

**Code Structure**:
```tsx
<div className={styles.cardContent}>
  {/* Existing content */}
  <button 
    onClick={(e) => {
      e.preventDefault();
      router.push(`/salons/${salonId}`);
    }}
    className={styles.bookButton}
  >
    Book Now
  </button>
</div>
```

**CSS** (`PromotionCard.module.css`):
```css
.bookButton {
  width: 100%;
  padding: 0.75rem;
  background-color: var(--color-primary);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: auto; /* Push to bottom */
}

.bookButton:hover {
  background-color: var(--color-primary-dark);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(233, 30, 99, 0.3);
}
```

#### **B. Make Images Clickable**

**File**: `frontend/src/components/PromotionCard.tsx`

**Changes**:
1. Add onClick handler to image wrapper
2. Prevent navigation when clicking image (stopPropagation)
3. Open lightbox modal with images

**Code Structure**:
```tsx
<div 
  className={styles.cardImageWrapper}
  onClick={(e) => {
    e.preventDefault();
    e.stopPropagation();
    handleImageClick();
  }}
  style={{ cursor: 'pointer' }}
>
  {/* Image */}
</div>
```

**State Management**:
```tsx
const [lightboxOpen, setLightboxOpen] = useState(false);
const [lightboxImages, setLightboxImages] = useState<string[]>([]);
const [lightboxIndex, setLightboxIndex] = useState(0);

const handleImageClick = () => {
  const images = isService 
    ? (item.images || []) 
    : (item.images || []);
  setLightboxImages(images);
  setLightboxIndex(0);
  setLightboxOpen(true);
};
```

**Lightbox Component**: Create or reuse existing `ImageLightbox` component

---

### **Phase 2: Update Promotions Page Grid Layout**

#### **File**: `frontend/src/app/promotions/promotions.module.css`

**Current**:
```css
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}
```

**Updated** (Match Home Page Pattern):
```css
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: clamp(1.35rem, 2.5vw, 2rem);
  padding: 0 1rem;
  max-width: 1400px;
  margin: 0 auto;
}

/* Medium screens - Tablet */
@media (max-width: 768px) {
  .grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }
}

/* Small screens - Mobile */
@media (max-width: 640px) {
  .grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
    padding: 0 0.5rem;
  }
}

/* Very small screens */
@media (max-width: 400px) {
  .grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.5rem;
  }
}
```

#### **Update Card Component for Better Vertical Layout**

**File**: `frontend/src/components/PromotionCard.module.css`

**Changes**:
```css
.card {
  display: flex;
  flex-direction: column; /* Vertical layout */
  height: 100%; /* Fill grid cell */
}

.cardContent {
  display: flex;
  flex-direction: column;
  flex: 1; /* Take remaining space */
  padding: 1rem;
}

/* Push button to bottom */
.timeRemaining {
  margin-bottom: 0.75rem; /* Space before button */
}
```

---

### **Phase 3: Create Image Lightbox Component**

#### **Option A: Create New Lightbox Component**

**File**: `frontend/src/components/ImageLightbox/ImageLightbox.tsx`

```tsx
interface ImageLightboxProps {
  images: string[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (direction: 'prev' | 'next') => void;
}

export default function ImageLightbox({ 
  images, 
  currentIndex, 
  isOpen, 
  onClose, 
  onNavigate 
}: ImageLightboxProps) {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.content} onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className={styles.closeButton}>×</button>
        
        <Image
          src={images[currentIndex]}
          alt="Promotion"
          className={styles.image}
          fill
          sizes="100vw"
        />
        
        {images.length > 1 && (
          <>
            <button 
              onClick={() => onNavigate('prev')} 
              className={styles.prevButton}
            >
              ‹
            </button>
            <button 
              onClick={() => onNavigate('next')} 
              className={styles.nextButton}
            >
              ›
            </button>
            <div className={styles.counter}>
              {currentIndex + 1} / {images.length}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
```

#### **Option B: Reuse Existing Lightbox**

Check if `ServiceCard` or `ProductCard` already has a lightbox implementation and reuse it.

---

### **Phase 4: Add Promotion Indicators to Salon Profile**

#### **A. Fetch Active Promotions for Salon**

**File**: `frontend/src/app/salons/[id]/SalonProfileClient.tsx`

**Changes**:
1. Fetch active promotions for this salon when loading
2. Create a map of serviceId → promotion data
3. Pass promotion info to service cards

**API Call**:
```tsx
const [promotions, setPromotions] = useState<Map<string, Promotion>>(new Map());

useEffect(() => {
  const fetchPromotions = async () => {
    try {
      const res = await fetch(`/api/promotions/public?salonId=${salonId}`);
      if (res.ok) {
        const data = await res.json();
        const promoMap = new Map();
        data.forEach((promo: any) => {
          if (promo.serviceId) {
            promoMap.set(promo.serviceId, promo);
          }
        });
        setPromotions(promoMap);
      }
    } catch (err) {
      console.error('Failed to fetch promotions:', err);
    }
  };
  fetchPromotions();
}, [salonId]);
```

#### **B. Update Service Cards with Promotion Badge**

**File**: `frontend/src/components/ServiceCard.tsx`

**Add Prop**:
```tsx
interface ServiceCardProps {
  service: Service;
  onBook: (service: Service) => void;
  onSendMessage: () => void;
  onImageClick: (images: string[], index: number) => void;
  promotion?: Promotion; // NEW
}
```

**Add Badge to Image**:
```tsx
<div className={styles.imageContainer}>
  <Image {...} />
  
  {promotion && (
    <div 
      className={styles.promotionBadge}
      onClick={(e) => {
        e.stopPropagation();
        handlePromotionClick(promotion);
      }}
    >
      <span className={styles.badgeIcon}>🏷️</span>
      <span className={styles.badgeText}>Promotion</span>
    </div>
  )}
</div>
```

**CSS** (`ServiceCard.module.css`):
```css
.promotionBadge {
  position: absolute;
  top: 10px;
  right: 10px;
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%);
  color: white;
  padding: 0.4rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  cursor: pointer;
  z-index: 3;
  box-shadow: 0 3px 10px rgba(238, 90, 111, 0.5);
  display: flex;
  align-items: center;
  gap: 0.3rem;
  transition: transform 0.2s, box-shadow 0.2s;
}

.promotionBadge:hover {
  transform: scale(1.05);
  box-shadow: 0 5px 15px rgba(238, 90, 111, 0.6);
}

.badgeIcon {
  font-size: 0.9rem;
}

.badgeText {
  letter-spacing: 0.03em;
}
```

---

### **Phase 5: Create Promotion Details Modal**

#### **File**: `frontend/src/components/PromotionDetailsModal/PromotionDetailsModal.tsx`

**Purpose**: Show full promotion details when clicking badge

**Features**:
- Display service name and image
- Show original price (strikethrough, red)
- Show promotional price (bold, green)
- Show discount percentage
- Show time remaining
- "Book Now" button → Navigate to service booking

**Structure**:
```tsx
interface PromotionDetailsModalProps {
  promotion: Promotion;
  isOpen: boolean;
  onClose: () => void;
}

export default function PromotionDetailsModal({ 
  promotion, 
  isOpen, 
  onClose 
}: PromotionDetailsModalProps) {
  if (!isOpen) return null;

  const service = promotion.service;
  const timeRemaining = calculateTimeRemaining(promotion.endDate);

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className={styles.closeButton}>×</button>
        
        <div className={styles.header}>
          <h2>Special Promotion!</h2>
          <div className={styles.discountBadge}>
            {promotion.discountPercentage}% OFF
          </div>
        </div>

        {service?.images?.[0] && (
          <div className={styles.imageWrapper}>
            <Image src={service.images[0]} alt={service.title} fill />
          </div>
        )}

        <div className={styles.content}>
          <h3>{service?.title}</h3>
          
          <div className={styles.priceSection}>
            <div className={styles.priceRow}>
              <span className={styles.label}>Original Price:</span>
              <span className={styles.originalPrice}>
                R{promotion.originalPrice.toFixed(2)}
              </span>
            </div>
            <div className={styles.priceRow}>
              <span className={styles.label}>Promotional Price:</span>
              <span className={styles.promoPrice}>
                R{promotion.promotionalPrice.toFixed(2)}
              </span>
            </div>
            <div className={styles.savings}>
              You Save: R{(promotion.originalPrice - promotion.promotionalPrice).toFixed(2)}
            </div>
          </div>

          <div className={styles.timeInfo}>
            <svg>{/* Clock icon */}</svg>
            <span>{timeRemaining}</span>
          </div>

          <button 
            className={styles.bookButton}
            onClick={() => {
              onClose();
              router.push(`/salons/${service.salon.id}`);
            }}
          >
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
}
```

---

## 🗂️ Files to Create/Modify

### **New Files**:
1. `frontend/src/components/ImageLightbox/ImageLightbox.tsx`
2. `frontend/src/components/ImageLightbox/ImageLightbox.module.css`
3. `frontend/src/components/PromotionDetailsModal/PromotionDetailsModal.tsx`
4. `frontend/src/components/PromotionDetailsModal/PromotionDetailsModal.module.css`

### **Modified Files**:
1. `frontend/src/components/PromotionCard.tsx`
   - Add "Book Now" button
   - Add image click handler
   - Add lightbox state management

2. `frontend/src/components/PromotionCard.module.css`
   - Add `.bookButton` styles
   - Update `.card` for flex layout
   - Update responsive styles

3. `frontend/src/app/promotions/page.tsx`
   - Add lightbox state management at page level (optional)

4. `frontend/src/app/promotions/promotions.module.css`
   - Update `.grid` to match home page responsive pattern
   - Add mobile breakpoints

5. `frontend/src/app/salons/[id]/SalonProfileClient.tsx`
   - Fetch promotions for salon
   - Pass promotion data to service cards
   - Handle promotion badge clicks

6. `frontend/src/components/ServiceCard.tsx`
   - Add `promotion` prop
   - Add promotion badge overlay
   - Handle badge click event

7. `frontend/src/components/ServiceCard.module.css`
   - Add `.promotionBadge` styles
   - Add badge hover effects

---

## 🎨 Design Specifications

### **Colors**:
- **Pink Primary**: `var(--color-primary)` or `#E91E63`
- **Pink Dark**: `var(--color-primary-dark)` or `#C2185B`
- **Red (Original Price)**: `#ef4444`
- **Green (Promo Price)**: `#10b981`
- **White**: `#ffffff`

### **Promotion Badge**:
- **Background**: Linear gradient red (`#ff6b6b` → `#ee5a6f`)
- **Position**: Top-right, 10px from edges
- **Icon**: 🏷️ emoji or custom SVG
- **Text**: "Promotion" or "Promo"
- **Shadow**: `0 3px 10px rgba(238, 90, 111, 0.5)`
- **Hover**: Scale 1.05, stronger shadow

### **Book Now Button**:
- **Background**: Pink primary
- **Text**: White, 600 weight
- **Padding**: 0.75rem vertical
- **Border Radius**: 8px
- **Hover**: Darker pink, lift effect, pink shadow

---

## 🔄 Backend Changes (If Needed)

### **Optional: Filter Promotions by Salon**

**File**: `backend/src/promotions/promotions.service.ts`

**Update `findAllPublic` method**:
```typescript
async findAllPublic(salonId?: string) {
  const now = new Date();
  const where: any = {
    approvalStatus: 'APPROVED',
    startDate: { lte: now },
    endDate: { gte: now },
  };

  // Filter by salon if provided
  if (salonId) {
    where.salonId = salonId;
  }

  return this.prisma.promotion.findMany({
    where,
    include: { /* ... */ },
    orderBy: { createdAt: 'desc' },
  });
}
```

**Controller**:
```typescript
@Get('public')
findAllPublic(@Query('salonId') salonId?: string) {
  return this.promotionsService.findAllPublic(salonId);
}
```

---

## 📱 Responsive Behavior Summary

### **Large Screens (Desktop, >768px)**:
- Auto-fill grid, minimum 250px per column
- 3-5 columns depending on screen width
- Full-size images and text
- Hover effects enabled

### **Medium Screens (Tablet, 640px-768px)**:
- 2 column grid
- Slightly smaller gaps
- Touch-friendly button sizes

### **Small Screens (Mobile, 400px-640px)**:
- 2 column grid
- Smaller gaps (0.75rem)
- Compact text sizes
- Touch-optimized buttons

### **Very Small Screens (<400px)**:
- 2 column grid maintained
- Minimal gaps (0.5rem)
- Further reduced text sizes
- Essential info only

---

## ✅ Testing Checklist

### **Promotion Cards**:
- [ ] "Book Now" button appears at bottom
- [ ] Button has pink background, white text
- [ ] Button hover effect works (darker pink)
- [ ] Clicking button navigates to salon page
- [ ] Clicking image opens lightbox (not navigation)

### **Grid Layout**:
- [ ] Desktop: 3-5 columns auto-fill
- [ ] Tablet: 2 columns
- [ ] Mobile: 2 columns with smaller gaps
- [ ] Cards have consistent heights
- [ ] Images scale proportionally

### **Image Lightbox**:
- [ ] Click image opens lightbox
- [ ] Full-size image displays
- [ ] Navigate between images (if multiple)
- [ ] Close button works
- [ ] Click overlay dismisses
- [ ] Keyboard ESC closes lightbox

### **Salon Profile Promotion Badge**:
- [ ] Badge appears on services with active promotions
- [ ] Badge positioned top-right on image
- [ ] Badge has red gradient background
- [ ] Hover effect scales badge
- [ ] Click badge opens promotion details
- [ ] Badge doesn't interfere with service card click

### **Promotion Details Modal**:
- [ ] Opens when clicking badge
- [ ] Shows correct service info
- [ ] Displays original price (strikethrough, red)
- [ ] Displays promo price (bold, green)
- [ ] Shows discount percentage
- [ ] Shows time remaining
- [ ] "Book Now" button navigates to salon
- [ ] Close button works

---

## 🚀 Implementation Order

### **Priority 1** (Essential UX):
1. Add "Book Now" button to promotion cards
2. Update grid layout to match home page responsive pattern

### **Priority 2** (Functionality):
3. Make images clickable with lightbox
4. Create/integrate image lightbox component

### **Priority 3** (Integration):
5. Add promotion badge to salon profile service cards
6. Fetch and display active promotions on salon profile
7. Create promotion details modal
8. Wire up badge click to show promotion details

---

## 📝 Summary

This implementation will:
- ✅ Add booking functionality directly from promotion cards
- ✅ Create responsive grid matching the home page design
- ✅ Enable image viewing with lightbox
- ✅ Surface promotions on salon profiles with visual indicators
- ✅ Provide seamless flow from discovery → details → booking
- ✅ Optimize for all screen sizes (mobile, tablet, desktop)

**Estimated Development Time**: 6-8 hours
**Files to Create**: 4 new components
**Files to Modify**: 7 existing files
**Backend Changes**: 1 optional enhancement

Would you like me to proceed with this implementation?
