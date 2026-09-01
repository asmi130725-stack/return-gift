import { GoogleGenerativeAI } from '@google/generative-ai'
import { Event, Photo, AIPhotoAnalysis, DecorativeElements, LayoutStyle } from '@/types'

const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || ''
const genAI = new GoogleGenerativeAI(apiKey)

const MODEL_NAME = 'gemini-1.5-flash'

/**
 * Generate a love quote or poetic caption for an event
 */
export async function generateEventCaption(
  event: Event,
  photos: Photo[]
): Promise<string> {
  if (!apiKey) return 'A cherished memory filled with love and unforgettable moments.'

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

Return only the quote/description text without quotes or formatting.`

  try {
    const model = genAI.getGenerativeModel({ model: MODEL_NAME })
    const result = await model.generateContent(prompt)
    const response = await result.response
    return response.text()?.trim() || ''
  } catch (error) {
    console.error('Gemini caption error:', error)
    return `Every moment spent together is a memory etched in eternity.`
  }
}

/**
 * Analyze a photo using Gemini 1.5 Flash Vision
 */
export async function analyzePhoto(imageUrl: string): Promise<AIPhotoAnalysis> {
  if (!apiKey) {
    return {
      subject: 'cherished memory',
      mood: 'romantic',
      theme: 'love',
      colors: ['#f43f5e', '#fb7185'],
    }
  }

  const prompt = `Analyze this photo and provide:
1. Main subject (e.g., "couple at beach", "city skyline", "food at restaurant")
2. Mood/atmosphere (e.g., "joyful", "intimate", "adventurous")
3. Suggested caption theme (e.g., "adventure", "romance", "fun")
4. Dominant colors (hex codes array)

Return strictly valid JSON only in this exact format:
{
  "subject": "...",
  "mood": "...",
  "theme": "...",
  "colors": ["#...", "#..."]
}`

  try {
    const model = genAI.getGenerativeModel({
      model: MODEL_NAME,
      generationConfig: { responseMimeType: 'application/json' },
    })

    // Fetch image data if remote URL
    const imageResp = await fetch(imageUrl)
    const arrayBuffer = await imageResp.arrayBuffer()
    const mimeType = imageResp.headers.get('content-type') || 'image/jpeg'

    const imagePart = {
      inlineData: {
        data: Buffer.from(arrayBuffer).toString('base64'),
        mimeType,
      },
    }

    const result = await model.generateContent([prompt, imagePart])
    const response = await result.response
    const text = response.text()
    return JSON.parse(text)
  } catch (error) {
    console.error('Gemini photo analysis error:', error)
    return {
      subject: 'beautiful moment',
      mood: 'romantic',
      theme: 'romance',
      colors: ['#fda4af', '#f43f5e'],
    }
  }
}

/**
 * Suggest the best layout style for an event
 */
export async function suggestLayoutStyle(
  event: Event,
  photoCount: number
): Promise<LayoutStyle> {
  if (!apiKey) return 'template1'

  const prompt = `Based on the following event and photo count, suggest the best scrapbook template:

Event: ${event.title}
Mood: ${event.mood || 'romantic'}
Number of photos: ${photoCount}
Notes: ${event.notes || 'None'}

Available templates:
- "template1": Classic Polaroid & Memory Collage (great for 1-4 photos)
- "template2": Romantic Grid with Sweet Accents (great for 4-6 photos)
- "template3": Magazine Editorial Storyboard (great for storytelling and high photo counts)
- "template6": Minimalist Aesthetic Showcase (clean, modern single/dual focus)

Return only the template ID (one of: template1, template2, template3, template6) with no other text.`

  try {
    const model = genAI.getGenerativeModel({ model: MODEL_NAME })
    const result = await model.generateContent(prompt)
    const response = await result.response
    const layout = response.text()?.trim().toLowerCase() || 'template1'
    
    const validLayouts: LayoutStyle[] = ['template1', 'template2', 'template3', 'template6']
    return validLayouts.includes(layout as LayoutStyle) ? (layout as LayoutStyle) : 'template1'
  } catch (error) {
    console.error('Gemini layout suggestion error:', error)
    return 'template1'
  }
}

/**
 * Generate decorative elements for a scrapbook page
 */
export async function generateDecorativeElements(
  mood: string
): Promise<DecorativeElements> {
  if (!apiKey) {
    return {
      border: 'polaroid frames',
      stickers: ['✨ stars', '💕 hearts'],
      background: 'soft watercolor wash',
      font: 'handwritten script',
    }
  }

  const prompt = `Suggest decorative elements for a scrapbook page with a "${mood}" mood.

Provide:
1. Border style (e.g., "hand-drawn hearts", "watercolor brush strokes", "polaroid frames")
2. Stickers/icons (e.g., ["✨ stars", "💕 hearts", "🌸 flowers"])
3. Background texture (e.g., "subtle paper grain", "soft watercolor wash")
4. Font suggestion (e.g., "handwritten script", "vintage typewriter")

Return strictly valid JSON only:
{
  "border": "...",
  "stickers": ["...", "..."],
  "background": "...",
  "font": "..."
}`

  try {
    const model = genAI.getGenerativeModel({
      model: MODEL_NAME,
      generationConfig: { responseMimeType: 'application/json' },
    })
    const result = await model.generateContent(prompt)
    const response = await result.response
    return JSON.parse(response.text())
  } catch (error) {
    console.error('Gemini decorative elements error:', error)
    return {
      border: 'watercolor brush strokes',
      stickers: ['💖 love', '✨ sparkles'],
      background: 'soft watercolor wash',
      font: 'handwritten script',
    }
  }
}

/**
 * Generate a caption for a single photo
 */
export async function generatePhotoCaption(
  imageUrl: string,
  mood: string
): Promise<string> {
  if (!apiKey) return 'A moment captured forever in time.'

  const prompt = `Write a short, sweet caption (1 sentence) for this photo with a ${mood} mood. Make it personal and heartfelt.`

  try {
    const model = genAI.getGenerativeModel({ model: MODEL_NAME })
    const imageResp = await fetch(imageUrl)
    const arrayBuffer = await imageResp.arrayBuffer()
    const mimeType = imageResp.headers.get('content-type') || 'image/jpeg'

    const imagePart = {
      inlineData: {
        data: Buffer.from(arrayBuffer).toString('base64'),
        mimeType,
      },
    }

    const result = await model.generateContent([prompt, imagePart])
    const response = await result.response
    return response.text()?.trim() || ''
  } catch (error) {
    console.error('Gemini photo caption error:', error)
    return 'Cherished moments with you.'
  }
}
