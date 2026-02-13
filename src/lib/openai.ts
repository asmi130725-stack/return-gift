import OpenAI from 'openai'
import { Event, Photo, AIPhotoAnalysis, DecorativeElements, LayoutStyle } from '@/types'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

/**
 * Generate a love quote for an event
 */
export async function generateEventCaption(
  event: Event,
  photos: Photo[]
): Promise<string> {
  const prompt = `You are a romantic writer who creates beautiful love quotes and poetic descriptions.

Event Details:
- Title: ${event.title}
- Date: ${new Date(event.date).toLocaleDateString()}
- Notes: ${event.notes || 'No notes provided'}
- Mood: ${event.mood || 'romantic'}
- Number of photos: ${photos.length}

Task: Generate a beautiful love quote or poetic description (1-2 sentences) for this memory. 
The quote should be:
- Romantic and heartfelt
- Poetic and beautiful
- About love, togetherness, or cherished moments
- Reflect the mood: ${event.mood || 'romantic'}
- Can be written as a quote, poem excerpt, or loving description

Return only the quote/description text, nothing else.`

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: 'You are a romantic and creative writer who specializes in capturing beautiful moments in words.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    temperature: 0.8,
    max_tokens: 150,
  })

  return response.choices[0].message.content || ''
}

/**
 * Analyze a photo using GPT-4 Vision
 */
export async function analyzePhoto(imageUrl: string): Promise<AIPhotoAnalysis> {
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
}`

  const response = await openai.chat.completions.create({
    model: 'gpt-4-vision-preview',
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: prompt },
          { type: 'image_url', image_url: { url: imageUrl } },
        ],
      },
    ],
    max_tokens: 300,
  })

  const content = response.choices[0].message.content || '{}'
  return JSON.parse(content)
}

/**
 * Suggest the best layout style for an event
 */
export async function suggestLayoutStyle(
  event: Event,
  photoCount: number
): Promise<LayoutStyle> {
  const prompt = `Based on the following event, suggest the best scrapbook layout style:

Event: ${event.title}
Mood: ${event.mood || 'romantic'}
Number of photos: ${photoCount}
Notes: ${event.notes || 'None'}

Available layouts:
- "collage": Mixed sizes, overlapping, creative angles (best for 5+ photos)
- "timeline": Sequential, chronological flow (best for storytelling)
- "polaroid": Vintage polaroid style, scattered (best for 3-8 photos)
- "journal": Clean, diary-style with text emphasis (best for intimate moments)
- "grid": Clean grid, equal sizes (best for 4, 6, or 9 photos)

Return only the layout name that best fits this memory.`

  const response = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [
      {
        role: 'system',
        content: 'You are a scrapbook design expert.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    temperature: 0.5,
    max_tokens: 20,
  })

  const layout = response.choices[0].message.content?.trim().toLowerCase() || 'collage'
  return layout as LayoutStyle
}

/**
 * Generate decorative elements for a scrapbook page
 */
export async function generateDecorativeElements(
  mood: string
): Promise<DecorativeElements> {
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
}`

  const response = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
    temperature: 0.7,
    max_tokens: 200,
  })

  const content = response.choices[0].message.content || '{}'
  return JSON.parse(content)
}

/**
 * Generate a caption for a single photo
 */
export async function generatePhotoCaption(
  imageUrl: string,
  mood: string
): Promise<string> {
  const prompt = `Write a short, sweet caption (1 sentence) for this photo with a ${mood} mood. Make it personal and heartfelt.`

  const response = await openai.chat.completions.create({
    model: 'gpt-4-vision-preview',
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: prompt },
          { type: 'image_url', image_url: { url: imageUrl } },
        ],
      },
    ],
    max_tokens: 100,
  })

  return response.choices[0].message.content || ''
}
