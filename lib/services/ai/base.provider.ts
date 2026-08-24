export interface AIProviderResponse<T> {
  success: boolean;
  data?: T;
  rawText?: string;
  error?: string;
  provider: string;
  model: string;
}

export abstract class BaseAIProvider {
  abstract name: string;
  abstract defaultModel: string;

  abstract generateStructuredOutput<T>(
    systemPrompt: string,
    userPrompt: string,
    model?: string
  ): Promise<AIProviderResponse<T>>;
}
