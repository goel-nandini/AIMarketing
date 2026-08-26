import OpenAI from 'openai';

// Server-side secret key check with alias support
export const getOpenAIClient = () => {
  const apiKey = (process.env.OPENAI_API_KEY || process.env.OPENAPI_KEY || process.env.OPENAI_KEY || '').trim();
  if (!apiKey || apiKey.startsWith('your_') || apiKey === 'mock_api_key' || apiKey.length < 15) {
    return null;
  }
  return new OpenAI({ apiKey });
};

export async function generateOpenAIStructuredJSON<T>(
  systemPrompt: string,
  userPrompt: string,
  model?: string
): Promise<T | null> {
  const client = getOpenAIClient();
  if (!client) return null;

  const candidateModels = model
    ? [model, 'gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo']
    : [process.env.OPENAI_MODEL || 'gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo'];

  for (const m of candidateModels) {
    try {
      const response = await client.chat.completions.create({
        model: m,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
      });

      let content = response.choices[0]?.message?.content?.trim();
      if (!content) continue;

      if (content.startsWith('```json')) {
        content = content.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (content.startsWith('```')) {
        content = content.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }

      return JSON.parse(content) as T;
    } catch (error: any) {
      console.warn(`[OpenAI Provider] Model ${m} attempt failed:`, error?.message || error);
      if (error?.status === 429 || error?.message?.includes('insufficient_quota') || error?.message?.includes('rate limit')) {
        continue;
      }
    }
  }

  return null;
}
