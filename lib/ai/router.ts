import { generateOpenAIStructuredJSON } from './providers/openai';
import { generateGeminiStructuredJSON } from './providers/gemini';
import { prisma } from '../prisma';

export async function executeAgentTask<T>(
  agentName: string,
  systemPrompt: string,
  userPrompt: string,
  fallbackGenerator: () => T
): Promise<T> {
  try {
    const rawGemini = (process.env.GEMINI_API_KEY || '').trim();
    const rawOpenAI = (process.env.OPENAI_API_KEY || process.env.OPENAPI_KEY || process.env.OPENAI_KEY || '').trim();

    const hasGeminiKey = !!rawGemini && !rawGemini.startsWith('your_') && rawGemini !== 'mock_api_key';
    const hasOpenAIKey = !!rawOpenAI && !rawOpenAI.startsWith('your_') && rawOpenAI !== 'mock_api_key' && rawOpenAI.length > 15;

    // Read current settings from DB safely
    const settings = await prisma.aISetting.findUnique({ where: { id: 'default' } }).catch(() => null);

    // Determine target provider
    let preferredProvider = hasOpenAIKey ? 'OpenAI' : (hasGeminiKey ? 'Gemini' : 'OpenAI');
    if (settings?.strategyProvider === 'OpenAI' && hasOpenAIKey) {
      preferredProvider = 'OpenAI';
    } else if (settings?.strategyProvider === 'Gemini' && hasGeminiKey) {
      preferredProvider = 'Gemini';
    }

    // 1. Try OpenAI if preferred and available
    if (preferredProvider === 'OpenAI' && hasOpenAIKey) {
      const liveResult = await generateOpenAIStructuredJSON<T>(systemPrompt, userPrompt);
      if (liveResult) {
        console.log(`[Model Router] Successfully generated live output using OpenAI for ${agentName}`);
        return liveResult;
      }
    }

    // 2. Try Gemini
    if (hasGeminiKey) {
      const liveResult = await generateGeminiStructuredJSON<T>(systemPrompt, userPrompt);
      if (liveResult) {
        console.log(`[Model Router] Successfully generated live output using Gemini for ${agentName}`);
        return liveResult;
      }
    }

    // 3. Fallback try with OpenAI if not attempted first
    if (hasOpenAIKey && preferredProvider !== 'OpenAI') {
      const liveResult = await generateOpenAIStructuredJSON<T>(systemPrompt, userPrompt);
      if (liveResult) {
        console.log(`[Model Router] Successfully generated live output using OpenAI fallback for ${agentName}`);
        return liveResult;
      }
    }

    // Fallback to structured generator if no live LLM responded
    return fallbackGenerator();
  } catch (error) {
    console.warn(`[Model Router Warning] ${agentName} falling back to structured generator:`, error);
    return fallbackGenerator();
  }
}
