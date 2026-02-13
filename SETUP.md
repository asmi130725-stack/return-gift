# 🚀 Quick Start Guide

## Step 1: Install Dependencies

```powershell
cd c:\Coding\projects\return_gift
npm install
```

## Step 2: Set Up Supabase

### Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Fill in project details
4. Wait for database to initialize

### Create Database Tables

Run this SQL in Supabase SQL Editor:

```sql
-- Users table (handled by Supabase Auth)

-- Events table
CREATE TABLE events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  notes TEXT,
  mood TEXT CHECK (mood IN ('romantic', 'playful', 'nostalgic', 'adventurous')),
  layout_style TEXT CHECK (layout_style IN ('collage', 'timeline', 'polaroid', 'journal', 'grid')),
  color_theme TEXT,
  ai_caption TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Photos table
CREATE TABLE photos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  url TEXT NOT NULL,
  public_id TEXT NOT NULL,
  "order" INTEGER NOT NULL,
  ai_generated_caption TEXT,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security (RLS)
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;

-- Policies for events
CREATE POLICY "Users can view their own events"
  ON events FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own events"
  ON events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own events"
  ON events FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own events"
  ON events FOR DELETE
  USING (auth.uid() = user_id);

-- Policies for photos
CREATE POLICY "Users can view photos of their events"
  ON photos FOR SELECT
  USING (
    event_id IN (
      SELECT id FROM events WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create photos for their events"
  ON photos FOR INSERT
  WITH CHECK (
    event_id IN (
      SELECT id FROM events WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update photos of their events"
  ON photos FOR UPDATE
  USING (
    event_id IN (
      SELECT id FROM events WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete photos of their events"
  ON photos FOR DELETE
  USING (
    event_id IN (
      SELECT id FROM events WHERE user_id = auth.uid()
    )
  );
```

## Step 3: Get API Keys

### Supabase

1. Go to Project Settings > API
2. Copy `Project URL` and `anon public` key

### OpenAI

1. Go to [platform.openai.com](https://platform.openai.com/api-keys)
2. Create a new API key
3. Copy the key (starts with `sk-`)

### Uploadthing (Image Storage)

1. Go to [uploadthing.com](https://uploadthing.com)
2. Create a new app
3. Copy the Secret and App ID

## Step 4: Configure Environment Variables

Create `.env.local` file:

```powershell
Copy-Item .env.example .env.local
```

Edit `.env.local` and add your credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

OPENAI_API_KEY=sk-...

UPLOADTHING_SECRET=sk_live_...
UPLOADTHING_APP_ID=...

NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Step 5: Run the Development Server

```powershell
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser!

## Testing on Mobile

### Option 1: Same Network

1. Find your computer's IP address:
   ```powershell
   ipconfig
   ```
2. Look for "IPv4 Address" (e.g., `192.168.1.5`)
3. On your phone, visit `http://192.168.1.5:3000`

### Option 2: Chrome DevTools

1. Open Chrome DevTools (F12)
2. Click the device toolbar (Ctrl+Shift+M)
3. Select a mobile device

## Deployment

### Deploy to Vercel (Recommended)

```powershell
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel
```

Then add your environment variables in Vercel dashboard.

## Troubleshooting

### "Cannot find module" errors

```powershell
rm -rf node_modules
rm package-lock.json
npm install
```

### Port 3000 already in use

```powershell
npm run dev -- -p 3001
```

### Images not loading

- Check Uploadthing configuration
- Verify domain in `next.config.js`
- Check browser console for errors

---

Need help? Check the [README.md](README.md) for full documentation!
