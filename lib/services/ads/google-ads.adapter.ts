import { AdvertisingPlatformAdapter, PlatformCampaignPlan } from './base-platform.adapter';
import { googleAdsIntegrationService } from './google-ads.service';
import { prisma } from '../../prisma';

export class GoogleAdsAdapter extends AdvertisingPlatformAdapter {
  platformName = 'Google Ads';

  validatePlan(plan: PlatformCampaignPlan): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    if (!plan.campaignName) errors.push('Campaign name is required');
    if (!plan.budget.dailyBudget || plan.budget.dailyBudget <= 0) errors.push('Valid daily budget is required');
    if (!plan.creative.headlines || plan.creative.headlines.length < 2) errors.push('At least 2 headlines required for Google Search Ads');
    return { valid: errors.length === 0, errors };
  }

  async deployCampaign(plan: PlatformCampaignPlan, approvedByUserName: string) {
    const logs: string[] = [];
    logs.push(`[Google Ads Adapter] Executing Search Campaign Creation (Steps 4 to 10)...`);

    const val = this.validatePlan(plan);
    if (!val.valid) {
      return { success: false, logs, error: val.errors.join(', ') };
    }

    const customerId = process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID || '849-204-9102';
    const locationQuery = plan.cities?.[0] || plan.country || 'Toronto';

    // Execute real Google Ads Campaign creation sequence
    const result = await googleAdsIntegrationService.createGoogleSearchCampaign({
      customerId,
      campaignName: plan.campaignName,
      dailyBudget: plan.budget.dailyBudget,
      currency: plan.budget.currency,
      locationQuery,
      keywords: plan.keywords || [`${plan.campaignName} consultation`, `specialist near me`],
      headlines: plan.creative.headlines,
      descriptions: plan.creative.descriptions,
      finalUrl: plan.destination.url || 'https://icare-eyeconsultation.ca',
    });

    logs.push(...result.logs);

    await prisma.auditLog.create({
      data: {
        action: 'Deployed Real Campaign via Google Ads API Adapter',
        campaignName: plan.campaignName,
        apiOperation: `GoogleAdsService.createCampaign (${result.campaignResourceName})`,
        status: 'SUCCESS',
        details: `Approved by ${approvedByUserName}. Customer ID: ${customerId}, Budget: ${plan.budget.currency} $${plan.budget.dailyBudget}/day, Status: ${result.status}`,
      },
    });

    return {
      success: true,
      externalCampaignId: result.campaignId,
      externalBudgetId: result.budgetId,
      logs,
    };
  }
}

export const googleAdsAdapter = new GoogleAdsAdapter();
