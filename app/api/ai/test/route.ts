import { NextResponse } from 'next/server';
import { openAIService } from '@/lib/services/ai/openai.service';
import { geminiService } from '@/lib/services/ai/gemini.service';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { provider, prompt } = body;

    const testPrompt = prompt || 'Return a JSON object containing a greeting and a short marketing insight for Canadian healthcare.';
    const systemPrompt = 'You are a Senior Marketing AI. Return valid JSON with fields: "greeting" (string) and "insight" (string).';

    let result: any = null;

    if (provider?.toLowerCase() === 'openai') {
      result = await openAIService.generateStructuredOutput<{ greeting: string; insight: string }>(
        systemPrompt,
        testPrompt
      );
    } else if (provider?.toLowerCase() === 'gemini') {
      result = await geminiService.generateStructuredOutput<{ greeting: string; insight: string }>(
        systemPrompt,
        testPrompt
      );
    } else {
      // Test both providers
      const openaiRes = await openAIService.generateStructuredOutput<{ greeting: string; insight: string }>(systemPrompt, testPrompt);
      const geminiRes = await geminiService.generateStructuredOutput<{ greeting: string; insight: string }>(systemPrompt, testPrompt);
      result = { openai: openaiRes, gemini: geminiRes };
    }

    // Log test action in AuditLog
    await prisma.auditLog.create({
      data: {
        action: `Tested AI Provider Endpoint (${provider || 'both'})`,
        status: result ? 'SUCCESS' : 'WARNING',
        details: `Tested LLM execution. Success state: ${JSON.stringify(result?.success ?? true)}`,
      },
    });

    return NextResponse.json({
      success: true,
      provider: provider || 'both',
      result,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
