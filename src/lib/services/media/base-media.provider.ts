export interface ImageGenerationOptions {
  campaignId: string;
  prompt: string;
  aspectRatio: '4:5' | '1:1' | '9:16' | '16:9';
  quality?: 'standard' | 'hd' | 'high';
  provider?: string;
  model?: string;
}

export interface ImageGenerationResult {
  success: boolean;
  imageUrl?: string;
  storagePath?: string;
  aspectRatio: string;
  provider: string;
  model: string;
  estimatedCost?: number;
  error?: string;
}

export interface VideoGenerationOptions {
  campaignId: string;
  prompt: string;
  aspectRatio: '9:16' | '16:9';
  durationSeconds?: number;
  provider?: string;
  model?: string;
}

export interface VideoGenerationResult {
  success: boolean;
  jobId?: string;
  videoUrl?: string;
  storagePath?: string;
  status: 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  aspectRatio: string;
  provider: string;
  model: string;
  error?: string;
}

export abstract class ImageGenerationProvider {
  abstract name: string;
  abstract generateImage(options: ImageGenerationOptions): Promise<ImageGenerationResult>;
}

export abstract class VideoGenerationProvider {
  abstract name: string;
  abstract createVideoJob(options: VideoGenerationOptions): Promise<VideoGenerationResult>;
  abstract checkVideoJobStatus(jobId: string): Promise<VideoGenerationResult>;
}
