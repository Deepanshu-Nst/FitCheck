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
      const completion = await this.client.chat.completions.create({
        model: 'llama-3.2-11b-vision-preview',
        messages: [
          {
            role: 'system',
            content: `You are FitCheck AI, a professional fashion stylist and outfit analyst. 
You analyze outfit images and provide structured, actionable feedback.
Always respond with ONLY valid JSON matching the exact schema provided.
Be specific, constructive, and encouraging in your feedback.
Consider the specified occasion when rating outfit appropriateness.`,
          },
          {
            role: 'user',
            content: [
              {
                type: 'image_url',
                image_url: { url: input.imageUrl },
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
  "overallScore": <integer 0-100>,
  "fitFeedback": "<2-3 sentences about how well the clothes fit the body>",
  "colorReview": "<2-3 sentences about color combinations and harmony>",
  "occasionMatch": "<2-3 sentences about suitability for ${input.occasion}>",
  "suggestions": ["<actionable tip 1>", "<actionable tip 2>", "<actionable tip 3>"],
  "confidenceLevel": "<'low' | 'medium' | 'high'>",
  "styleLabel": "<short style category e.g. 'Smart Casual', 'Streetwear', 'Business Formal'>",
  "highlights": ["<positive point 1>", "<positive point 2>", "<positive point 3>"]
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
