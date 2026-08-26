import { generateGeminiStructuredJSON, generateGeminiText } from '../ai/providers/gemini';
import { generateOpenAIStructuredJSON } from '../ai/providers/openai';

export interface AICaptionRequest {
  client: {
    id: string;
    name: string;
    businessName: string;
    industry: string;
    description: string;
    brandTone: string;
    city: string;
    province: string;
    country: string;
    services?: string;
    targetAudience?: string;
  };
  mediaDescription?: string;
  mediaType?: 'image' | 'video';
  userObjective?: string;
  location?: string;
  action?: 'generate' | 'regenerate' | 'improve' | 'shorten' | 'make_professional' | 'make_engaging';
  currentCaption?: string;
  currentHashtags?: string[];
}

export interface AICaptionResponse {
  hook: string;
  body: string;
  cta: string;
  emojis: string[];
  fullFormattedCaption: string;
  suggestedHashtags: string[];
  toneApplied: string;
}

export async function generateSocialCaption(request: AICaptionRequest): Promise<AICaptionResponse> {
  const { client, mediaDescription, mediaType, userObjective, location, action, currentCaption } = request;

  const effectiveLocation = location || `${client.city}, ${client.province}`;
  const actionInstruction = getActionPromptModifier(action, currentCaption);

  const systemPrompt = `You are KAIRO Social AI, a world-class social media strategist and viral copywriting expert for high-growth brands.
Your goal is to write captivating, high-converting social media content for Instagram Professional and Facebook Pages.

Brand Context:
- Client / Business Name: ${client.businessName || client.name}
- Industry / Niche: ${client.industry}
- Location: ${effectiveLocation}
- Brand Voice & Tone: ${client.brandTone || 'Inspiring, Authoritative, Premium'}
- Core Business Description: ${client.description}
${client.services ? `- Key Services / Offerings: ${client.services}` : ''}
${mediaDescription ? `- Visual Media Content: ${mediaDescription} (${mediaType || 'image'})` : ''}
${userObjective ? `- Goal / Campaign Objective: ${userObjective}` : ''}

Output Format Guidelines:
1. HOOK: A 1-line magnetic thumb-stopping opening hook (under 12 words).
2. BODY: 2-3 engaging, conversational paragraphs emphasizing benefits, transformation, or luxury experience.
3. CTA: A clear, actionable call-to-action (e.g., "Tap the link in bio to book your consultation" or "DM us 'GLOW' for exclusive reservations").
4. EMOJIS: 3-5 tasteful, brand-appropriate emojis.
5. HASHTAGS: 8-15 high-reach, localized, and niche hashtags starting with # (include location-specific tags like #${client.city.replace(/[^a-zA-Z0-9]/g, '')}Wellness, #${client.name.replace(/[^a-zA-Z0-9]/g, '')}).

JSON Schema to return:
{
  "hook": "Magnetic hook line",
  "body": "Main body paragraphs",
  "cta": "Call to action line",
  "emojis": ["✨", "🌿", "📍"],
  "fullFormattedCaption": "Complete ready-to-publish text combining Hook, Body, CTA with clean spacing",
  "suggestedHashtags": ["#Tag1", "#Tag2", "#Tag3"],
  "toneApplied": "Description of tone"
}`;

  const userPrompt = `${actionInstruction}\n\nClient: ${client.name} in ${effectiveLocation}. Focus on engaging local clients, luxury presentation, and high conversion.`;

  // 1. Try Gemini first
  try {
    const geminiResult = await generateGeminiStructuredJSON<AICaptionResponse>(systemPrompt, userPrompt);
    if (geminiResult && geminiResult.fullFormattedCaption && geminiResult.suggestedHashtags?.length) {
      return geminiResult;
    }
  } catch (err) {
    console.warn('[SocialAIService] Gemini attempt notice:', err);
  }

  // 2. Try OpenAI fallback
  try {
    const openAiResult = await generateOpenAIStructuredJSON<AICaptionResponse>(systemPrompt, userPrompt);
    if (openAiResult && openAiResult.fullFormattedCaption) {
      return openAiResult;
    }
  } catch (err) {
    console.warn('[SocialAIService] OpenAI attempt notice:', err);
  }

  // 3. High-Quality Fallback Baseline Template Tailored to Client
  return getFallbackCaption(client, effectiveLocation, action);
}

