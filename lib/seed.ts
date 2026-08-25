import { prisma } from './prisma';

export async function ensureSeedData() {
  try {
    // 1. Ensure Super Admin (Aman Sir)
    await prisma.user.upsert({
      where: { email: 'aman@codekap.com' },
      update: {
        name: 'Aman Sir',
        role: 'ADMIN',
        title: 'Super Admin / Founder & CEO',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      },
      create: {
        id: 'usr_aman',
        name: 'Aman Sir',
        email: 'aman@codekap.com',
        role: 'ADMIN',
        title: 'Super Admin / Founder & CEO',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      },
    });

    // 2. Ensure Admin / Architect (Harshit Singh)
    await prisma.user.upsert({
      where: { email: 'harshitsingh19622@gmail.com' },
      update: {
        name: 'Harshit Singh',
        role: 'ADMIN',
        title: 'Lead Architect / Admin',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=harshitsingh19622@gmail.com',
      },
      create: {
        id: 'usr_harshit',
        name: 'Harshit Singh',
        email: 'harshitsingh19622@gmail.com',
        role: 'ADMIN',
        title: 'Lead Architect / Admin',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=harshitsingh19622@gmail.com',
      },
    });

    // 3. Ensure Permanent Client: Jeevansphere
    const existingClient = await prisma.client.findFirst({
      where: { name: 'Jeevansphere' },
    });

    let clientId = existingClient?.id;

    if (!existingClient) {
      const created = await prisma.client.create({
        data: {
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
        },
      });
      clientId = created.id;
    } else if (!existingClient.clientCode) {
      await prisma.client.update({
        where: { id: existingClient.id },
        data: { clientCode: 'CK-JEEV-2001' },
      });
    }

    // 4. Ensure Assigned Tasks from Aman Sir to Harshit Singh
    const taskCount = await prisma.task.count({
      where: {
        OR: [
          { assignedToEmail: 'harshitsingh19622@gmail.com' },
          { assignedToEmail: 'harshit@codekap.com' },
        ],
      },
    });

    if (taskCount === 0) {
      await prisma.task.create({
        data: {
          title: 'Design & Launch 3 Eye Care Visual Ads for Jeevansphere',
          description: 'Create 3 high-converting creative visuals and marketing copy for Jeevansphere clinic targeting eye care consultations. Please review brand tone and launch approval.',
          priority: 'URGENT',
          status: 'TODO',
          assignedToId: 'usr_harshit',
          assignedToName: 'Harshit Singh',
          assignedToEmail: 'harshitsingh19622@gmail.com',
          assignedById: 'usr_aman',
          assignedByName: 'Aman Sir',
          clientId: clientId || null,
          clientName: 'Jeevansphere',
          dueDate: '2026-08-30',
        },
      });

      await prisma.task.create({
        data: {
          title: 'Setup & Verify Live Deployment Link & Google Ads Tracking',
          description: 'Link the GitHub code repository and live deployment URL for Jeevansphere in the Client Business Hub.',
          priority: 'HIGH',
          status: 'TODO',
          assignedToId: 'usr_harshit',
          assignedToName: 'Harshit Singh',
          assignedToEmail: 'harshitsingh19622@gmail.com',
          assignedById: 'usr_aman',
          assignedByName: 'Aman Sir',
          clientId: clientId || null,
          clientName: 'Jeevansphere',
          dueDate: '2026-09-02',
        },
      });
    }

    // 5. Ensure Default Active Invitation Passcodes for Team Joining
    const inviteCount = await prisma.invitation.count();
    if (inviteCount === 0) {
      const expiresAt = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000); // 60 days
      await prisma.invitation.create({
        data: {
          email: 'harshitsingh19622@gmail.com',
          name: 'Harshit Singh',
          role: 'MANAGER',
          passcode: 'AGENT-7788',
          status: 'ACCEPTED',
          invitedBy: 'usr_aman',
          invitedByName: 'Aman Sir',
          message: 'Welcome to Agent AI Marketing Team!',
          expiresAt,
        },
      });

      await prisma.invitation.create({
        data: {
          email: 'team@codekap.com',
          name: 'Colleague Invite',
          role: 'TEAM_MEMBER',
          passcode: 'AGENT-4819',
          status: 'PENDING',
          invitedBy: 'usr_aman',
          invitedByName: 'Aman Sir',
          message: 'Join the Codekap marketing workspace.',
          expiresAt,
        },
      });
    }
  } catch (err) {
    console.warn('[Seed Data Warning]:', err);
  }
}
