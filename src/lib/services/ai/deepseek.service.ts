import { BaseAIProvider, AIProviderResponse } from './base.provider';

export class DeepSeekProvider extends BaseAIProvider {
  name = 'DeepSeek';
  defaultModel = 'deepseek-chat';

  async generateStructuredOutput<T>(
    systemPrompt: string,
    userPrompt: string,
    model?: string
  ): Promise<AIProviderResponse<T>> {
    const selectedModel = model || this.defaultModel;
    const apiKey = process.env.DEEPSEEK_API_KEY;

    if (!apiKey) {
      return {
        success: false,
        error: 'DEEPSEEK_API_KEY is not configured on server side.',
        provider: this.name,
        model: selectedModel,
      };
    }

    try {
      const response = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: selectedModel,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error(`DeepSeek API error: ${response.statusText}`);
      }

      const json = await response.json();
      const rawText = json.choices?.[0]?.message?.content || '';
      const parsedData = JSON.parse(rawText) as T;

      return {
        success: true,
        data: parsedData,
        rawText,
        provider: this.name,
        model: selectedModel,
      };
    } catch (err: any) {
      console.error('[DeepSeekProvider Error]:', err);
      return {
        success: false,
        error: err.message || String(err),
        provider: this.name,
        model: selectedModel,
      };
    }
  }
}

export const deepSeekService = new DeepSeekProvider();
