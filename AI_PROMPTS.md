# 🤖 AI Integration Guide

This document contains all the AI prompts, integration patterns, and best practices for the Return Gift scrapbook application.

## Table of Contents

1. [AI Capabilities](#ai-capabilities)
2. [Prompt Templates](#prompt-templates)
3. [Integration Examples](#integration-examples)
4. [Best Practices](#best-practices)
5. [Cost Optimization](#cost-optimization)

## AI Capabilities

The app uses OpenAI's GPT-4 and GPT-4 Vision for:

1. **Event Caption Generation** - Create romantic, personalized captions
2. **Photo Analysis** - Extract context, mood, and colors from images
3. **Layout Suggestion** - Recommend optimal scrapbook layouts
4. **Decorative Elements** - Suggest borders, stickers, and styling
5. **Individual Photo Captions** - Generate captions for single photos

## Prompt Templates

### 1. Event Caption Generation

**Purpose**: Generate a heartfelt caption for an entire event

**Model**: GPT-4 Turbo

**Prompt Structure**:

```typescript
const prompt = `You are a creative writer specializing in romantic and nostalgic storytelling.

Event Details:
- Title: ${event.title}
- Date: ${formatDate(event.date)}
- Notes: ${event.notes || "No notes provided"}
- Mood: ${event.mood || "romantic"}
- Number of photos: ${photos.length}

Task: Generate a heartfelt, 2-3 sentence caption for this memory. 

The caption should be:
- Warm and genuine
- Not overly cheesy or cliché
- Written in second person ("you and I", "we")
- Reflect the mood: ${event.mood || "romantic"}

Return only the caption text, nothing else.`;
```

**Example Output**:

```
"The way you and I watched the waves dance under that golden sky —
some moments are made to last forever."
```

**Parameters**:

- `temperature`: 0.8 (creative but not random)
- `max_tokens`: 150
- `model`: gpt-4-turbo-preview

---

### 2. Photo Analysis (GPT-4 Vision)

**Purpose**: Analyze image content, mood, and colors

**Model**: GPT-4 Vision

**Prompt Structure**:

```typescript
const prompt = `Analyze this photo and provide:
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
}`;
```

**Example Output**:

```json
{
  "subject": "couple watching sunset on beach",
  "mood": "romantic and peaceful",
  "theme": "romance",
  "colors": ["#FF6B45", "#FFA07A", "#87CEEB", "#F4A460"]
}
```

**Parameters**:

- `max_tokens`: 300
- `model`: gpt-4-vision-preview

---

### 3. Layout Suggestion

**Purpose**: Recommend the best scrapbook layout

**Model**: GPT-4 Turbo

**Prompt Structure**:

```typescript
const prompt = `Based on the following event, suggest the best scrapbook layout style:

Event: ${event.title}
Mood: ${event.mood || "romantic"}
Number of photos: ${photoCount}
Notes: ${event.notes || "None"}

Available layouts:
- "collage": Mixed sizes, overlapping, creative angles (best for 5+ photos)
- "timeline": Sequential, chronological flow (best for storytelling)
- "polaroid": Vintage polaroid style, scattered (best for 3-8 photos)
- "journal": Clean, diary-style with text emphasis (best for intimate moments)
- "grid": Clean grid, equal sizes (best for 4, 6, or 9 photos)

Return only the layout name that best fits this memory.`;
```

**Example Output**:

```
polaroid
```

**Parameters**:

- `temperature`: 0.5 (more deterministic)
- `max_tokens`: 20
- `model`: gpt-4-turbo-preview

---

### 4. Decorative Elements

**Purpose**: Suggest design elements based on mood

**Model**: GPT-4 Turbo

**Prompt Structure**:

```typescript
const prompt = `Suggest decorative elements for a scrapbook page with a ${mood} mood.

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
}`;
```

**Example Output**:

```json
{
  "border": "hand-drawn hearts and doodles",
  "stickers": ["💕 hearts", "✨ sparkles", "🌸 cherry blossoms"],
  "background": "soft pink watercolor wash",
  "font": "handwritten script"
}
```

**Parameters**:

- `temperature`: 0.7
- `max_tokens`: 200
- `model`: gpt-4-turbo-preview

---

### 5. Individual Photo Caption

**Purpose**: Generate caption for a single photo

**Model**: GPT-4 Vision

**Prompt Structure**:

```typescript
const prompt = `Write a short, sweet caption (1 sentence) for this photo with a ${mood} mood. Make it personal and heartfelt.`;
```

**Example Output**:

```
"Your smile in this moment is everything I never knew I needed."
```

**Parameters**:

- `max_tokens`: 100
- `model`: gpt-4-vision-preview

---

## Integration Examples

### Example 1: Generate Caption on Event Creation

```typescript
// In your API route or server action
import { generateEventCaption } from "@/lib/openai";

export async function createEventWithAI(eventData, photos) {
  // 1. Create event first
  const event = await createEvent(eventData);

  // 2. Upload photos
  const uploadedPhotos = await uploadPhotos(photos, event.id);

  // 3. Generate AI caption
  try {
    const caption = await generateEventCaption(event, uploadedPhotos);

    // 4. Update event with caption
    await updateEvent(event.id, { aiCaption: caption });
  } catch (error) {
    console.error("AI generation failed:", error);
    // Continue without caption - don't block the user
  }

  return event;
}
```

### Example 2: Suggest Layout Before Rendering

```typescript
// In your component
import { useState, useEffect } from 'react'

export function ScrapbookViewer({ event, photos }) {
  const [layout, setLayout] = useState('grid') // default
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function suggestLayout() {
      try {
        const response = await fetch('/api/ai/layout', {
          method: 'POST',
          body: JSON.stringify({ event, photoCount: photos.length })
        })
        const { layoutStyle } = await response.json()
        setLayout(layoutStyle)
      } catch (error) {
        console.error('Layout suggestion failed:', error)
      } finally {
        setLoading(false)
      }
    }

    suggestLayout()
  }, [event, photos])

  if (loading) return <Skeleton />

  return <ScrapbookLayout photos={photos} layoutStyle={layout} />
}
```

### Example 3: Regenerate Caption

```typescript
// Allow users to regenerate if they don't like the first one
export async function regenerateCaption(eventId: string) {
  const event = await getEvent(eventId);
  const photos = await getPhotos(eventId);

  // Add variety by adjusting temperature
  const caption = await generateEventCaption(event, photos, {
    temperature: 0.9, // More creative
  });

  await updateEvent(eventId, { aiCaption: caption });
  return caption;
}
```

---

## Best Practices

### 1. Error Handling

Always gracefully handle AI failures:

```typescript
async function safeAIGeneration<T>(
  operation: () => Promise<T>,
  fallback: T,
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    console.error("AI generation failed:", error);
    // Log to monitoring service
    return fallback;
  }
}

// Usage
const caption = await safeAIGeneration(
  () => generateEventCaption(event, photos),
  "A beautiful memory to cherish forever.",
);
```

### 2. Rate Limiting

Prevent abuse and manage costs:

```typescript
import { Ratelimit } from "@upstash/ratelimit";

const ratelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(10, "1 h"), // 10 requests per hour
});

export async function POST(request: Request) {
  const userId = getUserId(request);
  const { success } = await ratelimit.limit(userId);

  if (!success) {
    return new Response("Rate limit exceeded", { status: 429 });
  }

  // Continue with AI generation
}
```

### 3. Streaming Responses (Advanced)

For real-time caption generation:

```typescript
import { OpenAIStream, StreamingTextResponse } from "ai";

export async function POST(request: Request) {
  const { event, photos } = await request.json();

  const response = await openai.chat.completions.create({
    model: "gpt-4-turbo-preview",
    messages: [{ role: "user", content: prompt }],
    stream: true,
  });

  const stream = OpenAIStream(response);
  return new StreamingTextResponse(stream);
}
```

### 4. Caching

Cache AI responses to save costs:

```typescript
// Use Redis or similar
async function getCachedCaption(eventId: string) {
  const cached = await redis.get(`caption:${eventId}`);
  if (cached) return cached;

  const caption = await generateEventCaption(event, photos);
  await redis.set(`caption:${eventId}`, caption, { ex: 3600 }); // 1 hour

  return caption;
}
```

---

## Cost Optimization

### Model Selection

| Task            | Model         | Cost per 1K tokens | Speed  |
| --------------- | ------------- | ------------------ | ------ |
| Simple captions | GPT-3.5 Turbo | $0.0015            | ⚡⚡⚡ |
| Rich captions   | GPT-4 Turbo   | $0.01              | ⚡⚡   |
| Image analysis  | GPT-4 Vision  | $0.01 + image      | ⚡     |

### Estimated Costs

**Per Event (assuming GPT-4 Turbo)**:

- Event caption: ~150 tokens = $0.0015
- Layout suggestion: ~50 tokens = $0.0005
- Photo analysis (4 photos): ~1200 tokens = $0.012
- **Total per event: ~$0.014** (1.4 cents)

**Monthly costs** (100 users, 10 events each):

- 1000 events × $0.014 = $14/month

### Optimization Tips

1. **Use GPT-3.5 Turbo for simple tasks**: 10x cheaper
2. **Batch requests**: Combine multiple captions in one call
3. **Cache aggressively**: Same event = same caption
4. **Limit regenerations**: Allow 3 regenerations max per event
5. **Skip vision for user-uploaded images**: Only use when needed

---

## Testing AI Prompts

### Local Testing Script

```typescript
// scripts/test-ai.ts
import { generateEventCaption } from "@/lib/openai";

const testEvent = {
  title: "Beach Sunset",
  date: new Date("2024-07-15"),
  mood: "romantic",
  notes: "Perfect evening",
};

const testPhotos = [
  { url: "https://...", order: 0 },
  { url: "https://...", order: 1 },
];

async function test() {
  console.log("Testing caption generation...");
  const caption = await generateEventCaption(testEvent, testPhotos);
  console.log("Generated caption:", caption);
}

test();
```

Run: `tsx scripts/test-ai.ts`

---

## Prompt Iteration Tips

1. **Start simple**: Basic prompt → test → refine
2. **Use examples**: Show GPT what you want (few-shot learning)
3. **Be specific**: "Romantic, 2 sentences" vs "Write something nice"
4. **Test edge cases**: Empty notes, 1 photo, 20 photos
5. **Compare models**: GPT-3.5 vs GPT-4 quality/cost tradeoff

---

**Next Steps**:

- Implement A/B testing for prompts
- Add user feedback ("regenerate" button click rate)
- Monitor token usage per user
- Create prompt version control

Happy building! 🚀
