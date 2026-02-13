# 💝 Return Gift - AI-Powered Digital Scrapbook

A mobile-first, responsive web application that creates beautiful, AI-generated scrapbook pages from your cherished memories.

## 🎯 Project Overview

This application allows users to create digital scrapbooks by:

- Creating "dates" or "events" (trips, anniversaries, casual hangouts)
- Uploading multiple photos per event
- AI-generating beautiful scrapbook layouts
- AI-generating romantic & nostalgic captions
- Customizing themes, colors, and decorative elements

## 🏗️ Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Client (Mobile-First)                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │   Next.js   │  │  Tailwind   │  │   Framer    │     │
│  │   Pages     │  │     CSS     │  │   Motion    │     │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
└───────────────────────┬─────────────────────────────────┘
                        │
            ┌───────────┴───────────┐
            │                       │
┌───────────▼──────────┐  ┌────────▼─────────┐
│   API Routes         │  │   Image Storage  │
│   (Next.js)          │  │   (Cloudinary/   │
│                      │  │    Uploadthing)  │
│  • Events CRUD       │  │                  │
│  • AI Generation     │  │  • Upload        │
│  • Authentication    │  │  • Optimize      │
└───────────┬──────────┘  │  • Transform     │
            │             └──────────────────┘
            │
┌───────────▼──────────┐
│   Database           │
│   (Supabase/         │
│    Firebase)         │
│                      │
│  • Users             │
│  • Events            │
│  • Photos            │
│  • Layouts           │
└──────────────────────┘
```

### Data Model

```typescript
User {
  id: string
  email: string
  name: string
  createdAt: Date
}

Event {
  id: string
  userId: string
  title: string
  date: Date
  notes?: string
  mood?: 'romantic' | 'playful' | 'nostalgic' | 'adventurous'
  layoutStyle?: 'collage' | 'timeline' | 'polaroid' | 'journal'
  colorTheme?: string
  aiCaption?: string
  createdAt: Date
}

Photo {
  id: string
  eventId: string
  url: string
  publicId: string
  order: number
  aiGeneratedCaption?: string
  uploadedAt: Date
}
```

## 🛠️ Tech Stack (Mobile-First Reasoning)

### Frontend Framework: **Next.js 14+ (App Router)**

**Why Next.js?**

- ✅ **Server-Side Rendering**: Fast initial page loads crucial for mobile
- ✅ **API Routes**: Backend logic without separate server
- ✅ **Image Optimization**: Automatic responsive images
- ✅ **TypeScript Support**: Type safety out of the box
- ✅ **File-based Routing**: Simple, intuitive structure

### Styling: **Tailwind CSS**

**Why Tailwind?**

- ✅ **Mobile-First by Default**: `sm:`, `md:`, `lg:` breakpoints
- ✅ **Utility Classes**: Rapid prototyping
- ✅ **Small Bundle Size**: Only ships used CSS
- ✅ **Touch-Friendly Sizing**: Easy to implement large touch targets
- ✅ **Custom Theming**: Perfect for scrapbook aesthetics

### Animations: **Framer Motion**

**Why Framer Motion?**

- ✅ **Gesture Support**: Swipe, drag, pan for mobile
- ✅ **Smooth Animations**: 60fps on mobile devices
- ✅ **Layout Animations**: Easy transitions between layouts
- ✅ **Touch-Optimized**: Built for mobile interactions

### Image Storage: **Uploadthing / Cloudinary**

**Why Uploadthing?**

- ✅ **Next.js Integration**: Seamless setup
- ✅ **Automatic Optimization**: Mobile-friendly image sizes
- ✅ **Simple API**: Easy to implement
- ✅ **Free Tier**: Good for getting started

**Alternative: Cloudinary**

- ✅ **Advanced Transformations**: AI-powered cropping
- ✅ **Responsive Images**: Automatic format selection
- ✅ **CDN**: Fast loading worldwide

### Database: **Supabase**

**Why Supabase?**

- ✅ **PostgreSQL**: Powerful, reliable database
- ✅ **Real-time**: Live updates (for future features)
- ✅ **Built-in Auth**: Email, OAuth, magic links
- ✅ **Row Level Security**: Secure by default
- ✅ **Generous Free Tier**: Perfect for side projects
- ✅ **Storage**: Built-in file storage (alternative to Uploadthing)

**Alternative: Firebase**

- ✅ **Simple Setup**: Quick to get started
- ✅ **NoSQL**: Flexible data model
- ✅ **Authentication**: Easy social login

### AI Integration: **OpenAI API (GPT-4 Vision)**

**Why OpenAI?**

- ✅ **GPT-4 Vision**: Analyze photos for context
- ✅ **Creative Text**: Generate romantic captions
- ✅ **Structured Output**: Suggest layouts and themes
- ✅ **Simple API**: Easy to integrate

### Authentication: **NextAuth.js (Auth.js)**

**Why NextAuth.js?**

- ✅ **Next.js Native**: Built for Next.js
- ✅ **Multiple Providers**: Email, Google, GitHub
- ✅ **Secure**: Industry-standard security
- ✅ **Session Management**: Built-in

## 📱 Mobile-First Design Principles

### 1. Touch Targets

- Minimum 44px × 44px for all interactive elements
- Generous padding and spacing
- Large, thumb-friendly buttons

### 2. Performance

- Image lazy loading
- Route-based code splitting
- Optimized font loading
- Minimal JavaScript

### 3. Navigation

- Bottom navigation for easy thumb access
- Swipe gestures for galleries
- Pull-to-refresh
- Floating action buttons

### 4. Layout

- Single-column on mobile
- Progressive enhancement for larger screens
- Sticky headers
- Safe area insets (for notched phones)

## 🎨 Design System

### Color Themes (AI-Generated Based on Mood)

```typescript
const themes = {
  romantic: {
    primary: "#FF6B9D", // Soft pink
    secondary: "#C44569", // Deep rose
    accent: "#FFE66D", // Warm yellow
    background: "#FFF5F7", // Blush white
  },
  playful: {
    primary: "#4ECDC4", // Teal
    secondary: "#FF6B6B", // Coral
    accent: "#FFE66D", // Yellow
    background: "#F7FFF7", // Mint white
  },
  nostalgic: {
    primary: "#D4A574", // Sepia gold
    secondary: "#8B7355", // Warm brown
    accent: "#E8D5C4", // Cream
    background: "#FAF7F2", // Aged paper
  },
  adventurous: {
    primary: "#2E86AB", // Ocean blue
    secondary: "#A23B72", // Plum
    accent: "#F18F01", // Sunset orange
    background: "#F6F8FF", // Sky white
  },
};
```

### Typography

```css
/* Headings - Romantic, handwritten feel */
font-family: "Caveat", cursive; /* For titles */
font-family: "Dancing Script", cursive; /* For romantic quotes */

