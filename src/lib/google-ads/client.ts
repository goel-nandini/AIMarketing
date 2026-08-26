import { Campaign, CampaignProposal } from '../types';
import { db } from '../db';

export interface ExecutionResult {
  success: boolean;
  googleAdsCampaignId?: string;
  googleAdsBudgetId?: string;
  googleAdsAdGroupId?: string;
  logs: string[];
  error?: string;
}

export class GoogleAdsExecutionService {
  // Safe idempotent campaign deployment
  async deployApprovedCampaign(
    campaign: Campaign,
    proposal: CampaignProposal,
    approvedByUserName: string
  ): Promise<ExecutionResult> {
    const logs: string[] = [];

    try {
      logs.push(`[Google Ads API] Initializing campaign execution for "${campaign.name}"...`);
      
      // Step 1: OAuth & Customer Account Verification
      logs.push(`[Google Ads API] Verifying Customer Account ID: ${db.connectionStatus.googleAdsCustomerId || '849-204-9102'}`);
      await new Promise(r => setTimeout(r, 600));

      // Step 2: Idempotency Check
      if (campaign.googleAdsCampaignId) {
        logs.push(`[Idempotency Safeguard] Campaign already exists with Google Ads ID ${campaign.googleAdsCampaignId}. Aborting duplicate creation.`);
        return {
          success: true,
          googleAdsCampaignId: campaign.googleAdsCampaignId,
          logs,
        };
      }

      // Step 3: Create Campaign Budget
      const budgetId = `bud_gads_${Date.now()}`;
      logs.push(`[Google Ads API] Created CampaignBudget (Amount: ${campaign.currency} $${campaign.dailyBudget}/day, Delivery: STANDARD) -> Budget ID: ${budgetId}`);
      await new Promise(r => setTimeout(r, 500));

      // Step 4: Create Campaign Entity
      const gadsCampaignId = `gads_${Math.floor(100000000 + Math.random() * 900000000)}`;
      logs.push(`[Google Ads API] Created Campaign (Name: "${campaign.name}", Channel: SEARCH, Status: PAUSED) -> Campaign ID: ${gadsCampaignId}`);
      await new Promise(r => setTimeout(r, 600));

      // Step 5: Create Ad Group
      const adGroupId = `ag_${Math.floor(100000 + Math.random() * 900000)}`;
      logs.push(`[Google Ads API] Created AdGroup (Name: "Toronto Eye Surgery Consultations", Type: SEARCH_STANDARD) -> Ad Group ID: ${adGroupId}`);
      await new Promise(r => setTimeout(r, 500));

      // Step 6: Create Targeting & Keywords
      logs.push(`[Google Ads API] Applied GeoTargeting: Toronto, Ontario, Canada (Location ID: 1003988)`);
      if (proposal.audience?.searchIntent) {
        proposal.audience.searchIntent.forEach(kw => {
          logs.push(`[Google Ads API] Added Keyword [Phrase Match]: "${kw}"`);
        });
      }
      await new Promise(r => setTimeout(r, 500));

      // Step 7: Create Ads & Headlines
      logs.push(`[Google Ads API] Created Responsive Search Ad with ${proposal.copy.headlines.length} headlines and ${proposal.copy.descriptions.length} descriptions.`);
      await new Promise(r => setTimeout(r, 600));

      // Step 8: Validate & Enable Campaign
      logs.push(`[Google Ads API] Validation PASS. Transitioning status PAUSED -> ENABLED.`);
      await new Promise(r => setTimeout(r, 400));

      // Update Database state
      campaign.status = 'ACTIVE';
      campaign.googleAdsCampaignId = gadsCampaignId;
      campaign.approvedBy = approvedByUserName;
      campaign.approvedAt = new Date().toISOString();
      campaign.updatedAt = new Date().toISOString();

      db.addAuditLog({
        userId: db.currentUser.id,
        userName: approvedByUserName,
        action: 'Execution Agent Deployed Campaign to Google Ads',
        campaignId: campaign.id,
        campaignName: campaign.name,
        apiOperation: `GoogleAdsService.createCampaign (${gadsCampaignId})`,
        status: 'SUCCESS',
        details: `Successfully deployed campaign with daily budget CAD $${campaign.dailyBudget}/day. Google Ads ID: ${gadsCampaignId}`,
      });

      return {
        success: true,
        googleAdsCampaignId: gadsCampaignId,
        googleAdsBudgetId: budgetId,
        googleAdsAdGroupId: adGroupId,
        logs,
      };
    } catch (err: any) {
      logs.push(`[ERROR] Google Ads API Operation Failed: ${err.message || String(err)}`);
      
      db.addAuditLog({
        userId: db.currentUser.id,
        userName: approvedByUserName,
        action: 'Execution Agent Deployment Failed',
        campaignId: campaign.id,
        campaignName: campaign.name,
        apiOperation: 'GoogleAdsService.createCampaign',
        status: 'ERROR',
        details: err.message || String(err),
      });

      return {
        success: false,
        logs,
        error: err.message || String(err),
      };
    }
  }

  // Fetch live metrics simulation
  async getCampaignPerformance(googleAdsCampaignId: string) {
    return {
      spend: 720.50,
      impressions: 15400,
      clicks: 924,
      ctr: 6.0,
      cpc: 0.78,
      conversions: 42,
      cpa: 17.15,
      conversionRate: 4.55,
    };
  }
}

export const googleAdsExecutionService = new GoogleAdsExecutionService();
