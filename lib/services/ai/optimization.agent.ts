import { openAIService } from './openai.service';
import { geminiService } from './gemini.service';
import { prisma } from '../../prisma';

export interface OptimizationRecommendation {
  campaignId: string;
  recommendationType: 'BUDGET_ADJUSTMENT' | 'CREATIVE_SHIFT' | 'BID_STRATEGY_CHANGE' | 'TARGETING_REFINE';
  title: string;
  description: string;
  currentValue: string | number;
  recommendedValue: string | number;
  estimatedImpact: string;
  requiresHumanApproval: boolean;
}

export class OptimizationAgent {
  async analyzeCampaignPerformance(data: {
    campaignId: string;
    spend: number;
    impressions: number;
    clicks: number;
    ctr: number;
    cpc: number;
    conversions: number;
    cpa: number;
    conversionRate: number;
  }): Promise<OptimizationRecommendation[]> {
    const recommendations: OptimizationRecommendation[] = [];

    // Analyze CTR & CPA thresholds
    if (data.cpa > 0 && data.cpa < 25.0) {
      recommendations.push({
        campaignId: data.campaignId,
        recommendationType: 'BUDGET_ADJUSTMENT',
        title: 'Scale Daily Approved Budget by 15%',
        description: `Campaign CPA of CAD $${data.cpa.toFixed(2)} is lower than the CAD $35 target. Shifting budget to scale lead generation.`,
        currentValue: '$50.00 / day',
        recommendedValue: '$57.50 / day',
        estimatedImpact: '+12% Lead Volume',
        requiresHumanApproval: true,
      });
    }

    if (data.ctr > 5.0) {
      recommendations.push({
        campaignId: data.campaignId,
        recommendationType: 'CREATIVE_SHIFT',
        title: 'Promote Creative Concept 01 to Primary Placement',
        description: `High click-through rate (${data.ctr}%) on Toronto Diagnostic Suite visual. Shift 80% impressions to this variant.`,
        currentValue: '50% Impression Share',
        recommendedValue: '80% Impression Share',
        estimatedImpact: '-8% CPC Reduction',
        requiresHumanApproval: true,
      });
    }

    // Log analysis in AuditLog
    await prisma.auditLog.create({
      data: {
        action: 'Executed Performance Optimization Analysis',
        campaignId: data.campaignId,
        agentName: 'Optimization Agent',
        status: 'SUCCESS',
        details: `Analyzed ${data.clicks} clicks, ${data.conversions} conversions (CPA: CAD $${data.cpa.toFixed(2)}). Generated ${recommendations.length} recommendations.`,
      },
    });

    return recommendations;
  }
}

export const optimizationAgent = new OptimizationAgent();