/* Body - Clean, readable */
font-family: "Inter", sans-serif; /* For UI text */
font-family: "Lora", serif; /* For journal entries */
```

## 🤖 AI Prompt Examples

### 1. Generate Event Caption

```typescript
const generateEventCaptionPrompt = (event: Event, photos: Photo[]) => `
You are a creative writer specializing in romantic and nostalgic storytelling.

Event Details:
- Title: ${event.title}
- Date: ${event.date}
- Notes: ${event.notes || "No notes provided"}
- Mood: ${event.mood || "romantic"}
- Number of photos: ${photos.length}

Task: Generate a heartfelt, 2-3 sentence caption for this memory. 
The caption should be:
- Warm and genuine
- Not overly cheesy or cliché
- Written in second person ("you and I", "we")
- Reflect the mood: ${event.mood}

Return only the caption text, nothing else.
`;
```

### 2. Analyze Photo for Context (GPT-4 Vision)

```typescript
const analyzePhotoPrompt = () => `
Analyze this photo and provide:
1. Main subject (e.g., "couple at beach", "city skyline", "food at restaurant")
2. Mood/atmosphere (e.g., "joyful", "intimate", "adventurous")
3. Suggested caption theme (e.g., "adventure", "romance", "fun")
4. Dominant colors (hex codes)

Return as JSON:
{
  "subject": "...",
  "mood": "...",
  "theme": "...",
  "colors": ["#...", "#..."]
}
`;
```

### 3. Suggest Layout Style

```typescript
const suggestLayoutPrompt = (event: Event, photoCount: number) => `
Based on the following event, suggest the best scrapbook layout style:

Event: ${event.title}
Mood: ${event.mood}
Number of photos: ${photoCount}
Notes: ${event.notes}

Available layouts:
- "collage": Mixed sizes, overlapping, creative angles (best for 5+ photos)
- "timeline": Sequential, chronological flow (best for storytelling)
- "polaroid": Vintage polaroid style, scattered (best for 3-8 photos)
- "journal": Clean, diary-style with text emphasis (best for intimate moments)
- "grid": Clean grid, equal sizes (best for 4, 6, or 9 photos)

Return only the layout name that best fits this memory.
`;
```

### 4. Generate Decorative Elements

```typescript
const generateDecorativeElementsPrompt = (mood: string) => `
Suggest decorative elements for a scrapbook page with a ${mood} mood.

Provide:
1. Border style (e.g., "hand-drawn hearts", "watercolor brush strokes", "polaroid frames")
2. Stickers/icons (e.g., "✨ stars", "💕 hearts", "🌸 flowers")
3. Background texture (e.g., "subtle paper grain", "soft watercolor wash")
4. Font suggestion (e.g., "handwritten script", "vintage typewriter")

Return as JSON:
{
  "border": "...",
  "stickers": ["...", "..."],
  "background": "...",
  "font": "..."
}
`;
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account (free tier)
- OpenAI API key
- Uploadthing account (or Cloudinary)