export async function generateSocialHashtags(
  client: {
    name: string;
    businessName: string;
    industry: string;
    city: string;
    province: string;
  },
  captionContext?: string,
  mediaContext?: string
): Promise<string[]> {
  const systemPrompt = `You are a social media hashtag researcher.
Generate 12-18 trending, high-traffic, niche and local hashtags for Instagram & Facebook.
Return a JSON object: { "hashtags": ["#tag1", "#tag2", ...] }`;

  const userPrompt = `Client: ${client.businessName || client.name}, Industry: ${client.industry}, City: ${client.city}, ${client.province}.
Caption Context: ${captionContext || 'Premium service experience'}.
Media: ${mediaContext || 'Brand visual'}.`;

  try {
    const res = await generateGeminiStructuredJSON<{ hashtags: string[] }>(systemPrompt, userPrompt);
    if (res?.hashtags && Array.isArray(res.hashtags) && res.hashtags.length > 0) {
      return res.hashtags.map((t) => (t.startsWith('#') ? t : `#${t}`));
    }
  } catch {}

  // Fallback hashtags
  const cleanName = (client.businessName || client.name).replace(/[^a-zA-Z0-9]/g, '');
  const cleanCity = client.city.replace(/[^a-zA-Z0-9]/g, '');
  const cleanInd = client.industry.split('/')[0].trim().replace(/[^a-zA-Z0-9]/g, '');

  return [
    `#${cleanName}`,
    `#${cleanCity}Life`,
    `#${cleanCity}Business`,
    `#${cleanInd}`,
    `#${cleanCity}${cleanInd}`,
    `#OntarioAesthetics`,
    `#LuxuryExperience`,
    `#BookYourSession`,
    `#WellnessJourney`,
    `#KAIROSocial`,
  ];
}

function getActionPromptModifier(
  action?: 'generate' | 'regenerate' | 'improve' | 'shorten' | 'make_professional' | 'make_engaging',
  currentCaption?: string
): string {
  if (!action || action === 'generate') {
    return 'Generate a fresh, high-converting social media caption with captivating hook, body, CTA, and hashtags.';
  }
  if (action === 'regenerate') {
    return 'Create an entirely new creative alternative angle for this post with fresh hooks and visual vocabulary.';
  }
  if (action === 'improve') {
    return `Improve the following existing caption for maximum engagement, clarity, and conversion:\n"""${currentCaption}"""`;
  }
  if (action === 'shorten') {
    return `Condense and shorten the following caption into punchy, scroll-stopping sentences while keeping the hook and CTA:\n"""${currentCaption}"""`;
  }
  if (action === 'make_professional') {
    return `Rewrite the following caption with a sophisticated, authoritative, executive B2B and luxury medical/wellness tone:\n"""${currentCaption}"""`;
  }
  if (action === 'make_engaging') {
    return `Rewrite the following caption with high virality, interactive questions, relatable storytelling, and high-energy excitement:\n"""${currentCaption}"""`;
  }
  return 'Generate a high-converting social media post.';
}

function getFallbackCaption(
  client: { name: string; businessName: string; industry: string; city: string; province: string; brandTone?: string },
  location: string,
  action?: string
): AICaptionResponse {
  const brandName = client.businessName || client.name;
  const hook = `Elevate your standard of wellness and aesthetic perfection. ✨`;
  const body = `At ${brandName}, we believe transformative care is an art form. From individualized consultations to state-of-the-art therapies right here in ${location}, our mission is to help you feel revitalized and confident every single day.\n\nEvery session is curated exclusively for your personal goals with zero compromises on comfort, precision, and excellence.`;
  const cta = `📍 Visit us in ${location} or click the link in bio to secure your appointment today.`;
  const emojis = ['✨', '🌿', '📍', '🤍', '💫'];

  const cleanName = brandName.replace(/[^a-zA-Z0-9]/g, '');
  const cleanCity = client.city.replace(/[^a-zA-Z0-9]/g, '');

  const suggestedHashtags = [
    `#${cleanName}`,
    `#${cleanCity}Wellness`,
    `#Luxury${cleanCity}`,
    `#OntarioCare`,
    `#AestheticExcellence`,
    `#MindAndBody`,
    `#SelfCareRoutine`,
    `#BramptonAesthetics`,
  ];

  const fullFormattedCaption = `${hook}\n\n${body}\n\n${cta}\n\n${suggestedHashtags.join(' ')}`;

  return {
    hook,
    body,
    cta,
    emojis,
    fullFormattedCaption,
    suggestedHashtags,
    toneApplied: client.brandTone || 'Sophisticated & Inspiring',
  };
}
