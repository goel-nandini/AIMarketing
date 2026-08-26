import { User, Client, Campaign, CampaignProposal, AuditLog, AISettings, ConnectionStatus, AgentRunState } from './types';

// Pre-seeded Workspace Users
export const INITIAL_USERS: User[] = [
  {
    id: 'usr_aman',
    name: 'Aman Sir',
    email: 'aman@codekap.com',
    role: 'ADMIN',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    title: 'Super Admin / Founder & CEO',
  },
  {
    id: 'usr_harshit',
    name: 'Harshit Singh',
    email: 'harshitsingh19622@gmail.com',
    role: 'TEAM_MEMBER',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=harshitsingh19622@gmail.com',
    title: 'Marketing Manager',
  },
];

// Permanent Workspace Clients
export const INITIAL_CLIENTS: Client[] = [
  {
    id: 'cmt7xr7zv0000p91dzh4racbz',
    name: 'Jeevansphere',
    businessName: 'Jeevansphere',
    clientCode: 'CK-JEEV-2001',
    website: 'http://jeevansphere.com/',
    industry: 'Eye Care / Healthcare Platform',
    country: 'India',
    province: 'Delhi',
    city: 'CP, New Delhi',
    contactName: 'Deepak Yadav',
    contactEmail: 'jeevansphere@com.in',
    contactPhone: '9690922001',
    deploymentUrl: 'http://jeevansphere.com/',
    githubRepo: 'https://github.com/harshito0/AIMarketing',
    description: 'jeevanSphere is a purpose-driven platform focused on creating meaningful impact by connecting people, ideas, and opportunities. It aims to build an inclusive ecosystem that supports growth, awareness, and positive social transformation.',
    brandTone: 'Professional, Modern, High-Converting',
    logoUrl: 'https://api.dicebear.com/7.x/identicon/svg?seed=Jeevansphere',
    status: 'ACTIVE',
    createdAt: '2026-08-25T00:37:38.491Z',
  },
];

// Initial Campaigns (Clean state, no dummy data)
export const INITIAL_CAMPAIGNS: Campaign[] = [];

// Initial Pre-seeded Campaign Proposal
export const INITIAL_PROPOSAL: CampaignProposal | null = null;

// Initial Audit Logs (Clean state)
export const INITIAL_AUDIT_LOGS: AuditLog[] = [];

// Store State Holder
class MemoryDatabase {
  users: User[] = [...INITIAL_USERS];
  clients: Client[] = [...INITIAL_CLIENTS];
  campaigns: Campaign[] = [];
  proposals: Record<string, CampaignProposal> = {};
  auditLogs: AuditLog[] = [];
  aiSettings: AISettings = {
    strategyProvider: 'OpenAI',
    researchProvider: 'Gemini',
    copyProvider: 'OpenAI',
    imageProvider: 'OpenAI',
    videoProvider: 'Gemini',
    validationProvider: 'Gemini',
    demoMode: true,
  };
  connectionStatus: ConnectionStatus = {
    openAiConnected: true,
    geminiConnected: true,
    googleAdsConnected: true,
    googleAdsCustomerId: '849-204-9102',
    googleAdsAccountName: 'G1 Sphere Canada Ads',
  };
  currentUser: User = INITIAL_USERS[0]; // Aman Sir by default

  setCurrentUser(userId: string) {
    const user = this.users.find(u => u.id === userId);
    if (user) {
      this.currentUser = user;
    }
  }

  addAuditLog(log: Omit<AuditLog, 'id' | 'timestamp'>) {
    const newLog: AuditLog = {
      ...log,
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
    };
    this.auditLogs.unshift(newLog);
    return newLog;
  }

  addCampaign(campaign: Campaign) {
    this.campaigns.unshift(campaign);
    this.addAuditLog({
      userId: this.currentUser.id,
      userName: this.currentUser.name,
      action: `Created new campaign: ${campaign.name}`,
      campaignId: campaign.id,
      campaignName: campaign.name,
      status: 'SUCCESS',
      details: `Targeting ${campaign.location} with daily budget of ${campaign.currency} $${campaign.dailyBudget}`,
    });
  }

  addClient(client: Client) {
    this.clients.unshift(client);
    this.addAuditLog({
      userId: this.currentUser.id,
      userName: this.currentUser.name,
      action: `Added new client: ${client.name}`,
      status: 'SUCCESS',
      details: `Industry: ${client.industry}, Location: ${client.city}, ${client.country}`,
    });
  }
}

export const db = new MemoryDatabase();