### Installation

```bash
# Navigate to project directory
cd return_gift

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Edit .env.local with your credentials
```

### Environment Variables

```env
# Database (Supabase)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret

# AI
OPENAI_API_KEY=your_openai_api_key

# Image Storage (choose one)
UPLOADTHING_SECRET=your_uploadthing_secret
UPLOADTHING_APP_ID=your_uploadthing_app_id
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your mobile browser or use Chrome DevTools' mobile emulator.

## 📂 Project Structure

```
return_gift/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Auth pages
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── (main)/            # Main app pages
│   │   │   ├── events/
│   │   │   ├── create/
│   │   │   └── scrapbook/[id]/
│   │   ├── api/               # API routes
│   │   │   ├── auth/
│   │   │   ├── events/
│   │   │   ├── ai/
│   │   │   └── upload/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/            # React components
│   │   ├── ui/               # Base UI components
│   │   ├── events/           # Event-specific components
│   │   ├── scrapbook/        # Scrapbook layouts
│   │   └── upload/           # Photo upload components
│   ├── lib/                  # Utilities
│   │   ├── supabase.ts
│   │   ├── openai.ts
│   │   └── utils.ts
│   ├── hooks/                # Custom React hooks
│   └── types/                # TypeScript types
├── public/
│   ├── fonts/
│   └── images/
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.js
```

## 🎯 Key Features Implementation

### Feature 1: Photo Upload (Mobile-Optimized)

- Drag-and-drop on desktop
- Tap-to-select on mobile
- Camera integration (mobile)
- Multi-select support
- Upload progress indicators
- Image preview before upload

### Feature 2: Swipeable Photo Gallery

- Touch gestures (swipe, pinch-to-zoom)
- Smooth animations
- Lazy loading
- Full-screen mode
- Caption overlays

### Feature 3: AI Layout Generation

- Analyze photo count and aspect ratios
- Suggest optimal layout
- Generate multiple options
- One-tap regenerate
- Preview before saving

### Feature 4: AI Caption Generation

- Context-aware (date, location, mood)
- Multiple tone options
- Editable after generation
- Save drafts

### Feature 5: Responsive Scrapbook Viewer

- Optimized for each screen size
- Pinch-to-zoom on mobile
- Share functionality
- Download as PDF/image

## 🎨 Component Examples

See the `src/components/` directory for:

- `EventCard.tsx` - Mobile-first event card
- `PhotoUpload.tsx` - Touch-friendly upload component
- `ScrapbookLayout.tsx` - Responsive layout renderer
- `SwipeableGallery.tsx` - Touch-optimized photo viewer
- `AIGenerateButton.tsx` - AI generation interface

## 📱 Responsive Breakpoints

```typescript
// Tailwind breakpoints (mobile-first)
const breakpoints = {
  sm: "640px", // Large phones, small tablets
  md: "768px", // Tablets
  lg: "1024px", // Laptops
  xl: "1280px", // Desktops
  "2xl": "1536px", // Large desktops
};
```

## 🔐 Security Considerations

- Row Level Security (RLS) in Supabase
- Authenticated uploads only
- Rate limiting on AI endpoints
- Image file type validation
- Max file size limits
- Sanitized user input

## 🚀 Deployment

### Recommended: Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Alternative: Netlify, Railway, or any Node.js host

## 📈 Future Enhancements

- [ ] Collaborative scrapbooks (share with partner)
- [ ] Physical print ordering
- [ ] Video support
- [ ] Audio messages
- [ ] Location tagging
- [ ] Calendar integration
- [ ] Social sharing (Instagram Stories, etc.)
- [ ] Themes marketplace
- [ ] AI-suggested event titles based on photos

## 💝 Perfect For

- Anniversary gifts
- Valentine's Day
- Birthday surprises
- Long-distance relationships
- Travel memories
- Everyday moments

---

Built with ❤️ for creating beautiful memories together.
