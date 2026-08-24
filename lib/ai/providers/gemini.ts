import { GoogleGenAI } from '@google/genai';

export const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export async function generateGeminiStructuredJSON<T>(
  systemPrompt: string,
  userPrompt: string,
  model?: string
): Promise<T | null> {
  const client = getGeminiClient();
  if (!client) return null;

  const candidateModels = model
    ? [model, 'gemini-3.6-flash', 'gemini-3.7-flash', 'gemini-3.1-pro-preview', 'gemini-3.5-flash']
    : [process.env.GEMINI_MODEL || 'gemini-3.6-flash', 'gemini-3.7-flash', 'gemini-3.1-pro-preview', 'gemini-3.5-flash'];

  for (const m of candidateModels) {
    try {
      const response = await client.models.generateContent({
        model: m,
        contents: `${systemPrompt}\n\nUser Request: ${userPrompt}\n\nRespond ONLY with valid, parseable JSON matching the requested structure.`,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.7,
        },
      });

      let text = response.text?.trim();
      if (!text) continue;

      if (text.startsWith('```json')) {
        text = text.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (text.startsWith('```')) {
        text = text.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }

      return JSON.parse(text) as T;
    } catch (error: any) {
      console.warn(`[Gemini Provider] Model ${m} attempt failed:`, error?.message || error);
      if (error?.status === 429 || error?.message?.includes('RESOURCE_EXHAUSTED') || error?.message?.includes('quota')) {
        break;
      }
    }
  }

  return null;
}

export async function generateGeminiText(
  prompt: string,
  model?: string
): Promise<string | null> {
  const client = getGeminiClient();
  if (!client) return null;

  const candidateModels = model
    ? [model, 'gemini-3.6-flash', 'gemini-3.7-flash', 'gemini-3.1-pro-preview', 'gemini-3.5-flash']
    : [process.env.GEMINI_MODEL || 'gemini-3.6-flash', 'gemini-3.7-flash', 'gemini-3.1-pro-preview', 'gemini-3.5-flash'];

  for (const m of candidateModels) {
    try {
      const response = await client.models.generateContent({
        model: m,
        contents: prompt,
      });

      const text = response.text?.trim();
      if (text) return text;
    } catch (error: any) {
      console.warn(`[Gemini Provider Text] Model ${m} attempt failed:`, error?.message || error);
    }
  }

  return null;
}
