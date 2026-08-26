import { generateGeminiText } from '../../ai/providers/gemini';
import OpenAI from 'openai';

function getOpenAIClient(): OpenAI | null {
  const key = (process.env.OPENAI_API_KEY || process.env.OPENAPI_KEY || process.env.OPENAI_KEY || '').trim();
  if (!key || key.startsWith('your_') || key === 'mock_api_key') {
    return null;
  }
  return new OpenAI({ apiKey: key });
}

// Built-in Commercial Art Direction Templates for Instant Ad Enhancement
function buildSmartAdPrompt(prompt: string, clientName?: string): string {
  const lower = prompt.toLowerCase();
  
  if (lower.includes('eye') || lower.includes('optom') || lower.includes('lasik') || lower.includes('vision') || lower.includes('jeevan')) {
    return `commercial photography of a modern eye clinic, certified optometrist examining patient eyes with high-tech diagnostic slit lamp equipment in clean aesthetic clinic, warm natural architectural lighting, 8k resolution, authentic photorealistic, award winning healthcare ad`;
  }
  if (lower.includes('doctor') || lower.includes('clinic') || lower.includes('health') || lower.includes('medical') || lower.includes('dental') || lower.includes('hospital')) {
    return `high-end commercial advertisement photograph of a modern medical consultation clinic, compassionate certified doctor in pristine clinical environment, soft natural ambient lighting, 8k resolution, photorealistic medical advertisement`;
  }
  if (lower.includes('coffee') || lower.includes('cafe') || lower.includes('restaurant') || lower.includes('food') || lower.includes('bakery')) {
    return `award-winning commercial food and beverage photography, artisan fresh roasted coffee with delicate latte art on rustic wooden table in sunlit boutique cafe, steam rising, shallow depth of field, 50mm lens, 8k photorealistic`;
  }
  if (lower.includes('tech') || lower.includes('saas') || lower.includes('software') || lower.includes('app') || lower.includes('ai')) {
    return `sleek commercial advertisement visual for modern technology brand ${clientName || ''}, clean modern workspace with laptop displaying modern UI analytics dashboard, soft neon ambient lighting, architectural glass aesthetics, 8k photorealistic`;
  }
  if (lower.includes('real estate') || lower.includes('property') || lower.includes('home') || lower.includes('apartment') || lower.includes('house')) {
    return `luxury architectural interior design commercial photography of modern luxury apartment with panoramic city views, warm golden hour lighting, clean minimalist decor, 8k ultra realistic advertisement`;
  }
  if (lower.includes('shoe') || lower.includes('fitness') || lower.includes('gym') || lower.includes('sport') || lower.includes('workout')) {
    return `dynamic commercial advertising photography of premium athletic performance sneakers on modern track, studio rim lighting, subtle water splash motion, bold energetic composition, 8k photorealistic`;
  }
  if (lower.includes('fashion') || lower.includes('clothes') || lower.includes('dress') || lower.includes('beauty') || lower.includes('cosmetic')) {
    return `high fashion commercial advertisement portrait, modern elegant style, soft studio beauty lighting, pristine skin textures, cinematic editorial magazine aesthetic, 8k resolution`;
  }

  return `commercial advertising photograph of ${prompt} ${clientName ? `for ${clientName}` : ''}, professional cinematic studio lighting, clean elegant composition, 50mm f/1.8 lens, 8k resolution, award-winning photorealistic visual`;
}

export async function generateCreativeBanner(options: {
  prompt: string;
  aspectRatio?: string;
  campaignTitle?: string;
  clientName?: string;
  provider?: 'gemini' | 'openai' | 'flux';
}): Promise<{ imageUrl: string; enhancedPrompt: string }> {
  const { prompt, aspectRatio = '4:5', campaignTitle, clientName } = options;

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

  // 1. Stage 1: Automated Prompt Engineering via Google Gemini
  let enhancedPrompt = buildSmartAdPrompt(prompt, clientName);

  if (process.env.GEMINI_API_KEY && !process.env.GEMINI_API_KEY.startsWith('your_')) {
    try {
      const geminiPrompt = await generateGeminiText(
        `You are an Award-Winning Commercial Advertising Art Director. 
The user wants an ultra-realistic, high-converting ad visual for: "${prompt}" ${clientName ? `for brand "${clientName}"` : ''} ${campaignTitle ? `under campaign "${campaignTitle}"` : ''}.

Write a highly detailed, photorealistic prompt (25-35 words) for AI image generation.
Focus on: authentic human/subject action, modern environment, soft studio lighting, 8k resolution, 50mm f/1.8 lens, photorealistic commercial ad quality.
Do NOT include text on the image or cartoon styles. Output ONLY the visual prompt text.`,
        'gemini-3.6-flash'
      );
      if (geminiPrompt && geminiPrompt.trim() && !geminiPrompt.includes('error')) {
        enhancedPrompt = geminiPrompt.trim().replace(/^["']|["']$/g, '');
      }
    } catch (err: any) {
      console.warn('[Gemini Prompt Enhancement Note]:', err?.message || err);
    }
  }

  // 2. Stage 2: High-Performance AI Image Generation Engine (Pollinations Flux AI)
  try {
    const seed = Math.floor(100000 + Math.random() * 900000);
    const cleanPrompt = encodeURIComponent(enhancedPrompt.slice(0, 240));
    const aiImageUrl = `https://image.pollinations.ai/prompt/${cleanPrompt}?width=${width}&height=${height}&seed=${seed}&nologo=true&model=flux&enhance=true`;
    
    return {
      imageUrl: aiImageUrl,
      enhancedPrompt,
    };
  } catch (err) {
    const fallbackImage = `https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=${width}&auto=format&fit=crop&q=85`;
    return {
      imageUrl: fallbackImage,
      enhancedPrompt,
    };
  }
}

export function generateCreativeVideo(options: {
  prompt?: string;
  clientName?: string;
  campaignTitle?: string;
}): string {
  const lower = (options.prompt || '').toLowerCase();
  if (lower.includes('eye') || lower.includes('optom') || lower.includes('lasik')) {
    return 'https://assets.mixkit.co/videos/preview/mixkit-optometrist-examining-a-patients-eyes-41581-large.mp4';
  }
  if (lower.includes('doctor') || lower.includes('clinic') || lower.includes('health')) {
    return 'https://assets.mixkit.co/videos/preview/mixkit-doctor-talking-to-a-patient-in-a-clinic-41584-large.mp4';
  }
  if (lower.includes('tech') || lower.includes('saas') || lower.includes('software')) {
    return 'https://assets.mixkit.co/videos/preview/mixkit-software-developer-working-on-code-41570-large.mp4';
  }
  return 'https://assets.mixkit.co/videos/preview/mixkit-hands-typing-on-a-laptop-keyboard-41566-large.mp4';
}


