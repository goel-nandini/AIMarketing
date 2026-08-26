import { prisma } from '../../prisma';
import { User, Client, Campaign, CampaignProposal, AuditLog, AISettings } from '../../types';

// Unified Database Service supporting SQLite + Firestore collection abstractions
export class FirestoreDatabaseService {
  // Collection 1: users
  async getUsers(): Promise<User[]> {
    const users = await prisma.user.findMany({ orderBy: { role: 'asc' } });
    return users.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role as any,
      avatar: u.avatar,
      title: u.title,
    }));
  }

  async getUserById(userId: string): Promise<User | null> {
    const u = await prisma.user.findUnique({ where: { id: userId } });
    if (!u) return null;
    return {
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role as any,
      avatar: u.avatar,
      title: u.title,
    };
  }

  // Collection 2: clients
  async getClients(): Promise<Client[]> {
    const clients = await prisma.client.findMany({ orderBy: { createdAt: 'desc' } });
    return clients.map(c => ({
      id: c.id,
      name: c.name,
      businessName: c.businessName,
      website: c.website,
      industry: c.industry,
      country: c.country,
      province: c.province,
      city: c.city,
      contactName: c.contactName,
      contactEmail: c.contactEmail,
      description: c.description,
      brandTone: c.brandTone,
      logoUrl: c.logoUrl,
      createdAt: c.createdAt.toISOString(),
    }));
  }

  async createClient(data: Partial<Client>): Promise<Client> {
    const c = await prisma.client.create({
      data: {
        name: data.name || 'New Client',
        businessName: data.businessName || data.name || 'New Client Business',
        website: data.website || '',
        industry: data.industry || 'General Marketing',
        country: data.country || 'Canada',
        province: data.province || 'Ontario',
        city: data.city || 'Toronto',
        contactName: data.contactName || '',
        contactEmail: data.contactEmail || '',
        description: data.description || '',
        brandTone: data.brandTone || 'Professional',
        logoUrl: data.logoUrl || 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=200&auto=format&fit=crop&q=80',
      },
    });

    await this.logAudit({
      action: `Created Client: ${c.name}`,
      status: 'SUCCESS',
      details: `Industry: ${c.industry}, Location: ${c.city}, ${c.country}`,
    });

    return {
      id: c.id,
      name: c.name,
      businessName: c.businessName,
      website: c.website,
      industry: c.industry,
      country: c.country,
      province: c.province,
      city: c.city,
      contactName: c.contactName,
      contactEmail: c.contactEmail,
      description: c.description,
      brandTone: c.brandTone,
      logoUrl: c.logoUrl,
      createdAt: c.createdAt.toISOString(),
    };
  }

  // Collection 3: campaigns
  async getCampaigns(): Promise<Campaign[]> {
    const campaigns = await prisma.campaign.findMany({
      include: { client: true, proposal: true },
      orderBy: { createdAt: 'desc' },
    });

    return campaigns.map(c => ({
      id: c.id,
      name: c.name,
      clientId: c.clientId,
      clientName: c.client.name,
      objective: c.objective,
      platform: c.platform,
      location: c.location,
      dailyBudget: c.dailyBudget,
      totalBudget: c.totalBudget,
      currency: c.currency,
      status: c.status as any,
      startDate: c.startDate,
      endDate: c.endDate,
      googleAdsCampaignId: c.googleAdsCampaignId || undefined,
      approvedBy: c.approvedBy || undefined,
      approvedAt: c.approvedAt || undefined,
      metrics: {
        spend: c.metricsSpend,
        impressions: c.metricsImpressions,
        clicks: c.metricsClicks,
        ctr: c.metricsCtr,
        cpc: c.metricsCpc,
        conversions: c.metricsConversions,
        cpa: c.metricsCpa,
        conversionRate: c.metricsConvRate,
      },
      aiInsight: c.aiInsight || undefined,
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString(),
    }));
  }

  // Collection 4: agentRuns
  async createAgentRun(data: {
    campaignId: string;
    agentType: string;
    status: string;
    inputJson?: string;
    outputJson?: string;
    error?: string;
  }) {
    return prisma.agentRun.create({
      data: {
        campaignId: data.campaignId,
        agentName: data.agentType,
        status: data.status,
        outputJson: data.outputJson || null,
        error: data.error || null,
        startedAt: new Date(),
        completedAt: data.status === 'COMPLETED' ? new Date() : null,
      },
    });
  }

  // Collection 5: auditLogs
  async logAudit(data: {
    userId?: string;
    userName?: string;
    role?: string;
    action: string;
    campaignId?: string;
    campaignName?: string;
    apiOperation?: string;
    agent?: string;
    status: 'SUCCESS' | 'WARNING' | 'ERROR';
    details: string;
  }) {
    let operation = data.apiOperation;
    if (!operation) {
      if (data.agent === 'Creative Agent') {
        operation = 'Google Gemini API (gemini-3.6-flash)';
      } else if (data.agent) {
        operation = `AI Multi-Agent Pipeline (${data.agent})`;
      } else if (data.action.toLowerCase().includes('client')) {
        operation = 'Prisma Client / SQLite Engine';
      } else if (data.action.toLowerCase().includes('campaign')) {
        operation = 'Campaign Management API';
      } else {
        operation = 'Internal System Operation';
      }
    }

    return prisma.auditLog.create({
      data: {
        userId: data.userId || null,
        userName: data.userName || null,
        agentName: data.agent || null,
        action: data.action,
        campaignId: data.campaignId || null,
        campaignName: data.campaignName || null,
        apiOperation: operation,
        status: data.status,
        details: data.details,
      },
    });
  }
}

export const firestoreService = new FirestoreDatabaseService();
