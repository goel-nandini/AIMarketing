import { ImageGenerationProvider, ImageGenerationOptions, ImageGenerationResult } from './base-media.provider';
import { generateCreativeBanner } from './creative-banner-generator';

export class GeminiImageProvider extends ImageGenerationProvider {
  name = 'Gemini';

  async generateImage(options: ImageGenerationOptions): Promise<ImageGenerationResult> {
    const selectedModel = process.env.IMAGE_MODEL || 'gemini-3.6-flash';
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey || apiKey.startsWith('your_')) {
      return {
        success: false,
        error: 'GEMINI_API_KEY is not configured on server side.',
        aspectRatio: options.aspectRatio,
        provider: this.name,
        model: selectedModel,
      };
    }

    try {
      // Generate live custom AI creative banner
      const imageUrl = await generateCreativeBanner({
        prompt: options.prompt,
        aspectRatio: options.aspectRatio,
      });

      return {
        success: true,
        imageUrl,
        aspectRatio: options.aspectRatio,
        provider: this.name,
        model: selectedModel,
        estimatedCost: 0.02,
      };
    } catch (err: any) {
      console.error('[GeminiImageProvider Error]:', err);
      return {
        success: false,
        error: err.message || String(err),
        aspectRatio: options.aspectRatio,
        provider: this.name,
        model: selectedModel,
      };
    }
  }
}

export const geminiImageProvider = new GeminiImageProvider();
