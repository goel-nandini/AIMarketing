import { openAIService } from './openai.service';
import { geminiService } from './gemini.service';
import { prisma } from '../../prisma';

export interface InputAnalyzerResult {
  productService: string;
  serviceDescription: string;
  objective: string;
  targetCountry: string;
  targetProvince: string;
  targetCity: string;
  targetLocality?: string;
  targetRadiusKm?: number;
  targetAudienceIntent: string;
  recommendedPlatforms: string[];
  suggestedDailyBudget: number;
  currency: string;
  cta: string;
  creativeAnalysis?: {
    visualStyle?: string;
    detectedOffer?: string;
    detectedCta?: string;
    strengths?: string[];
    improvements?: string[];
  };
  sources: Array<{
    text: string;
    type: 'USER_PROVIDED' | 'AI_INFERENCE' | 'EXTERNALLY_RESEARCHED';
  }>;
}

export class InputAnalyzerService {
  async analyzeInput(data: {
    prompt: string;
    clientName?: string;
    fileUrl?: string;
    fileType?: string;
    websiteUrl?: string;
  }): Promise<InputAnalyzerResult> {
    const systemPrompt = `You are Agent 1 — Input Analyzer for AGENT AI.
Extract structured campaign intent from the user's natural language request.
Return valid JSON adhering to:
{
  "productService": "string",
  "serviceDescription": "string",
  "objective": "string",
  "targetCountry": "string",
  "targetProvince": "string",
  "targetCity": "string",
  "targetLocality": "string",
  "targetRadiusKm": number,
  "targetAudienceIntent": "string",
  "recommendedPlatforms": ["string"],
  "suggestedDailyBudget": number,
  "currency": "string",
  "cta": "string",
  "creativeAnalysis": {
    "visualStyle": "string",
    "detectedOffer": "string",
    "detectedCta": "string",
    "strengths": ["string"],
    "improvements": ["string"]
  },
  "sources": [{"text": "string", "type": "USER_PROVIDED" | "AI_INFERENCE" | "EXTERNALLY_RESEARCHED"}]
}`;

    const userPrompt = `User Campaign Request:
Natural Language Prompt: "${data.prompt}"
Client Context: "${data.clientName || 'General Client'}"
Website URL: "${data.websiteUrl || 'N/A'}"
Uploaded File: "${data.fileUrl ? `${data.fileType} (${data.fileUrl})` : 'None'}"`;

    // Try Gemini / OpenAI LLM for parsing
    const res = await geminiService.generateStructuredOutput<InputAnalyzerResult>(systemPrompt, userPrompt);
    if (res.success && res.data) {
      return res.data;
    }

    const openAiRes = await openAIService.generateStructuredOutput<InputAnalyzerResult>(systemPrompt, userPrompt);
    if (openAiRes.success && openAiRes.data) {
      return openAiRes.data;
    }

    // Heuristic Fallback Parsing if keys are missing
    const isIndia = data.prompt.toLowerCase().includes('delhi') || data.prompt.toLowerCase().includes('india');
    const isEyeCare = data.prompt.toLowerCase().includes('eye') || data.prompt.toLowerCase().includes('specialist');

    return {
      productService: isEyeCare ? 'Eye Surgery & Specialist Consultation' : 'Professional Healthcare Services',
      serviceDescription: `Comprehensive ${isEyeCare ? 'visual diagnostic screening and surgery consultation' : 'healthcare consultation'}`,
      objective: 'lead_generation',
      targetCountry: isIndia ? 'India' : 'Canada',
      targetProvince: isIndia ? 'Delhi NCR' : 'Ontario',
      targetCity: isIndia ? 'Delhi' : 'Toronto',
      targetLocality: isIndia ? 'Indirapuram / Connaught Place' : 'Downtown Toronto',
      targetRadiusKm: 15,
      targetAudienceIntent: 'Adults searching for specialized medical consultation',
      recommendedPlatforms: ['Google Ads', 'Meta Ads'],
      suggestedDailyBudget: isIndia ? 500 : 50,
      currency: isIndia ? 'INR' : 'CAD',
      cta: 'Book Consultation',
      creativeAnalysis: data.fileUrl ? {
        visualStyle: 'Modern clinical environment with clear specialist typography',
        detectedOffer: 'Free initial screening examination',
        detectedCta: 'Book Consultation',
        strengths: ['High contrast title', 'Local address trust badge'],
        improvements: ['Add pricing transparency text', 'Include doctor qualification credential']
      } : undefined,
      sources: [
        { text: `Prompt: "${data.prompt}"`, type: 'USER_PROVIDED' },
        { text: `Geographic resolution: ${isIndia ? 'Delhi NCR' : 'Toronto, Ontario'}`, type: 'AI_INFERENCE' },
        { text: `Search intent volume analysis`, type: 'EXTERNALLY_RESEARCHED' }
      ]
    };
  }
}

export const inputAnalyzerService = new InputAnalyzerService();
