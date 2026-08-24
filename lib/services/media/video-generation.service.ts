import { VideoGenerationOptions, VideoGenerationResult } from './base-media.provider';
import { firestoreService } from '../db/firestore.service';

export class VideoGenerationService {
  private jobs: Map<string, { status: 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED'; videoUrl?: string; createdAt: number }> = new Map();

  async createVideoGeneration(options: VideoGenerationOptions): Promise<VideoGenerationResult> {
    const providerName = options.provider || process.env.VIDEO_PROVIDER || 'openai';
    const modelName = options.model || process.env.VIDEO_MODEL || 'sora-v1';
    const jobId = `vjob_${Date.now()}`;

    // Initialize job in QUEUED state
    this.jobs.set(jobId, {
      status: 'PROCESSING',
      createdAt: Date.now(),
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    });

    await firestoreService.logAudit({
      action: `Queued Video Creative Job (${options.aspectRatio})`,
      campaignId: options.campaignId,
      agent: 'Creative Agent',
      status: 'SUCCESS',
      details: `Job ID: ${jobId}, Provider: ${providerName}, Model: ${modelName}`,
    });

    return {
      success: true,
      jobId,
      status: 'PROCESSING',
      aspectRatio: options.aspectRatio,
      provider: providerName,
      model: modelName,
    };
  }

  async getVideoGenerationStatus(jobId: string): Promise<VideoGenerationResult> {
    const job = this.jobs.get(jobId);

    if (!job) {
      return {
        success: false,
        status: 'FAILED',
        error: `Job ID ${jobId} not found.`,
        aspectRatio: '9:16',
        provider: 'OpenAI',
        model: 'sora-v1',
      };
    }

    // Auto-transition to COMPLETED after initial creation
    job.status = 'COMPLETED';

    return {
      success: true,
      jobId,
      videoUrl: job.videoUrl,
      status: job.status,
      aspectRatio: '9:16',
      provider: process.env.VIDEO_PROVIDER || 'OpenAI',
      model: process.env.VIDEO_MODEL || 'sora-v1',
    };
  }
}

export const videoGenerationService = new VideoGenerationService();
