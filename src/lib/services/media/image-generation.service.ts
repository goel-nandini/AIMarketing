import { openAIImageProvider } from './openai-media.provider';
import { geminiImageProvider } from './gemini-media.provider';
import { ImageGenerationOptions, ImageGenerationResult } from './base-media.provider';
import { prisma } from '../../prisma';
import { firestoreService } from '../db/firestore.service';

export class ImageGenerationService {
  // Healthcare Safety Filter Scan
  private auditHealthcareSafety(prompt: string): { safe: boolean; reason?: string } {
    const deceptiveKeywords = [
      '100% safe',
      'guaranteed results',
      'risk-free',
      'zero risk',
      '100% success rate',
      'guaranteed 20/20 vision',
      'best doctor in canada'
    ];

    const lower = prompt.toLowerCase();
    for (const kw of deceptiveKeywords) {
      if (lower.includes(kw)) {
        return {
          safe: false,
          reason: `Health Canada Advertising Violation: Prompt contains forbidden claim "${kw}". Medical outcome guarantees and risk-free assertions are prohibited.`
        };
      }
    }
    return { safe: true };
  }

  async generateAndSaveImage(options: ImageGenerationOptions) {
    // 1. Healthcare Safety Scan
    const safetyCheck = this.auditHealthcareSafety(options.prompt);
    if (!safetyCheck.safe) {
      await firestoreService.logAudit({
        action: 'CREATIVE_BLOCKED: Healthcare Claim Violation',
        campaignId: options.campaignId,
        agent: 'Quality Agent',
        status: 'WARNING',
        details: safetyCheck.reason!,
      });

      return {
        status: 'CREATIVE_BLOCKED',
        error: safetyCheck.reason,
      };
    }

    // 2. Select Provider
    const hasGeminiKey = !!process.env.GEMINI_API_KEY && !process.env.GEMINI_API_KEY.startsWith('your_');
    const defaultProvider = hasGeminiKey ? 'gemini' : 'openai';
    const providerName = options.provider || process.env.IMAGE_PROVIDER || defaultProvider;
    const provider = providerName.toLowerCase() === 'gemini' ? geminiImageProvider : (hasGeminiKey ? geminiImageProvider : openAIImageProvider);

    // 3. Generate Image
    const genResult: ImageGenerationResult = await provider.generateImage(options);

    // 4. Save creative record in SQLite database `Creative` table
    let savedCreativeId = `crt_${Date.now()}`;
    const creativeUrl = genResult.imageUrl || 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&auto=format&fit=crop&q=80';

    try {
      const campaignExists = options.campaignId
        ? await prisma.campaign.findUnique({ where: { id: options.campaignId } }).catch(() => null)
        : null;

      const createdRecord = await prisma.creative.create({
        data: {
          campaignId: campaignExists ? options.campaignId : null,
          title: options.prompt.slice(0, 45),
          type: 'IMAGE',
          provider: genResult.provider || 'Gemini',
          model: genResult.model || 'gemini-3.6-flash',
          prompt: options.prompt,
          aspectRatio: options.aspectRatio || '1:1',
          imageUrl: creativeUrl,
          status: 'FINAL',
        },
      });
      savedCreativeId = createdRecord.id;

      await prisma.auditLog.create({
        data: {
          action: `Generated Image Creative (${options.aspectRatio})`,
          campaignId: campaignExists ? options.campaignId : null,
          campaignName: campaignExists ? campaignExists.name : 'System Creative Studio',
          agentName: 'Creative Agent',
          apiOperation: `${genResult.provider} Image API (${genResult.model})`,
          status: genResult.success ? 'SUCCESS' : 'ERROR',
          details: `Format: ${options.aspectRatio}, Provider: ${genResult.provider}, Model: ${genResult.model}`,
        },
      }).catch(() => null);
    } catch (dbErr) {
      console.warn('[ImageGenerationService] SQLite save warning:', dbErr);
    }

    return {
      status: genResult.success ? 'COMPLETED' : 'FAILED',
      id: savedCreativeId,
      campaignId: options.campaignId,
      type: 'IMAGE',
      provider: genResult.provider || 'Gemini',
      model: genResult.model || 'gemini-3.6-flash',
      prompt: options.prompt,
      downloadUrl: creativeUrl,
      aspectRatio: options.aspectRatio,
      estimatedCost: genResult.estimatedCost || 0.02,
      createdAt: new Date().toISOString(),
    };
  }
}

export const imageGenerationService = new ImageGenerationService();
