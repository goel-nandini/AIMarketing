import { generateGeminiText } from '../../ai/providers/gemini';
import OpenAI from 'openai';

function getOpenAIClient(): OpenAI | null {
  const key = (process.env.OPENAI_API_KEY || process.env.OPENAPI_KEY || process.env.OPENAI_KEY || '').trim();
  if (!key || key.startsWith('your_') || key === 'mock_api_key') {
    return null;
  }
  return new OpenAI({ apiKey: key });
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

  // 1. Try OpenAI DALL-E 3 first if OpenAI is selected or available
  const openai = getOpenAIClient();
  if (openai && provider === 'openai') {
    try {
      let size: '1024x1024' | '1024x1792' | '1792x1024' = '1024x1024';
      if (aspectRatio === '9:16' || aspectRatio === '4:5') size = '1024x1792';
      else if (aspectRatio === '16:9') size = '1792x1024';

      const res = await openai.images.generate({
        model: 'dall-e-3',
        prompt: `Professional high-converting advertising photograph for ${clientName || 'Brand'}: ${prompt}. Cinematic lighting, 8k resolution, photorealistic commercial ad visual, stunning composition.`,
        n: 1,
        size,
        quality: 'standard',
      });

      if (res.data?.[0]?.url) {
        return res.data[0].url;
      }
    } catch (openAiErr: any) {
      console.warn('[OpenAI DALL-E Warning, falling back to Gemini AI Visual Engine]:', openAiErr?.message || openAiErr);
    }
  }

  // 2. High-Fidelity Gemini Enriched Photorealistic AI Engine
  let enrichedPrompt = `Stunning commercial advertising photography of ${prompt}, ${clientName || 'premium quality'}, professional cinematic studio lighting, photorealistic 8k detail, award winning advertisement`;
  
  if (process.env.GEMINI_API_KEY && !process.env.GEMINI_API_KEY.startsWith('your_')) {
    try {
      const geminiPrompt = await generateGeminiText(
        `You are a World-Class Advertising Creative Director. Expand this ad prompt into a vivid, photorealistic image generation description (20-30 words max):
Prompt: "${prompt}"
Context: ${campaignTitle || clientName || 'Premium Ad Campaign'}
Output ONLY the visual description keywords, no introduction or quotes.`,
        'gemini-3.6-flash'
      );
      if (geminiPrompt && geminiPrompt.trim()) {
        enrichedPrompt = geminiPrompt.trim();
      }
    } catch {}
  }

  // Generate real AI photorealistic image via Pollinations Flux / SDXL engine
  const seed = Math.floor(Math.random() * 999999);
  const cleanPrompt = encodeURIComponent(enrichedPrompt.slice(0, 200));
  const aiImageUrl = `https://image.pollinations.ai/prompt/${cleanPrompt}?width=${width}&height=${height}&seed=${seed}&nologo=true&model=flux`;

  return aiImageUrl;
}
