import OpenAI from 'openai';
import { ImageGenerationProvider, ImageGenerationOptions, ImageGenerationResult } from './base-media.provider';

export class OpenAIImageProvider extends ImageGenerationProvider {
  name = 'OpenAI';
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

  async generateImage(options: ImageGenerationOptions): Promise<ImageGenerationResult> {
    const selectedModel = process.env.IMAGE_MODEL || 'dall-e-3';
    const client = this.getClient();

    if (!client) {
      return {
        success: false,
        error: 'OPENAI_API_KEY is not configured on server side.',
        aspectRatio: options.aspectRatio,
        provider: this.name,
        model: selectedModel,
      };
    }

    try {
      let size: '1024x1024' | '1024x1792' | '1792x1024' = '1024x1024';
      if (options.aspectRatio === '9:16' || options.aspectRatio === '4:5') {
        size = '1024x1792';
      } else if (options.aspectRatio === '16:9') {
        size = '1792x1024';
      }

      const response = await client.images.generate({
        model: selectedModel,
        prompt: options.prompt,
        n: 1,
        size,
        quality: options.quality === 'hd' ? 'hd' : 'standard',
      });

      const imageUrl = response.data?.[0]?.url;

      if (!imageUrl) {
        return {
          success: false,
          error: 'No image URL returned by OpenAI DALL-E API.',
          aspectRatio: options.aspectRatio,
          provider: this.name,
          model: selectedModel,
        };
      }

      return {
        success: true,
        imageUrl,
        aspectRatio: options.aspectRatio,
        provider: this.name,
        model: selectedModel,
        estimatedCost: 0.04,
      };
    } catch (err: any) {
      console.error('[OpenAIImageProvider Error]:', err?.message || err);
      return {
        success: false,
        error: err?.message || String(err),
        aspectRatio: options.aspectRatio,
        provider: this.name,
        model: selectedModel,
      };
    }
  }
}

export const openAIImageProvider = new OpenAIImageProvider();
