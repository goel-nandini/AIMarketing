import OpenAI from 'openai';
import { BaseAIProvider, AIProviderResponse } from './base.provider';

export class OpenAIProvider extends BaseAIProvider {
  name = 'OpenAI';
  defaultModel = 'gpt-4o';
  private client: OpenAI | null = null;
  private currentApiKey: string | null = null;

  private getClient(): OpenAI | null {
    const apiKey = (process.env.OPENAI_API_KEY || process.env.OPENAPI_KEY || process.env.OPENAI_KEY || '').trim();
    if (!apiKey || apiKey.startsWith('your_') || apiKey === 'mock_api_key') {
      return null;
    }
    if (!this.client || this.currentApiKey !== apiKey) {
      this.client = new OpenAI({ apiKey });
      this.currentApiKey = apiKey;
    }
    return this.client;
  }

  async generateStructuredOutput<T>(
    systemPrompt: string,
    userPrompt: string,
    model?: string
  ): Promise<AIProviderResponse<T>> {
    const selectedModel = model || this.defaultModel;
    const client = this.getClient();

    if (!client) {
      return {
        success: false,
        error: 'OPENAI_API_KEY is not configured on server side.',
        provider: this.name,
        model: selectedModel,
      };
    }

    try {
      const response = await client.chat.completions.create({
        model: selectedModel,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
      });

      const rawText = response.choices[0]?.message?.content || '';
      const parsedData = JSON.parse(rawText) as T;

      return {
        success: true,
        data: parsedData,
        rawText,
        provider: this.name,
        model: selectedModel,
      };
    } catch (err: any) {
      console.error('[OpenAIProvider Error]:', err?.message || err);
      return {
        success: false,
        error: err?.message || String(err),
        provider: this.name,
        model: selectedModel,
      };
    }
  }
}

export const openAIService = new OpenAIProvider();
