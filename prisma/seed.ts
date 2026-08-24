import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Agent AI database...');

  // Seed Users
  const aman = await prisma.user.upsert({
    where: { email: 'aman@codekap.com' },
    update: {},
    create: {
      id: 'usr_aman',
      name: 'Aman Sir',
      email: 'aman@codekap.com',
      role: 'ADMIN',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      title: 'Founder & CEO',
    },
  });

  await prisma.user.upsert({
    where: { email: 'ankit@codekap.com' },
    update: {},
    create: {
      id: 'usr_ankit',
      name: 'Ankit Sir',
      email: 'ankit@codekap.com',
      role: 'TEAM',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      title: 'Marketing Strategist',
    },
  });

  await prisma.user.upsert({
    where: { email: 'bhumika@codekap.com' },
    update: {},
    create: {
      id: 'usr_bhumika',
      name: 'Bhumika',
      email: 'bhumika@codekap.com',
      role: 'TEAM',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      title: 'Creative Copywriter',
    },
  });

  await prisma.user.upsert({
    where: { email: 'maya@codekap.com' },
    update: {},
    create: {
      id: 'usr_maya',
      name: 'Maya',
      email: 'maya@codekap.com',
      role: 'TEAM',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
      title: 'Performance Specialist',
    },
  });

  await prisma.user.upsert({
    where: { email: 'harshit@codekap.com' },
    update: {},
    create: {
      id: 'usr_harshit',
      name: 'Harshit Singh',
      email: 'harshit@codekap.com',
      role: 'TEAM',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      title: 'Media Buyer',
    },
  });

  // Seed Client
  const client = await prisma.client.upsert({
    where: { id: 'client_g1sphere' },
    update: {},
    create: {
      id: 'client_g1sphere',
      name: 'G1 Sphere / iCare',
      businessName: 'G1 Sphere iCare Laser & Eye Surgery Clinic',
      website: 'https://g1sphere-icare.ca',
      industry: 'Eye Care / Eye Surgery Consultation',
      country: 'Canada',
      province: 'Ontario',
      city: 'Toronto',
      contactName: 'Dr. Robert Chen',
      contactEmail: 'consultations@g1sphere-icare.ca',
      description: 'Leading ophthalmology and laser eye surgery clinic offering advanced LASIK, PRK, and cataract consultations in Greater Toronto Area.',
      brandTone: 'Empathetic, Clinical, Trustworthy, Modern, Reassuring',
      logoUrl: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=200&auto=format&fit=crop&q=80',
    },
  });

  // Seed Campaign
  const campaign = await prisma.campaign.upsert({
    where: { id: 'cmp_g1_toronto_01' },
    update: {},
    create: {
      id: 'cmp_g1_toronto_01',
      name: 'Eye Surgery Consultation — Toronto',
      clientId: client.id,
      objective: 'Consultation Leads',
      platform: 'Google Ads',
      location: 'Toronto, Ontario, Canada',
      dailyBudget: 50,
      totalBudget: 1500,
      currency: 'CAD',
      status: 'PENDING_APPROVAL',
      startDate: '2026-09-01',
      endDate: '2026-09-30',
      aiInsight: 'Campaign strategy and creative variations ready for Aman Sir review and budget launch approval.',
    },
  });

  // Seed Proposal
  await prisma.campaignProposal.upsert({
    where: { campaignId: campaign.id },
    update: {},
    create: {
      id: 'prop_g1_toronto_01',
      campaignId: campaign.id,
      clientId: client.id,
      clientName: client.name,
      objective: 'Consultation Leads',
      location: 'Toronto, Ontario, Canada',
      recommendedBudgetCAD: 50,
      platform: 'Google Ads',
      audienceJson: JSON.stringify({
        primary: 'Adults aged 25-55 in Toronto & GTA seeking visual freedom from glasses or contacts',
        secondary: 'Working professionals with digital eye strain interested in custom LASIK consultations',
        demographics: {
          ageRange: '25-55',
          gender: 'All genders',
          incomeBracket: 'CAD $60,000+ household income',
          occupations: ['Tech & Office Workers', 'Healthcare Professionals', 'Athletes & Fitness Enthusiasts'],
        },
        interests: ['Eye Health', 'Laser Eye Surgery', 'Contact Lens Alternatives', 'Wellness & Self Improvement'],
        searchIntent: [
          'laser eye surgery cost Toronto',
          'best LASIK surgeon Toronto GTA',
          'eye surgery consultation appointment',
          'canadian eye clinic reviews',
        ],
        painPoints: [
          'Frustration with fogged glasses and high contact lens recurring costs',
          'Fear of eye procedure discomfort or downtime',
          'Uncertainty around consultation qualification and pricing transparency',
        ],
        buyingIntentScore: 88,
      }),
      strategyJson: JSON.stringify({
        angle: 'Local Expertise & Transparent Consultation in Downtown Toronto',
        valueProposition: 'Experience 20/20 clarity with Canada’s top-rated ophthalmic specialists. Schedule a zero-obligation consultation.',
        messagingStrategy: 'Focus on freedom, clinical precision, safety track record, and convenient appointment slots.',
        funnelStage: 'High-Intent Consideration & Direct Booking',
        recommendedChannel: 'Google Search Ads & Local Discovery Extensions',
        biddingStrategy: 'Maximize Conversions (Target CPA: CAD $35.00)',
        recommendedDailyBudgetCAD: 50,
        cta: 'Book Your Eye Surgery Consultation',
      }),
      copyJson: JSON.stringify({
        headlines: [
          'Laser Eye Surgery Consultation Toronto',
          'Top-Rated Toronto Eye Specialists',
          'See Clearly Without Glasses — iCare',
          'Book Free Vision Screening Today',
          'Advanced LASIK & PRK in Toronto',
        ],
        descriptions: [
          'Schedule your comprehensive eye surgery consultation in Toronto with G1 Sphere / iCare. High precision, gentle care.',
          'Frustrated with contacts & glasses? Experience life with clear 20/20 vision. Book your consultation appointment now.',
          'Board-certified Toronto eye surgeons. State-of-the-art diagnostic technology. Flexible booking options available.',
        ],
        primaryTexts: [
          'Discover if you are a candidate for laser eye surgery with G1 Sphere / iCare in Toronto, Ontario.'
        ],
        ctas: ['Book Consultation', 'Schedule Screening', 'Check Qualification'],
        shortVariations: [
          'Clear Vision Starts Here',
          'Toronto Eye Surgery Experts',
          'Book iCare Consultation'
        ],
        healthcareClaimWarnings: [
          'Note: Copy strictly adheres to Health Canada & College of Physicians advertising guidelines. No guaranteed zero-risk claims.'
        ]
      }),
      creativesJson: JSON.stringify([
        {
          id: 'crt_01',
          title: 'Modern Clinic Diagnostic Suite',
          visualDirection: 'Clean, bright clinical setting with friendly doctor consulting with patient.',
          imagePrompt: 'Professional eye doctor explaining digital eye scan to smiling patient in sleek modern Toronto clinic, soft daylight, professional photography',
          videoPrompt: 'Cinematic 10s video showing precision diagnostic laser equipment and welcoming receptionist at Toronto iCare clinic.',
          storyboard: [
            'Scene 1: Patient walking into modern Toronto eye clinic reception',
            'Scene 2: Close up of advanced non-contact eye scanning diagnostic',
            'Scene 3: Doctor reviewing 3D eye map with reassuring explanation',
            'Scene 4: Call to action: Book Consultation at G1 Sphere / iCare'
          ],
          generatedImageUrl: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&auto=format&fit=crop&q=80',
          hookText: 'Is Laser Eye Surgery Right For You in Toronto?'
        },
        {
          id: 'crt_02',
          title: 'Active Lifestyle Freedom Concept',
          visualDirection: 'Active lifestyle in Toronto waterfront without glasses.',
          imagePrompt: 'Happy energetic person enjoying outdoor activity at Toronto harborfront in crisp sunlight, clear vision focus, modern lifestyle portrait',
          videoPrompt: 'Short dynamic clip showing someone effortlessly putting away glasses and running along Lake Ontario.',
          storyboard: [
            'Scene 1: Waking up and searching for glasses on nightstand',
            'Scene 2: Transition to clear vibrant view of Toronto skyline',
            'Scene 3: Text overlay: "Experience True Visual Freedom"',
            'Scene 4: CTA: Book Free Screening'
          ],
          generatedImageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&auto=format&fit=crop&q=80',
          hookText: 'Say Goodbye to Foggy Glasses & High Contact Lens Costs'
        }
      ]),
      qualityCheckJson: JSON.stringify({
        status: 'PASS',
        missingInfo: [],
        brandAlignment: true,
        healthcareComplianceWarnings: [
          'All headlines verified: No absolute medical outcome guarantees present.',
          'Geographic targeting confirmed for Toronto, Ontario, Canada.'
        ],
        grammarPass: true,
        locationMatch: true,
        currencyMatch: true,
        overallScore: 96
      }),
    },
  });

  // Seed AI Settings & Connections
  await prisma.aISetting.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      strategyProvider: 'OpenAI',
      researchProvider: 'Gemini',
      copyProvider: 'OpenAI',
      imageProvider: 'OpenAI',
      videoProvider: 'Gemini',
      validationProvider: 'Gemini',
      demoMode: true,
    },
  });

  await prisma.connectionStatus.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      openAiConnected: true,
      geminiConnected: true,
      googleAdsConnected: true,
      googleAdsCustomerId: '849-204-9102',
      googleAdsAccountName: 'G1 Sphere Canada Ads',
    },
  });

  // Seed Audit Log
  await prisma.auditLog.create({
    data: {
      userId: aman.id,
      userName: aman.name,
      action: 'Initialized Database & Seeded G1 Sphere / iCare Client',
      campaignId: campaign.id,
      campaignName: campaign.name,
      status: 'SUCCESS',
      details: 'SQLite database populated with users, clients, initial proposal, and AI settings.',
    },
  });

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
