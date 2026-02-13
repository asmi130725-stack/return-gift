# 📱 Mobile-First Design Examples

This document showcases the mobile-first responsive design patterns used in Return Gift.

## Core Principles

1. **Touch-First**: All interactive elements ≥44px × 44px
2. **Thumb-Friendly**: Important actions within thumb zone
3. **Progressive Enhancement**: Mobile → Tablet → Desktop
4. **Performance**: <3s load time on 3G
5. **Accessibility**: WCAG 2.1 AA compliant

## Responsive Breakpoints

```typescript
// Tailwind default breakpoints (mobile-first)
const breakpoints = {
  // Base: 0-639px (mobile)
  sm: "640px", // Large phones, small tablets
  md: "768px", // Tablets
  lg: "1024px", // Laptops
  xl: "1280px", // Desktops
  "2xl": "1536px", // Large desktops
};
```

## Component Examples

### 1. Event Card - Responsive Sizing

```tsx
// Mobile: Full width, compact
// Tablet: 2 columns
// Desktop: 3 columns

<div
  className="
  grid 
  grid-cols-1           /* Mobile: 1 column */
  sm:grid-cols-2        /* Tablet: 2 columns */
  lg:grid-cols-3        /* Desktop: 3 columns */
  gap-4 sm:gap-6        /* Spacing increases with screen */
"
>
  {events.map((event) => (
    <EventCard key={event.id} event={event} />
  ))}
</div>
```

### 2. Navigation - Bottom on Mobile

```tsx
{
  /* Desktop: Top navigation */
}
<nav className="hidden sm:flex items-center gap-6">
  <Link href="/events">Memories</Link>
  <Link href="/create">Create</Link>
  <Link href="/profile">Profile</Link>
</nav>;

{
  /* Mobile: Bottom tab bar */
}
<nav
  className="
  fixed bottom-0 inset-x-0 
  bg-white border-t 
  pb-safe              /* Safe area for iPhone notch */
  sm:hidden            /* Hidden on tablet+ */
"
>
  <div className="flex justify-around py-2">
    {/* Large touch targets */}
    <Link className="flex flex-col items-center gap-1 px-4 py-2">
      <Icon />
      <span className="text-xs">Memories</span>
    </Link>
  </div>
</nav>;
```

### 3. Form Inputs - Touch-Friendly

```tsx
<input
  type="text"
  className="
    w-full
    px-4 py-3              /* Larger padding for touch */
    text-base sm:text-lg   /* Prevents zoom on iOS */
    border-2 rounded-xl
    focus:border-pink-400
    touch-target           /* Min 44px height */
  "
/>
```

### 4. Photo Upload - Adaptive

```tsx
<div
  className="
  border-3 border-dashed rounded-2xl
  p-8 sm:p-12           /* More padding on desktop */
  cursor-pointer
"
>
  {/* Desktop text */}
  <p className="hidden sm:block">Drag and drop photos here</p>

  {/* Mobile text */}
  <p className="sm:hidden">Tap to upload photos</p>

  {/* Mobile camera hint */}
  <p className="text-xs text-pink-600 mt-4 sm:hidden">
    📸 Tap to choose from gallery or camera
  </p>
</div>
```

### 5. Button Sizing

```tsx
<button
  className="
  px-6 py-3              /* Mobile: Compact */
  sm:px-8 sm:py-4        /* Desktop: Larger */
  text-sm sm:text-base   /* Responsive text */
  rounded-full
  touch-target           /* Always ≥44px */
  w-full sm:w-auto       /* Full width on mobile */
"
>
  Create Memory
</button>
```

## Layout Patterns

### Pattern 1: Single Column → Multi-Column

```tsx
{
  /* Mobile: Stack vertically */
}
{
  /* Desktop: Side by side */
}
<div
  className="
  flex flex-col          /* Mobile: column */
  md:flex-row            /* Desktop: row */
  gap-4 md:gap-6
"
>
  <div className="w-full md:w-1/2">
    <PhotoGallery />
  </div>
  <div className="w-full md:w-1/2">
    <EventDetails />
  </div>
</div>;
```

### Pattern 2: Hidden → Visible

```tsx
{
  /* Show on desktop only */
}
<div className="hidden lg:block">
  <Sidebar />
</div>;

{
  /* Show on mobile only */
}
<div className="lg:hidden">
  <MobileMenu />
</div>;
```

### Pattern 3: Spacing Scale

```tsx
<section
  className="
  py-6 sm:py-8 md:py-12    /* Vertical spacing */
  px-4 sm:px-6 md:px-8     /* Horizontal padding */
"
>
  <h2
    className="
    text-2xl sm:text-3xl md:text-4xl  /* Font size */
    mb-4 sm:mb-6 md:mb-8              /* Margin */
  "
  >
    Your Memories
  </h2>
</section>
```

