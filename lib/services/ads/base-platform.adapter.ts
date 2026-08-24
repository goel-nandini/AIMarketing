export interface GranularLocationTarget {
  country: string;
  province?: string;
  city?: string;
  district?: string;
  locality?: string;
  postalCode?: string;
  proximity?: {
    address?: string;
    latitude: number;
    longitude: number;
    radius: number;
    radiusUnit: 'KM' | 'MILES';
  };
  excludedLocations?: string[];
  locationMatchingType?: 'PRESENCE_ONLY' | 'PRESENCE_OR_INTEREST';
}

export interface PlatformCampaignPlan {
  id: string;
  campaignName: string;
  objective: string;
  platform: 'Google Ads' | 'Meta Ads';
  country: string;
  regions?: string[];
  cities?: string[];
  localities?: string[];
  postalAreas?: string[];
  radius?: number;
  excludedLocations?: string[];
  ageRange: string;
  gender: string;
  language: string;
  interests?: string[];
  behaviors?: string[];
  keywords?: string[];
  audienceType?: string;
  placements?: string[];
  budget: {
    dailyBudget: number;
    totalBudget?: number;
    currency: string;
  };
  schedule: {
    startDate: string;
    endDate?: string;
    noEndDate: boolean;
  };
  bidding: {
    strategy: string;
    targetCpa?: number;
    optimizationGoal?: string;
  };
  destination: {
    type: 'WEBSITE' | 'LEAD_FORM' | 'PHONE_CALL' | 'WHATSAPP';
    url?: string;
    phoneNumber?: string;
  };
  creative: {
    headlines: string[];
    descriptions: string[];
    primaryTexts?: string[];
    cta: string;
    imageUrl?: string;
    videoUrl?: string;
    creativeAssets?: string[];
  };
  campaignType?: string;
  adGroups?: string[];
  adSets?: string[];
}

export abstract class AdvertisingPlatformAdapter {
  abstract platformName: string;
  abstract validatePlan(plan: PlatformCampaignPlan): { valid: boolean; errors: string[] };
  abstract deployCampaign(plan: PlatformCampaignPlan, approvedByUserName: string): Promise<{
    success: boolean;
    externalCampaignId?: string;
    externalBudgetId?: string;
    logs: string[];
    error?: string;
  }>;
}
