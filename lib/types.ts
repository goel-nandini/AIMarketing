export type UserRole = 'ADMIN' | 'MANAGER' | 'TEAM_MEMBER' | 'VIEWER';
export type UserStatus = 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'DISABLED' | 'INVITED';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  username: string;
  role: UserRole;
  status: UserStatus;
  emailVerified: boolean;
  invitedBy?: string;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  avatar?: string;
  title?: string;
}

export type InvitationStatus = 'PENDING' | 'ACCEPTED' | 'EXPIRED' | 'REVOKED';

export interface Invitation {
  id: string;
  email: string;
  role: UserRole;
  invitedBy: string;
  invitedByName?: string;
  tokenHash: string;
  status: InvitationStatus;
  expiresAt: string;
  acceptedAt?: string;
  createdAt: string;
  message?: string;
}

export interface User {
  id: string;
  uid?: string;
  name: string;
  email: string;
  username?: string;
  role: UserRole;
  status?: UserStatus;
  emailVerified?: boolean;
  avatar: string;
  title: string;
}

export interface Client {
  id: string;
  name: string;
  businessName: string;
  clientCode?: string;
  githubRepo?: string;
  deploymentUrl?: string;
  status?: string;
  website: string;
  industry: string;
  country: string;
  province: string;
  city: string;
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
  description: string;
  brandTone: string;
  logoUrl: string;
  createdAt: string;
}

export type TaskPriority = 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW';
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  assignedToId: string;
  assignedToName: string;
  assignedToEmail: string;
  assignedById: string;
  assignedByName: string;
  clientId?: string;
  clientName?: string;
  campaignId?: string;
  campaignName?: string;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

export type CampaignStatus = 
  | 'DRAFT'
  | 'AI_PROCESSING'
  | 'READY_FOR_REVIEW'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'CREATING'
  | 'ACTIVE'
  | 'PAUSED'
  | 'COMPLETED'
  | 'FAILED'
  | 'REJECTED';

export interface CampaignBrief {
  clientId: string;
  objective: string;
  productService: string;
  serviceDescription: string;
  websiteUrl: string;
  landingPageUrl: string;
  offer: string;
  cta: string;
  targetCountry: string;
  targetProvince: string;
  targetCity: string;
  targetLanguage: string;
  aiRequirements: string[];
  dailyBudget: number;
  totalBudget: number;
  currency: string;
  startDate: string;
  endDate: string;
  platform: string;
}

export interface ResearchSource {
  text: string;
  type: 'USER_PROVIDED' | 'AI_INFERENCE' | 'EXTERNALLY_RESEARCHED';
}

export interface StructuredResearch {
  marketContext: string[];
  audienceInsights: string[];
  painPoints: string[];
  searchIntent: string[];
  keywordIdeas: string[];
  messagingOpportunities: string[];
  risks: string[];
  sources: ResearchSource[];
}

export interface StructuredAudience {
  primaryAudience?: string;
  secondaryAudience?: string;
  demographics?: {
    ageRange: string;
    gender: string;
    incomeBracket: string;
    occupations: string[];
  };
  location?: {
    country: string;
    province: string;
    city: string;
  };
  language?: string;
  intentSignals?: string[];
  painPoints?: string[];
  exclusions?: string[];
  interests?: string[];
  primary?: string;
  secondary?: string;
  searchIntent?: string[];
  buyingIntentScore?: number;
}

export interface StructuredStrategy {
  campaignGoal?: string;
  coreMessage?: string;
  valueProposition?: string;
  creativeAngles?: string[];
  recommendedPlatforms?: string[];
  recommendedCampaignStructure?: {
    campaignType?: string;
    adGroups?: string[];
    biddingStrategy?: string;
  };
  recommendedBudget?: {
    currency?: string;
    dailyBudget?: number;
    targetCpa?: number;
  };
  cta?: string;
  risks?: string[];
  angle?: string;
  messagingStrategy?: string;
  funnelStage?: string;
  recommendedChannel?: string;
  biddingStrategy?: string;
  recommendedDailyBudgetCAD?: number;
}

export interface StructuredAdCopy {
  headlines: string[];
  descriptions: string[];
  primaryTexts?: string[];
  ctas?: string[];
  hooks?: string[];
  healthcareClaimWarnings?: string[];
  shortVariations?: string[];
}

export interface CreativeConcept {
  id: string;
  title: string;
  visualDirection: string;
  imagePrompt: string;
  videoPrompt: string;
  storyboard: string[];
  generatedImageUrl?: string;
  generatedVideoUrl?: string;
  hookText: string;
}

export interface QualityCheckResult {
  status: 'PASS' | 'WARNING' | 'FAIL';
  warnings?: string[];
  errors?: string[];
  brandConsistency?: boolean;
  locationConsistency?: boolean;
  copyQuality?: boolean;
  policyRisk?: 'LOW' | 'MEDIUM' | 'HIGH';
  overallScore?: number;
  missingInfo?: string[];
  brandAlignment?: boolean;
  healthcareComplianceWarnings?: string[];
  grammarPass?: boolean;
  locationMatch?: boolean;
  currencyMatch?: boolean;
}

export interface ConnectionStatus {
  openAiConnected: boolean;
  geminiConnected: boolean;
  googleAdsConnected: boolean;
  googleAdsCustomerId?: string;
  googleAdsAccountName?: string;
}

export interface AgentRunState {
  id: string;
  campaignId: string;
  agentName: string;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  outputJson?: string;
  error?: string;
  startedAt: string;
  completedAt?: string;
}

export interface CampaignProposal {
  id: string;
  campaignId: string;
  clientId: string;
  clientName: string;
  objective: string;
  location: string;
  recommendedBudgetCAD: number;
  platform: string;
  research?: StructuredResearch;
  audience: StructuredAudience;
  strategy: StructuredStrategy;
  copy: StructuredAdCopy;
  creatives: CreativeConcept[];
  qualityCheck: QualityCheckResult;
  createdAt: string;
}

export interface Campaign {
  id: string;
  name: string;
  clientId: string;
  clientName: string;
  objective: string;
  platform: string;
  location: string;
  dailyBudget: number;
  totalBudget: number;
  currency: string;
  status: CampaignStatus;
  startDate: string;
  endDate: string;
  proposalId?: string;
  approvedBy?: string;
  approvedAt?: string;
  googleAdsCampaignId?: string;
  metrics?: {
    spend: number;
    impressions: number;
    clicks: number;
    ctr: number;
    cpc: number;
    conversions: number;
    cpa: number;
    conversionRate: number;
  };
  aiInsight?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId?: string;
  userName?: string;
  agentName?: string;
  action: string;
  campaignId?: string;
  campaignName?: string;
  apiOperation?: string;
  status: 'SUCCESS' | 'WARNING' | 'ERROR';
  details: string;
}

export interface AISettings {
  strategyProvider: 'OpenAI' | 'Gemini';
  researchProvider: 'OpenAI' | 'Gemini';
  copyProvider: 'OpenAI' | 'Gemini';
  imageProvider: 'OpenAI' | 'Gemini';
  videoProvider: 'OpenAI' | 'Gemini';
  validationProvider: 'OpenAI' | 'Gemini';
  demoMode: boolean;
}
