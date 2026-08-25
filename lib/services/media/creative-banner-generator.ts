import { generateGeminiText } from '../../ai/providers/gemini';
import OpenAI from 'openai';

function getOpenAIClient(): OpenAI | null {
  const key = (process.env.OPENAI_API_KEY || process.env.OPENAPI_KEY || process.env.OPENAI_KEY || '').trim();
  if (!key || key.startsWith('your_') || key === 'mock_api_key') {
    return null;
  }
  return new OpenAI({ apiKey: key });
}

// Curated high-converting industry fallback assets
const INDUSTRY_VISUALS: Record<string, { image: string; video: string }> = {
  eyecare: {
    image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=1200&auto=format&fit=crop&q=85',
    video: 'https://assets.mixkit.co/videos/preview/mixkit-optometrist-examining-a-patients-eyes-41581-large.mp4',
  },
  healthcare: {
    image: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=1200&auto=format&fit=crop&q=85',
    video: 'https://assets.mixkit.co/videos/preview/mixkit-doctor-talking-to-a-patient-in-a-clinic-41584-large.mp4',
  },
  tech: {
    image: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=1200&auto=format&fit=crop&q=85',
    video: 'https://assets.mixkit.co/videos/preview/mixkit-software-developer-working-on-code-41570-large.mp4',
  },
  marketing: {
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&auto=format&fit=crop&q=85',
    video: 'https://assets.mixkit.co/videos/preview/mixkit-hands-holding-a-smartphone-with-social-media-icons-42352-large.mp4',
  },
  realestate: {
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&auto=format&fit=crop&q=85',
    video: 'https://assets.mixkit.co/videos/preview/mixkit-modern-apartment-living-room-41549-large.mp4',
  },
  default: {
    image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200&auto=format&fit=crop&q=85',
    video: 'https://assets.mixkit.co/videos/preview/mixkit-hands-typing-on-a-laptop-keyboard-41566-large.mp4',
  },
};

function detectIndustryCategory(text: string): string {
  const lower = text.toLowerCase();
  if (lower.includes('eye') || lower.includes('optom') || lower.includes('lasik') || lower.includes('vision') || lower.includes('jeevan')) {
    return 'eyecare';
  }
  if (lower.includes('health') || lower.includes('doctor') || lower.includes('clinic') || lower.includes('medical') || lower.includes('dental')) {
    return 'healthcare';
  }
  if (lower.includes('tech') || lower.includes('saas') || lower.includes('software') || lower.includes('ai') || lower.includes('app')) {
    return 'tech';
  }
  if (lower.includes('real estate') || lower.includes('property') || lower.includes('home') || lower.includes('condo')) {
    return 'realestate';
  }
  if (lower.includes('market') || lower.includes('ad') || lower.includes('brand') || lower.includes('agency')) {
    return 'marketing';
  }
  return 'default';
}

export async function generateCreativeBanner(options: {
  prompt: string;
  aspectRatio?: string;
  campaignTitle?: string;
  clientName?: string;
  provider?: 'gemini' | 'openai' | 'flux';
}): Promise<string> {
  const { prompt, aspectRatio = '4:5', campaignTitle, clientName, provider } = options;

  let width = 1024;
  let height = 1024;
  if (aspectRatio === '4:5') {
    width = 1024;
    height = 1280;
  } else if (aspectRatio === '9:16') {
    width = 720;
    height = 1280;
  } else if (aspectRatio === '16:9') {
    width = 1280;
    height = 720;
  }

  const industry = detectIndustryCategory(`${prompt} ${clientName || ''} ${campaignTitle || ''}`);

  // 1. Try OpenAI DALL-E 3 first if OpenAI is selected or available
  const openai = getOpenAIClient();
  if (openai && provider === 'openai') {
    try {
      let size: '1024x1024' | '1024x1792' | '1792x1024' = '1024x1024';
      if (aspectRatio === '9:16' || aspectRatio === '4:5') size = '1024x1792';
      else if (aspectRatio === '16:9') size = '1792x1024';

      const res = await openai.images.generate({
        model: 'dall-e-3',
        prompt: `High-end commercial advertisement photograph for ${clientName || 'Brand'}: ${prompt}. Clean modern aesthetics, cinematic studio lighting, 8k resolution, authentic and photorealistic.`,
        n: 1,
        size,
        quality: 'standard',
      });

      if (res.data?.[0]?.url) {
        return res.data[0].url;
      }
    } catch (openAiErr: any) {
      console.warn('[OpenAI DALL-E Warning, falling back to AI Visual Engine]:', openAiErr?.message || openAiErr);
    }
  }

  // 2. High-Fidelity Domain-Aware Prompt Engine
  let enrichedPrompt = `commercial advertising photography of ${prompt} for ${clientName || 'Modern Brand'}, professional cinematic studio lighting, clean architectural background, photorealistic 8k detail, ultra realistic award-winning ad visual`;

  if (process.env.GEMINI_API_KEY && !process.env.GEMINI_API_KEY.startsWith('your_')) {
    try {
      const geminiPrompt = await generateGeminiText(
        `You are a World-Class Commercial Ad Art Director. Write a photorealistic image generation prompt for this campaign (25 words max):
Brand: "${clientName || 'Premium Business'}"
Campaign Subject: "${prompt}"
Industry: "${industry}"
Style: Photorealistic commercial advertising photography, cinematic lighting, modern professional composition.
Return ONLY the visual description keywords, no preface.`,
        'gemini-3.6-flash'
      );
      if (geminiPrompt && geminiPrompt.trim()) {
        enrichedPrompt = geminiPrompt.trim();
      }
    } catch {}
  }

  // 3. Generate real AI photorealistic image via Pollinations Flux / SDXL engine
  try {
    const seed = Math.floor(Math.random() * 999999);
    const cleanPrompt = encodeURIComponent(enrichedPrompt.slice(0, 220));
    const aiImageUrl = `https://image.pollinations.ai/prompt/${cleanPrompt}?width=${width}&height=${height}&seed=${seed}&nologo=true&model=flux`;
    return aiImageUrl;
  } catch {
    return INDUSTRY_VISUALS[industry]?.image || INDUSTRY_VISUALS.default.image;
  }
}

export function generateCreativeVideo(options: {
  prompt?: string;
  clientName?: string;
  campaignTitle?: string;
}): string {
  const industry = detectIndustryCategory(`${options.prompt || ''} ${options.clientName || ''} ${options.campaignTitle || ''}`);
  return INDUSTRY_VISUALS[industry]?.video || INDUSTRY_VISUALS.default.video;
}

