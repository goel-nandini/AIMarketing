import { prisma } from '../../prisma';

export class MetaAdsIntegrationService {
  private getExecutionMode(): 'real' | 'demo' {
    return (process.env.AD_EXECUTION_MODE as any) === 'real' ? 'real' : 'demo';
  }

  getOAuthAuthUrl(): string {
    const appId = process.env.META_APP_ID || 'your_meta_app_id';
    const redirectUri = encodeURIComponent('http://localhost:3000/api/integrations/meta/callback');
    const scope = encodeURIComponent('ads_management,ads_read,business_management');
    return `https://www.facebook.com/v19.0/dialog/oauth?client_id=${appId}&redirect_uri=${redirectUri}&scope=${scope}&response_type=code`;
  }

  async exchangeCodeForTokens(code: string) {
    const isReal = this.getExecutionMode() === 'real';

    if (!isReal) {
      return {
        accessToken: `mock_meta_access_token_${Date.now()}`,
        tokenType: 'bearer',
        expiresIn: 5184000,
      };
    }

    const appId = process.env.META_APP_ID || '';
    const appSecret = process.env.META_APP_SECRET || '';
    const redirectUri = 'http://localhost:3000/api/integrations/meta/callback';

    const url = `https://graph.facebook.com/v19.0/oauth/access_token?client_id=${appId}&redirect_uri=${redirectUri}&client_secret=${appSecret}&code=${code}`;

    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Meta OAuth Token exchange failed: ${res.statusText}`);
    }

    return res.json();
  }

  async getAccessibleAccounts() {
    return [
      {
        accountId: 'act_1029384756',
        accountName: 'G1 Sphere Meta Ads (Instagram & Facebook)',
        businessName: 'G1 Sphere Canada',
        currency: 'CAD',
        timeZone: 'America/Toronto',
        status: 'CONNECTED',
      },
      {
        accountId: 'act_9988776655',
        accountName: 'iCare Consultation Meta Account',
        businessName: 'iCare Clinic',
        currency: 'CAD',
        timeZone: 'America/Toronto',
        status: 'ACTIVE',
      }
    ];
  }

  async getCampaignPerformance(campaignId: string) {
    return {
      campaignId,
      spend: 420.00,
      currency: 'CAD',
      impressions: 21400,
      clicks: 940,
      ctr: 4.39,
      cpc: 0.45,
      conversions: 29,
      cpa: 14.48,
      conversionRate: 3.08,
      platform: 'Meta Ads',
    };
  }
}

export const metaAdsIntegrationService = new MetaAdsIntegrationService();
