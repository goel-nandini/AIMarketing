import { GoogleGenAI } from '@google/genai';
import { BaseAIProvider, AIProviderResponse } from './base.provider';

export class GeminiProvider extends BaseAIProvider {
  name = 'Gemini';
  defaultModel = process.env.GEMINI_MODEL || 'gemini-3.6-flash';
  private client: GoogleGenAI | null = null;

  private getClient(): GoogleGenAI | null {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return null;
    if (!this.client) {
      this.client = new GoogleGenAI({ apiKey });
    }
    return this.client;
  }

  async generateStructuredOutput<T>(
    systemPrompt: string,
    userPrompt: string,
    model?: string
  ): Promise<AIProviderResponse<T>> {
    const client = this.getClient();
    const candidateModels = model
      ? [model, 'gemini-3.6-flash', 'gemini-3.7-flash', 'gemini-3.1-pro-preview', 'gemini-3.5-flash']
      : [this.defaultModel, 'gemini-3.6-flash', 'gemini-3.7-flash', 'gemini-3.1-pro-preview', 'gemini-3.5-flash'];

    if (!client) {
      return {
        success: false,
        error: 'GEMINI_API_KEY is not configured on server side.',
        provider: this.name,
        model: candidateModels[0],
      };
    }

    let lastError = '';
    for (const m of candidateModels) {
      try {
        const response = await client.models.generateContent({
          model: m,
          contents: `${systemPrompt}\n\nUser Prompt: ${userPrompt}\n\nRespond ONLY with valid, parseable JSON matching the requested format.`,
          config: {
            responseMimeType: 'application/json',
            temperature: 0.7,
          },
        });

        let rawText = response.text?.trim() || '';
        if (!rawText) continue;

        if (rawText.startsWith('```json')) {
          rawText = rawText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
        } else if (rawText.startsWith('```')) {
          rawText = rawText.replace(/^```\s*/, '').replace(/\s*```$/, '');
        }

        const parsedData = JSON.parse(rawText) as T;

        return {
          success: true,
          data: parsedData,
          rawText,
          provider: this.name,
          model: m,
        };
      } catch (err: any) {
        lastError = err.message || String(err);
        console.warn(`[GeminiProvider] Failed with model ${m}:`, lastError);
        if (err?.status === 429 || err?.message?.includes('RESOURCE_EXHAUSTED') || err?.message?.includes('quota')) {
          break;
        }
      }
    }

    return {
      success: false,
      error: lastError || 'Failed to generate output from Gemini models.',
      provider: this.name,
      model: candidateModels[0],
    };
  }
}

export const geminiService = new GeminiProvider();
