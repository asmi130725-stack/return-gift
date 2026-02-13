# 🚀 GETTING STARTED - Complete Walkthrough

Welcome! This guide will take you from zero to a running application in ~15 minutes.

## 📋 Prerequisites

Before starting, make sure you have:

- [x] **Node.js 18+** installed ([Download](https://nodejs.org/))
  ```powershell
  node --version  # Should show v18.0.0 or higher
  ```
- [x] **Git** installed ([Download](https://git-scm.com/))
- [x] **Code editor** (VS Code recommended)
- [x] **Modern browser** (Chrome, Edge, Firefox)

## 🎯 Step-by-Step Setup

### Step 1: Install Dependencies (2 min)

```powershell
# Navigate to the project
cd c:\Coding\projects\return_gift

# Install all dependencies
npm install

# This will install:
# - Next.js, React, TypeScript
# - Tailwind CSS, Framer Motion
# - Supabase client, OpenAI client
# - Other utilities
```

**Troubleshooting**:

- If you get permission errors, run PowerShell as Administrator
- If install is slow, try: `npm install --legacy-peer-deps`

---

### Step 2: Set Up Supabase (5 min)

#### 2a. Create Supabase Account

1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign up with GitHub (recommended) or email
4. Verify your email

#### 2b. Create New Project

1. Click "New Project"
2. Fill in:
   - **Name**: `return-gift`
   - **Database Password**: (save this somewhere safe!)
   - **Region**: Choose closest to you
3. Click "Create new project"
4. Wait ~2 minutes for database to initialize

#### 2c. Run Database Setup

1. In Supabase, go to **SQL Editor** (left sidebar)
2. Click **"New query"**
3. Open `database-setup.sql` from the project
4. Copy the entire SQL script
5. Paste into Supabase SQL Editor
6. Click **"Run"** (or press Ctrl+Enter)
7. You should see: "Success. No rows returned"

#### 2d. Get API Keys

1. Go to **Settings** → **API** (left sidebar)
2. Copy these values (you'll need them next):
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public**: `eyJhbGc...` (long token)
   - **service_role**: `eyJhbGc...` (long token, keep secret!)

---

### Step 3: Get OpenAI API Key (3 min)

1. Go to [platform.openai.com](https://platform.openai.com/)
2. Sign up / Log in
3. Go to **API Keys** (left sidebar)
4. Click **"Create new secret key"**
5. Name it `return-gift-dev`
6. Copy the key (starts with `sk-`) - save it immediately!
7. **Important**: Add billing info ($5 minimum to start)

**Cost estimate**: ~$0.01 per event = $10 for 1000 events

---

### Step 4: Set Up Uploadthing (3 min)

1. Go to [uploadthing.com](https://uploadthing.com/)
2. Sign in with GitHub
3. Click **"Create a new app"**
4. Name it `return-gift`
5. Copy:
   - **App ID**: `your_app_id`
   - **Secret**: `sk_live_...`

**Alternative**: Use Supabase Storage instead (free)

---

### Step 5: Configure Environment (1 min)

```powershell
# Copy example file
Copy-Item .env.example .env.local

# Now edit .env.local with your favorite editor
code .env.local
```

Paste your credentials:

```env
# Supabase (from Step 2d)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# OpenAI (from Step 3)
OPENAI_API_KEY=sk-...

# Uploadthing (from Step 4)
UPLOADTHING_SECRET=sk_live_...
UPLOADTHING_APP_ID=your_app_id

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Save the file!**

---

### Step 6: Run the App! (1 min)

```powershell
# Start development server
npm run dev
```

You should see:

```
- Local:        http://localhost:3000
- Network:      http://192.168.x.x:3000
```

Open [http://localhost:3000](http://localhost:3000) in your browser! 🎉

---

## 📱 Test on Your Phone

### Option A: Same WiFi Network

1. Make sure your phone and computer are on the same WiFi
2. Find your computer's IP:
   ```powershell
   ipconfig
   ```
3. Look for "IPv4 Address" under your WiFi adapter (e.g., `192.168.1.5`)
4. On your phone, open browser and go to: `http://192.168.1.5:3000`

### Option B: Chrome DevTools

1. In Chrome, press `F12` to open DevTools
2. Press `Ctrl+Shift+M` to toggle device toolbar
3. Select "iPhone 12 Pro" or any mobile device
4. Test all the touch interactions!

---

## ✅ Verification Checklist

Go through these to make sure everything works:

### Basic Functionality

- [ ] Home page loads
- [ ] Navigation works
- [ ] "Events" page shows demo events
- [ ] Click on an event card
- [ ] Scrapbook page loads with photos
- [ ] Swipe gallery works (try swiping photos)
- [ ] Switch between "Gallery" and "Scrapbook" views

### Create Flow

- [ ] Click "Create New Memory"
- [ ] Fill in event details
- [ ] Click "Next: Add Photos"
- [ ] Try uploading a photo (or drag & drop)
- [ ] Form validation works

### Responsive Design

- [ ] Test on mobile view (Chrome DevTools)
- [ ] Bottom navigation appears on mobile
- [ ] Touch targets are large enough
- [ ] Text is readable without zooming

---

## 🐛 Common Issues & Fixes

### Issue: "Module not found"

**Fix**:

```powershell
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
```

### Issue: "Port 3000 is already in use"

**Fix**:

```powershell
# Use a different port
npm run dev -- -p 3001
```

### Issue: "Supabase connection failed"

**Check**:

1. Is `.env.local` in the project root?
2. Did you restart the dev server after adding env vars?
3. Are the Supabase URL and keys correct?

**Fix**:

```powershell
# Restart the server
# Press Ctrl+C to stop
npm run dev
```

### Issue: "OpenAI API key invalid"

**Check**:

1. Did you add billing to OpenAI account?
2. Is the key copied correctly (no spaces)?
3. Does it start with `sk-`?

### Issue: Images won't upload

**Check**:

1. Is Uploadthing configured?
2. Are the credentials in `.env.local`?
3. Check browser console for errors (F12)

---

## 🎨 Next Steps

### Customize for Your Girlfriend

#### 1. Change Colors

Edit `tailwind.config.ts`:

```typescript
romantic: {
  primary: '#FF1493', // Her favorite color!
  // ...
}
```

#### 2. Change Fonts

Edit `app/layout.tsx`:

```typescript
import { Pacifico } from "next/font/google";

const pacifico = Pacifico({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-pacifico",
});
```

#### 3. Add Personal Touches

- Change app title in `app/layout.tsx`
- Add a custom message on home page
- Upload photos of the two of you as defaults
- Customize AI prompt tone in `lib/openai.ts`

### Enable Real Features

#### Authentication

```typescript
// In Supabase dashboard:
// Authentication → Providers → Enable Email

// In your app:
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

const supabase = createClientComponentClient();

// Sign up
await supabase.auth.signUp({
  email: "her@email.com",
  password: "secure_password",
});
```

#### Real Photo Upload

See `lib/uploadthing.ts` (already configured!)

---

## 📖 Learn More

- **Next.js**: [nextjs.org/learn](https://nextjs.org/learn)
- **Tailwind**: [tailwindcss.com/docs](https://tailwindcss.com/docs)
- **Supabase**: [supabase.com/docs](https://supabase.com/docs)
- **OpenAI**: [platform.openai.com/docs](https://platform.openai.com/docs)

---

## 🚀 Deploy to Production

When you're ready to share with her:

```powershell
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Follow the prompts
# Add environment variables in Vercel dashboard
```

Your app will be live at: `https://return-gift.vercel.app`

---

## 💡 Pro Tips

1. **Start Simple**: Get the basic flow working before adding AI
2. **Test Early**: Test on your phone from day 1
3. **Iterate**: Build → Test → Improve
4. **Personal Touch**: Add photos and memories that are special to you both
5. **Surprise Factor**: Keep it secret until it's ready!

---

## 📞 Need Help?

**Check the docs**:

- [README.md](README.md) - Complete overview
- [AI_PROMPTS.md](AI_PROMPTS.md) - AI integration details
- [MOBILE_EXAMPLES.md](MOBILE_EXAMPLES.md) - Mobile design patterns

**Stuck?**

- Read error messages carefully
- Check browser console (F12)
- Verify environment variables
- Restart the dev server

---

## 🎉 You're All Set!

The app should now be running at [http://localhost:3000](http://localhost:3000)

**What you can do now**:

1. Explore the demo events
2. Try creating a new event
3. Test the swipeable gallery
4. See different scrapbook layouts
5. Start customizing!

**Happy coding! Build something beautiful for someone special! 💝**

---

## 📸 What It Looks Like

```
┌─────────────────────────────────┐
│     Return Gift 💝              │
│                                 │
│  ┌────────────────────────┐    │
│  │   Our Beach Getaway    │    │
│  │   [Beautiful Photo]    │    │
│  │   July 15, 2024        │    │
│  │   "The way you and I   │    │
│  │    watched the waves..." │   │
│  └────────────────────────┘    │
│                                 │
│  [Create New Memory] 💕         │
└─────────────────────────────────┘
```

That's you in 15 minutes! 🚀
