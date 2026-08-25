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
  name?: string | null;
  role: UserRole;
  passcode?: string;
  invitedBy: string;
  invitedByName?: string;
  tokenHash?: string;
  status: InvitationStatus;
  expiresAt: string;
  acceptedAt?: string;
  createdAt: string;
  message?: string | null;
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

export type LeadStatus = 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'PROPOSAL_SENT' | 'WON' | 'LOST' | 'INTERESTED' | 'REQUIREMENT' | 'QUOTATION' | 'NEGOTIATION' | string;

export interface LeadItem {
  id: string;
  name: string;
  contactName: string;
  leadCode: string;
  email: string;
  phone?: string;
  company: string;
  source?: string;
  service?: string;
  status: LeadStatus;
  estimatedValue: number;
  notes?: string;
  nextFollowUpDate?: string;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
  [key: string]: any;
}

export interface DepartmentItem {
  id: string;
  name: string;
  code?: string;
  headName?: string;
  memberCount?: number;
  description?: string;
  createdAt?: string;
  [key: string]: any;
}

export interface EmployeeItem {
  id: string;
  employeeId?: string;
  name: string;
  email: string;
  phone?: string;
  role?: string;
  department: string;
  designation: string;
  salary?: number;
  workloadScore?: number;
  joiningDate?: string;
  status?: string;
  avatar?: string;
  [key: string]: any;
}

export interface ExpenseItem {
  id: string;
  title?: string;
  category?: string;
  vendor?: string;
  description?: string;
  amount: number;
  gstAmount: number;
  date?: string;
  approvedBy?: string;
  status?: string;
  receiptUrl?: string;
  [key: string]: any;
}

export interface InvoiceItem {
  id: string;
  invoiceNumber: string;
  clientName: string;
  clientGstin?: string;
  billingAddress?: string;
  date?: string;
  subtotal: number;
  cgst?: number;
  sgst?: number;
  igst?: number;
  amount: number;
  tax?: number;
  totalAmount: number;
  razorpayPaymentLinkId?: string;
  itemsJson?: string;
  status?: 'PAID' | 'PENDING' | 'OVERDUE' | 'DRAFT' | string;
  dueDate?: string;
  issueDate?: string;
  [key: string]: any;
}

export interface QuotationItem {
  id: string;
  quotationNumber: string;
  clientName: string;
  date?: string;
  subtotal: number;
  taxAmount: number;
  amount: number;
  totalAmount: number;
  status?: 'SENT' | 'ACCEPTED' | 'REJECTED' | 'DRAFT' | string;
  validUntil?: string;
  createdAt?: string;
  [key: string]: any;
}

export type ProjectHealth = 'ON_TRACK' | 'AT_RISK' | 'CRITICAL' | 'DELAYED' | string;
export type ProjectStatus = 'ACTIVE' | 'PLANNING' | 'COMPLETED' | 'ON_HOLD' | string;

export interface ProjectItem {
  id: string;
  projectCode: string;
  name: string;
  clientId?: string;
  clientName: string;
  service?: string;
  department: string;
  managerId?: string;
  managerName?: string;
  teamMembers?: string[];
  startDate?: string;
  deadline?: string;
  progress?: number;
  health: ProjectHealth;
  status?: ProjectStatus;
  description?: string;
  priority?: string;
  billingTotal?: number;
  billingPaid?: number;
  gitRepoUrl?: string;
  liveUrl?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

export interface SOPItem {
  id: string;
  code: string;
  service: string;
  title: string;
  department: string;
  version?: string;
  purpose?: string;
  instructions?: string;
  content?: string;
  checklistJson?: string;
  requiredProof?: string;
  expectedDurationHours?: number;
  author?: string;
  lastUpdated?: string;
  [key: string]: any;
}

export interface WorkLogItem {
  id: string;
  userId?: string;
  userName?: string;
  employeeName: string;
  employeeEmail?: string;
  taskId?: string;
  taskTitle?: string;
  projectId?: string;
  projectName?: string;
  timeSpentHours?: number;
  hours?: number;
  workCompleted?: string;
  description?: string;
  proofUrl?: string;
  tomorrowPlan?: string;
  date?: string;
  [key: string]: any;
}
