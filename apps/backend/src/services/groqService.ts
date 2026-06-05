import Groq from 'groq-sdk';

// ── Types ─────────────────────────────────────────────────────────────────────
export interface OutfitFeedbackInput {
  imageUrl: string;
  occasion: string;
  notes?: string;
}

export interface OutfitFeedbackResult {
  overallScore: number;       // 0-100
  fitFeedback: string;
  colorReview: string;
  occasionMatch: string;
  suggestions: string[];
  confidenceLevel: 'low' | 'medium' | 'high';
  styleLabel: string;         // e.g. "Smart Casual", "Streetwear"
  highlights: string[];       // positive points
}

// ── Mock Fallback ─────────────────────────────────────────────────────────────
const MOCK_FEEDBACK: OutfitFeedbackResult = {
  overallScore: 78,
  fitFeedback: 'The outfit appears well-fitted with proportions that complement the overall silhouette. The layers are balanced without looking bulky.',
  colorReview: 'The neutral color palette creates a harmonious look. The earth tones work cohesively and the contrast between light and dark pieces adds visual interest.',
  occasionMatch: 'This outfit aligns well with a casual setting. The relaxed but put-together nature suits everyday wear and low-key social gatherings.',
  suggestions: [
    'Consider adding a statement accessory to elevate the look',
    'A lighter footwear choice could improve overall balance',
    'The top layer could be slightly longer for better proportions',
  ],
  confidenceLevel: 'high',
  styleLabel: 'Smart Casual',
  highlights: [
    'Strong color harmony across all pieces',
    'Well-balanced layering',
    'Occasion-appropriate selection',
  ],
};

// ── Groq Service ──────────────────────────────────────────────────────────────
class GroqService {
  private client: Groq | null = null;
  private isMockMode: boolean;

  constructor() {
    const apiKey = process.env.GROQ_API_KEY;
    this.isMockMode = !apiKey;

    if (apiKey) {
      this.client = new Groq({ apiKey });
      console.log('✅ Groq AI initialized');
    } else {
      console.warn('⚠️  GROQ_API_KEY not set — running in mock mode');
    }
  }

  async generateOutfitFeedback(input: OutfitFeedbackInput): Promise<OutfitFeedbackResult> {
    if (this.isMockMode || !this.client) {
      // Return mock with slight randomization so each response feels unique
      return {
        ...MOCK_FEEDBACK,
        overallScore: Math.floor(Math.random() * 30) + 65, // 65-95 range
      };
    }

    const prompt = this.buildPrompt(input);

    try {
      // If image is a local URL, we must fetch it and convert to base64
      // since Groq's cloud servers cannot reach local IP addresses.
      let finalImageUrl = input.imageUrl;
      if (finalImageUrl.includes('localhost') || finalImageUrl.includes('10.') || finalImageUrl.includes('192.168.') || finalImageUrl.includes('127.0.0.1')) {
        const response = await fetch(finalImageUrl);
        if (!response.ok) throw new Error(`Failed to fetch local image: ${response.statusText}`);
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const mimeType = response.headers.get('content-type') || 'image/jpeg';
        finalImageUrl = `data:${mimeType};base64,${buffer.toString('base64')}`;
      }

      const completion = await this.client.chat.completions.create({
        model: 'meta-llama/llama-4-scout-17b-16e-instruct',
        messages: [
          {
            role: 'system',
            content: `
You are FitCheck AI, a fashion intelligence engine for outfit review.

Your job:
- Analyze the outfit image carefully.
- Evaluate style, fit, color harmony, occasion suitability, and overall presentation.
- Give practical, specific, and constructive feedback.
- Keep the tone professional, supportive, and confident.

Critical rules:
- Respond with ONLY valid JSON.
- Do not include markdown, code fences, commentary, or extra text.
- Do not mention uncertainty unless something is genuinely impossible to infer.
- If the image is unclear, still return valid JSON with the best possible assessment.
- Always consider the requested occasion when judging outfit suitability.
- Prefer actionable style advice over generic praise.

Output requirements:
- Match the exact JSON schema provided by the application.
- Every field must be present.
- Use concise but informative language. Keep feedback to exactly 1 short punchy sentence per block.
- Be visually and stylistically grounded, not overly dramatic.
- Make the feedback feel like a premium fashion app, not a chatbot.

Scoring Rules (overallScore):
1. IF the image is NOT of a person or outfit (e.g. random objects, rooms, landscapes), SCORE IT BETWEEN 0-20. Be brutally honest.
2. For actual outfits, START at 100 points, then deduct:
   - Subtract 10-25 points for poor fit or bad proportions.
   - Subtract 10-20 points for clashing or boring colors.
   - Subtract 10-30 points if it does not match the requested occasion.
   - Subtract 5-15 points if it lacks styling or effort.
3. This means a standard, boring outfit should score in the 40s or 50s.
4. Only truly exceptional outfits should score above 85.
5. Never default to 70 or 60. Calculate the deductions mathematically!
      `.trim(),
          },
          {
            role: 'user',
            content: [
              {
                type: 'image_url',
                image_url: { url: finalImageUrl },
              },
              {
                type: 'text',
                text: prompt,
              },
            ],
          },
        ],
        temperature: 0.7,
        max_tokens: 1024,
        response_format: { type: 'json_object' },
      });

      const raw = completion.choices[0]?.message?.content;
      if (!raw) throw new Error('Empty response from Groq');

      const parsed = JSON.parse(raw);
      return this.validateAndNormalize(parsed);
    } catch (err) {
      console.error('[GroqService] Error:', err);
      // Graceful fallback on parse/network error
      return MOCK_FEEDBACK;
    }
  }

  private buildPrompt(input: OutfitFeedbackInput): string {
    return `Analyze this outfit for a ${input.occasion} occasion.
${input.notes ? `User notes: "${input.notes}"` : ''}

Return a JSON object with EXACTLY these fields:
{
  "overallScore": <integer 0-100 based strictly on the rubric>,
  "fitFeedback": "<1 short, punchy sentence about the fit>",
  "colorReview": "<1 short, punchy sentence about color harmony>",
  "occasionMatch": "<1 short, punchy sentence about suitability for ${input.occasion}>",
  "suggestions": ["<short actionable tip 1>", "<short actionable tip 2>"],
  "confidenceLevel": "<'low' | 'medium' | 'high'>",
  "styleLabel": "<short style category e.g. 'Smart Casual', 'Streetwear', 'Business Formal'>",
  "highlights": ["<short positive point 1>", "<short positive point 2>"]
}`;
  }

  private validateAndNormalize(raw: Record<string, unknown>): OutfitFeedbackResult {
    return {
      overallScore: Math.min(100, Math.max(0, Number(raw.overallScore) || 70)),
      fitFeedback: String(raw.fitFeedback || 'No fit feedback available'),
      colorReview: String(raw.colorReview || 'No color review available'),
      occasionMatch: String(raw.occasionMatch || 'No occasion analysis available'),
      suggestions: Array.isArray(raw.suggestions) ? raw.suggestions.map(String) : [],
      confidenceLevel: (['low', 'medium', 'high'].includes(String(raw.confidenceLevel))
        ? raw.confidenceLevel
        : 'medium') as 'low' | 'medium' | 'high',
      styleLabel: String(raw.styleLabel || 'Casual'),
      highlights: Array.isArray(raw.highlights) ? raw.highlights.map(String) : [],
    };
  }
}

export const groqService = new GroqService();