## Touch Gestures

### Swipeable Gallery

```tsx
import { motion } from "framer-motion";

<motion.div
  drag="x" // Horizontal drag
  dragConstraints={{ left: 0, right: 0 }}
  dragElastic={1}
  onDragEnd={(e, { offset, velocity }) => {
    // Detect swipe direction
    const swipe = offset.x * velocity.x;
    if (swipe < -threshold) nextPhoto();
    if (swipe > threshold) prevPhoto();
  }}
>
  <Image src={photo} />
</motion.div>;
```

### Pull to Refresh (Future)

```tsx
<div
  onTouchStart={handleTouchStart}
  onTouchMove={handleTouchMove}
  onTouchEnd={handleTouchEnd}
  className="overscroll-behavior-none"
>
  {/* Content */}
</div>
```

## Performance Optimizations

### 1. Image Optimization

```tsx
import Image from "next/image";

<Image
  src={photo.url}
  alt="Photo"
  width={800}
  height={600}
  sizes="
    (max-width: 768px) 100vw,
    (max-width: 1200px) 50vw,
    33vw
  "
  loading="lazy" // Lazy load below fold
  priority={index === 0} // Eager load first image
/>;
```

### 2. Lazy Loading Components

```tsx
import dynamic from "next/dynamic";

// Don't load scrapbook generator until needed
const ScrapbookGenerator = dynamic(
  () => import("@/components/ScrapbookGenerator"),
  { loading: () => <Skeleton /> },
);
```

### 3. Code Splitting

```tsx
// Automatically split by route
// /events -> events page bundle
// /create -> create page bundle
// No extra code needed with Next.js App Router!
```

## Safe Area Handling

```css
/* For iPhone notch and similar */
.safe-area {
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
  padding-left: env(safe-area-inset-left);
  padding-right: env(safe-area-inset-right);
}
```

```tsx
<div
  className="
  pb-safe-bottom     /* Bottom navigation */
  pt-safe-top        /* Top header */
"
>
  Content
</div>
```

## Accessibility

### Touch Target Size

```tsx
// ✅ Good: 44px minimum
<button className="min-h-[44px] min-w-[44px]">
  <Icon />
</button>

// ❌ Bad: Too small
<button className="p-1">
  <Icon />
</button>
```

### Focus States

```tsx
<button
  className="
  focus:outline-none
  focus:ring-4           /* Visible focus ring */
  focus:ring-pink-200
  focus:ring-offset-2
"
>
  Submit
</button>
```

### Screen Reader Support

```tsx
<button aria-label="Delete photo">
  <TrashIcon />
</button>

<img
  src={photo}
  alt="Sunset at the beach with couple walking"  // Descriptive alt
/>
```

## Testing Checklist

- [ ] Test on real iPhone (notch handling)
- [ ] Test on real Android (back button)
- [ ] Test on iPad (tablet layout)
- [ ] Test landscape orientation
- [ ] Test with large text (accessibility)
- [ ] Test with slow 3G connection
- [ ] Test touch gestures (swipe, pinch)
- [ ] Test in Chrome DevTools mobile mode

## Tools

- **Chrome DevTools**: Device emulation
- **Responsive Viewer Extension**: Multiple screens at once
- **BrowserStack**: Real device testing
- **Lighthouse**: Performance & accessibility audit

---

## Example: Full Responsive Component

```tsx
export function ResponsiveEventCard({ event }) {
  return (
    <motion.div
      whileTap={{ scale: 0.98 }} // Touch feedback
      className="
        /* Layout */
        relative overflow-hidden rounded-2xl
        
        /* Spacing */
        p-4 sm:p-6
        
        /* Colors */
        bg-white shadow-lg
        hover:shadow-xl transition-shadow
        
        /* Touch target */
        cursor-pointer
      "
    >
      {/* Image */}
      <div
        className="
        relative
        h-48 sm:h-56 md:h-64    /* Responsive height */
        w-full
      "
      >
        <Image
          src={event.coverImage}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>

      {/* Content */}
      <div className="mt-4">
        <h3
          className="
          text-lg sm:text-xl md:text-2xl  /* Scale with screen */
          font-handwriting
          line-clamp-2                    /* Max 2 lines */
        "
        >
          {event.title}
        </h3>

        <p
          className="
          mt-2
          text-sm sm:text-base    /* Responsive text */
          text-gray-600
          line-clamp-2
        "
        >
          {event.aiCaption}
        </p>
      </div>
    </motion.div>
  );
}
```

---

**Mobile-first is not just a buzzword — it's about making your app feel native and delightful on every device! 📱✨**
