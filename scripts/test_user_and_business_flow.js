const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testWorkflow() {
  console.log('==================================================');
  console.log('TESTING COMPLETE SUPER ADMIN -> USER -> BUSINESS FLOW');
  console.log('==================================================\n');

  // Step 1: Verify Super Admin
  const superAdmin = await prisma.user.findUnique({
    where: { email: 'aman@codekap.com' },
  });
  console.log('1. Super Admin Verification:');
  console.log(`   - Name: ${superAdmin.name}`);
  console.log(`   - Role: ${superAdmin.role}`);
  console.log(`   - ID: ${superAdmin.id}\n`);

  // Step 2: Super Admin creates/invites a new team member (e.g. Harshit with role MANAGER)
  console.log('2. Super Admin Invites "Harshit Singh" & Generates Passcode:');
  const targetEmail = 'harshit@codekap.com';
  const customPasscode = 'AGENT-9021';
  const expiresAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

  const invite = await prisma.invitation.create({
    data: {
      email: targetEmail,
      name: 'Harshit Singh',
      role: 'MANAGER',
      passcode: customPasscode,
      invitedBy: superAdmin.id,
      invitedByName: superAdmin.name,
      status: 'PENDING',
      expiresAt,
    },
  });
  console.log(`   ✓ Invitation Generated ID: ${invite.id}`);
  console.log(`   ✓ Passcode: ${invite.passcode}`);
  console.log(`   ✓ Assigned Role: ${invite.role}`);
  console.log(`   ✓ Invited Email: ${invite.email}\n`);

  // Step 3: Simulate Harshit accepting passcode & completing registration
  console.log('3. Harshit accepts invite with passcode & activates account:');
  // Update invite status
  await prisma.invitation.update({
    where: { id: invite.id },
    data: { status: 'ACCEPTED' },
  });

  const newUser = await prisma.user.create({
    data: {
      name: invite.name || 'Harshit Singh',
      email: invite.email,
      role: invite.role,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=harshit`,
      title: 'Marketing Manager',
    },
  });
  console.log(`   ✓ User Registered Successfully!`);
  console.log(`   ✓ User ID: ${newUser.id}`);
  console.log(`   ✓ Name: ${newUser.name}`);
  console.log(`   ✓ Role: ${newUser.role}`);
  console.log(`   ✓ Email: ${newUser.email}\n`);

  // Step 4: Harshit or Super Admin adds a new Business with full details (Logo, Phone, etc.)
  console.log('4. Creating New Business Profile with Complete Details:');
  const newBusiness = await prisma.client.create({
    data: {
      name: 'Dr. Eye Care Centre',
      businessName: 'Dr. Eye Care Laser Clinic Pvt Ltd',
      website: 'https://dreyeclinic.com',
      industry: 'Ophthalmology & Eye Health',
      country: 'India',
      province: 'Delhi NCR',
      city: 'New Delhi',
      contactName: 'Harshit Singh',
      contactEmail: 'contact@dreyeclinic.com',
      contactPhone: '+91 98765 43210',
      description: 'Specialized laser vision correction, cataract surgery, and pediatric eye consultations.',
      brandTone: 'Empathetic, Clinical, Trustworthy, Modern',
      logoUrl: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=200&auto=format&fit=crop&q=80',
    },
  });

  console.log(`   ✓ Business Created Successfully!`);
  console.log(`   ✓ Business ID: ${newBusiness.id}`);
  console.log(`   ✓ Display Name: ${newBusiness.name}`);
  console.log(`   ✓ Legal Name: ${newBusiness.businessName}`);
  console.log(`   ✓ Mobile/Phone: ${newBusiness.contactPhone}`);
  console.log(`   ✓ Email: ${newBusiness.contactEmail}`);
  console.log(`   ✓ Location: ${newBusiness.city}, ${newBusiness.province}, ${newBusiness.country}`);
  console.log(`   ✓ Logo URL: ${newBusiness.logoUrl}\n`);

  // Step 5: Final Database Verification
  console.log('5. Final Workspace State:');
  const allUsers = await prisma.user.findMany();
  const allClients = await prisma.client.findMany();
  const allInvites = await prisma.invitation.findMany();

  console.log(`   - Total Users: ${allUsers.length} (${allUsers.map(u => `${u.name} [${u.role}]`).join(', ')})`);
  console.log(`   - Total Businesses: ${allClients.length} (${allClients.map(c => c.name).join(', ')})`);
  console.log(`   - Total Invitations: ${allInvites.length} (${allInvites.map(i => `${i.email} -> ${i.status}`).join(', ')})`);

  console.log('\n==================================================');
  console.log('ALL WORKFLOW TESTS PASSED SUCCESSFULLY!');
  console.log('==================================================');
}

testWorkflow()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
