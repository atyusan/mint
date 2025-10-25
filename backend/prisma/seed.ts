import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create permissions
  console.log('📝 Creating permissions...');
  const permissions = [
    // User permissions
    {
      name: 'user:create',
      resource: 'user',
      action: 'create',
      description: 'Create new users',
    },
    {
      name: 'user:read',
      resource: 'user',
      action: 'read',
      description: 'View users',
    },
    {
      name: 'user:update',
      resource: 'user',
      action: 'update',
      description: 'Update users',
    },
    {
      name: 'user:delete',
      resource: 'user',
      action: 'delete',
      description: 'Delete users',
    },

    // Merchant permissions
    {
      name: 'merchant:create',
      resource: 'merchant',
      action: 'create',
      description: 'Create merchants',
    },
    {
      name: 'merchant:read',
      resource: 'merchant',
      action: 'read',
      description: 'View merchants',
    },
    {
      name: 'merchant:update',
      resource: 'merchant',
      action: 'update',
      description: 'Update merchants',
    },
    {
      name: 'merchant:delete',
      resource: 'merchant',
      action: 'delete',
      description: 'Delete merchants',
    },

    // Outlet permissions
    {
      name: 'outlet:create',
      resource: 'outlet',
      action: 'create',
      description: 'Create outlets',
    },
    {
      name: 'outlet:read',
      resource: 'outlet',
      action: 'read',
      description: 'View outlets',
    },
    {
      name: 'outlet:update',
      resource: 'outlet',
      action: 'update',
      description: 'Update outlets',
    },
    {
      name: 'outlet:delete',
      resource: 'outlet',
      action: 'delete',
      description: 'Delete outlets',
    },

    // Terminal permissions
    {
      name: 'terminal:create',
      resource: 'terminal',
      action: 'create',
      description: 'Create terminals',
    },
    {
      name: 'terminal:read',
      resource: 'terminal',
      action: 'read',
      description: 'View terminals',
    },
    {
      name: 'terminal:update',
      resource: 'terminal',
      action: 'update',
      description: 'Update terminals',
    },
    {
      name: 'terminal:delete',
      resource: 'terminal',
      action: 'delete',
      description: 'Delete terminals',
    },

    // Invoice permissions
    {
      name: 'invoice:create',
      resource: 'invoice',
      action: 'create',
      description: 'Create invoices',
    },
    {
      name: 'invoice:read',
      resource: 'invoice',
      action: 'read',
      description: 'View invoices',
    },
    {
      name: 'invoice:update',
      resource: 'invoice',
      action: 'update',
      description: 'Update invoices',
    },
    {
      name: 'invoice:delete',
      resource: 'invoice',
      action: 'delete',
      description: 'Delete invoices',
    },

    // Payment permissions
    {
      name: 'payment:create',
      resource: 'payment',
      action: 'create',
      description: 'Create payments',
    },
    {
      name: 'payment:read',
      resource: 'payment',
      action: 'read',
      description: 'View payments',
    },
    {
      name: 'payment:update',
      resource: 'payment',
      action: 'update',
      description: 'Update payments',
    },

    // Analytics permissions
    {
      name: 'analytics:read',
      resource: 'analytics',
      action: 'read',
      description: 'View analytics',
    },

    // Payout permissions
    {
      name: 'payout:create',
      resource: 'payout',
      action: 'create',
      description: 'Create payouts',
    },
    {
      name: 'payout:read',
      resource: 'payout',
      action: 'read',
      description: 'View payouts',
    },
    {
      name: 'payout:update',
      resource: 'payout',
      action: 'update',
      description: 'Update payouts',
    },

    // Fee permissions
    {
      name: 'fee:read',
      resource: 'fee',
      action: 'read',
      description: 'View fees',
    },
    {
      name: 'fee:update',
      resource: 'fee',
      action: 'update',
      description: 'Update fees',
    },
  ];

  for (const permission of permissions) {
    await prisma.permission.upsert({
      where: { name: permission.name },
      update: {},
      create: permission,
    });
  }

  // Create roles
  console.log('👥 Creating roles...');
  const roles = [
    {
      name: 'Super Admin',
      description: 'Full system access with all permissions',
    },
    {
      name: 'Admin',
      description: 'Administrative access with most permissions',
    },
    {
      name: 'Merchant Admin',
      description: 'Merchant-level administrative access',
    },
    {
      name: 'Outlet Manager',
      description: 'Outlet management permissions',
    },
    {
      name: 'Cashier',
      description: 'Basic cashier permissions for transactions',
    },
    {
      name: 'Analyst',
      description: 'Analytics and reporting permissions',
    },
  ];

  for (const role of roles) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: {},
      create: role,
    });
  }

  // Assign permissions to roles
  console.log('🔗 Assigning permissions to roles...');

  // Super Admin - All permissions
  const superAdminRole = await prisma.role.findUnique({
    where: { name: 'Super Admin' },
  });
  if (superAdminRole) {
    const allPermissions = await prisma.permission.findMany();
    for (const permission of allPermissions) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: superAdminRole.id,
            permissionId: permission.id,
          },
        },
        update: {},
        create: {
          roleId: superAdminRole.id,
          permissionId: permission.id,
        },
      });
    }
  }

  // Admin - Most permissions except user deletion
  const adminRole = await prisma.role.findUnique({ where: { name: 'Admin' } });
  if (adminRole) {
    const adminPermissions = await prisma.permission.findMany({
      where: {
        name: {
          not: 'user:delete',
        },
      },
    });
    for (const permission of adminPermissions) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: adminRole.id,
            permissionId: permission.id,
          },
        },
        update: {},
        create: {
          roleId: adminRole.id,
          permissionId: permission.id,
        },
      });
    }
  }

  // Merchant Admin - Merchant and outlet related permissions
  const merchantAdminRole = await prisma.role.findUnique({
    where: { name: 'Merchant Admin' },
  });
  if (merchantAdminRole) {
    const merchantPermissions = await prisma.permission.findMany({
      where: {
        resource: {
          in: [
            'merchant',
            'outlet',
            'terminal',
            'invoice',
            'payment',
            'analytics',
            'payout',
            'fee',
          ],
        },
      },
    });
    for (const permission of merchantPermissions) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: merchantAdminRole.id,
            permissionId: permission.id,
          },
        },
        update: {},
        create: {
          roleId: merchantAdminRole.id,
          permissionId: permission.id,
        },
      });
    }
  }

  // Outlet Manager - Outlet and terminal permissions
  const outletManagerRole = await prisma.role.findUnique({
    where: { name: 'Outlet Manager' },
  });
  if (outletManagerRole) {
    const outletPermissions = await prisma.permission.findMany({
      where: {
        resource: {
          in: ['outlet', 'terminal', 'invoice', 'payment'],
        },
      },
    });
    for (const permission of outletPermissions) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: outletManagerRole.id,
            permissionId: permission.id,
          },
        },
        update: {},
        create: {
          roleId: outletManagerRole.id,
          permissionId: permission.id,
        },
      });
    }
  }

  // Cashier - Invoice and payment permissions
  const cashierRole = await prisma.role.findUnique({
    where: { name: 'Cashier' },
  });
  if (cashierRole) {
    const cashierPermissions = await prisma.permission.findMany({
      where: {
        resource: {
          in: ['invoice', 'payment'],
        },
        action: {
          not: 'delete',
        },
      },
    });
    for (const permission of cashierPermissions) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: cashierRole.id,
            permissionId: permission.id,
          },
        },
        update: {},
        create: {
          roleId: cashierRole.id,
          permissionId: permission.id,
        },
      });
    }
  }

  // Analyst - Analytics permissions
  const analystRole = await prisma.role.findUnique({
    where: { name: 'Analyst' },
  });
  if (analystRole) {
    const analystPermissions = await prisma.permission.findMany({
      where: {
        resource: 'analytics',
      },
    });
    for (const permission of analystPermissions) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: analystRole.id,
            permissionId: permission.id,
          },
        },
        update: {},
        create: {
          roleId: analystRole.id,
          permissionId: permission.id,
        },
      });
    }
  }

  // Create payment categories
  console.log('📊 Creating payment categories...');
  const paymentCategories = [
    { name: 'General', description: 'General payments', color: '#1976d2' },
    { name: 'Retail', description: 'Retail transactions', color: '#388e3c' },
    { name: 'Services', description: 'Service payments', color: '#f57c00' },
    {
      name: 'Healthcare',
      description: 'Healthcare services',
      color: '#d32f2f',
    },
    {
      name: 'Education',
      description: 'Educational services',
      color: '#7b1fa2',
    },
    {
      name: 'Food & Beverage',
      description: 'Food and beverage sales',
      color: '#c2185b',
    },
    {
      name: 'Transportation',
      description: 'Transportation services',
      color: '#00796b',
    },
    {
      name: 'Entertainment',
      description: 'Entertainment and leisure',
      color: '#ff5722',
    },
  ];

  for (const category of paymentCategories) {
    await prisma.paymentCategory.upsert({
      where: { name: category.name },
      update: {},
      create: category,
    });
  }

  // Create system admin user
  console.log('👤 Creating system admin user...');
  const hashedPassword = bcrypt.hashSync('admin123!', 12);

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@mintplatform.com' },
    update: {},
    create: {
      email: 'admin@mintplatform.com',
      firstName: 'System',
      lastName: 'Admin',
      userType: 'ADMIN',
      status: 'ACTIVE',
      passwordHash: hashedPassword,
      emailVerified: true,
    },
  });

  // Assign Super Admin role to admin user
  const superAdmin = await prisma.role.findUnique({
    where: { name: 'Super Admin' },
  });
  if (superAdmin) {
    await prisma.userRole.upsert({
      where: {
        userId_roleId: {
          userId: adminUser.id,
          roleId: superAdmin.id,
        },
      },
      update: {},
      create: {
        userId: adminUser.id,
        roleId: superAdmin.id,
      },
    });
  }

  // Create demo merchant
  console.log('🏢 Creating demo merchant...');
  const merchantUser = await prisma.user.upsert({
    where: { email: 'merchant@demo.com' },
    update: {},
    create: {
      email: 'merchant@demo.com',
      firstName: 'Demo',
      lastName: 'Merchant',
      userType: 'MERCHANT',
      status: 'ACTIVE',
      passwordHash: bcrypt.hashSync('merchant123!', 12),
      emailVerified: true,
    },
  });

  const merchant = await prisma.merchant.upsert({
    where: { userId: merchantUser.id },
    update: {},
    create: {
      userId: merchantUser.id,
      businessName: 'Demo Business Ltd',
      businessType: 'Retail',
      registrationNumber: 'RC123456',
      address: '123 Business Street, Lagos',
      city: 'Lagos',
      state: 'Lagos',
      country: 'Nigeria',
      website: 'https://demo-business.com',
      description: 'A demo business for testing purposes',
    },
  });

  // Assign Merchant Admin role to merchant user
  const merchantAdmin = await prisma.role.findUnique({
    where: { name: 'Merchant Admin' },
  });
  if (merchantAdmin) {
    await prisma.userRole.upsert({
      where: {
        userId_roleId: {
          userId: merchantUser.id,
          roleId: merchantAdmin.id,
        },
      },
      update: {},
      create: {
        userId: merchantUser.id,
        roleId: merchantAdmin.id,
      },
    });
  }

  // Create demo outlets
  console.log('🏪 Creating demo outlets...');
  const outlets = [
    {
      merchantId: merchant.id,
      name: 'Main Store - Lagos',
      address: '123 Business Street, Victoria Island',
      city: 'Lagos',
      state: 'Lagos',
      country: 'Nigeria',
      phone: '+234-801-234-5678',
      email: 'mainstore@demo-business.com',
    },
    {
      merchantId: merchant.id,
      name: 'Branch Store - Abuja',
      address: '456 Commerce Avenue, Wuse 2',
      city: 'Abuja',
      state: 'FCT',
      country: 'Nigeria',
      phone: '+234-802-345-6789',
      email: 'branch@demo-business.com',
    },
  ];

  const createdOutlets: any[] = [];
  for (const outletData of outlets) {
    const outlet = await prisma.outlet.create({
      data: outletData,
    });
    createdOutlets.push(outlet);
  }

  // Create demo terminals
  console.log('💳 Creating demo terminals...');
  const terminals = [
    {
      outletId: createdOutlets[0].id,
      serialNumber: 'TERM001',
      model: 'Paystack Terminal Pro',
      status: 'ACTIVE' as const,
      location: 'Counter 1',
      isOnline: true,
      lastSeenAt: new Date(),
    },
    {
      outletId: createdOutlets[0].id,
      serialNumber: 'TERM002',
      model: 'Paystack Terminal Lite',
      status: 'ACTIVE' as const,
      location: 'Counter 2',
      isOnline: false,
      lastSeenAt: new Date(Date.now() - 3600000), // 1 hour ago
    },
    {
      outletId: createdOutlets[1].id,
      serialNumber: 'TERM003',
      model: 'Paystack Terminal Pro',
      status: 'ACTIVE' as const,
      location: 'Main Counter',
      isOnline: true,
      lastSeenAt: new Date(),
    },
  ];

  for (const terminalData of terminals) {
    await prisma.terminal.create({
      data: terminalData,
    });
  }

  // Create demo invoices
  console.log('🧾 Creating demo invoices...');
  const generalCategory = await prisma.paymentCategory.findUnique({
    where: { name: 'General' },
  });
  const retailCategory = await prisma.paymentCategory.findUnique({
    where: { name: 'Retail' },
  });

  const term1 = await prisma.terminal.findUnique({
    where: { serialNumber: 'TERM001' },
  });
  const term3 = await prisma.terminal.findUnique({
    where: { serialNumber: 'TERM003' },
  });

  const invoices = [
    {
      outletId: createdOutlets[0].id,
      terminalId: term1?.id,
      categoryId: retailCategory?.id,
      invoiceNumber: 'INV-2024-001',
      customerEmail: 'customer1@example.com',
      customerName: 'John Doe',
      amount: 5000.0,
      fee: 125.0,
      totalAmount: 5125.0,
      currency: 'NGN',
      status: 'PAID' as const,
      description: 'Retail purchase - Electronics',
      paidAt: new Date(Date.now() - 86400000), // 1 day ago
    },
    {
      outletId: createdOutlets[0].id,
      terminalId: term1?.id,
      categoryId: generalCategory?.id,
      invoiceNumber: 'INV-2024-002',
      customerEmail: 'customer2@example.com',
      customerName: 'Jane Smith',
      amount: 2500.0,
      fee: 62.5,
      totalAmount: 2562.5,
      currency: 'NGN',
      status: 'PENDING' as const,
      description: 'General services',
    },
    {
      outletId: createdOutlets[1].id,
      terminalId: term3?.id,
      categoryId: retailCategory?.id,
      invoiceNumber: 'INV-2024-003',
      customerEmail: 'customer3@example.com',
      customerName: 'Bob Johnson',
      amount: 7500.0,
      fee: 187.5,
      totalAmount: 7687.5,
      currency: 'NGN',
      status: 'PAID' as const,
      description: 'Retail purchase - Clothing',
      paidAt: new Date(Date.now() - 172800000), // 2 days ago
    },
  ];

  for (const invoiceData of invoices) {
    await prisma.invoice.create({
      data: invoiceData,
    });
  }

  // Create demo payments for paid invoices
  console.log('💰 Creating demo payments...');
  const paidInvoices = await prisma.invoice.findMany({
    where: { status: 'PAID' },
  });

  for (const invoice of paidInvoices) {
    await prisma.payment.create({
      data: {
        invoiceId: invoice.id,
        amount: invoice.amount,
        fee: invoice.fee,
        netAmount: Number(invoice.amount) - Number(invoice.fee),
        currency: 'NGN',
        method: 'CARD',
        reference: `PAY-${invoice.invoiceNumber}`,
        paystackReference: `PS-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        status: 'success',
        processedAt: invoice.paidAt,
      },
    });
  }

  // Create demo payout methods
  console.log('🏦 Creating demo payout methods...');
  const payoutMethods = [
    {
      merchantId: merchant.id,
      methodType: 'BANK_ACCOUNT',
      accountName: 'Demo Business Ltd',
      accountNumber: '1234567890',
      bankCode: '011',
      bankName: 'First Bank of Nigeria',
      isDefault: true,
    },
    {
      merchantId: merchant.id,
      methodType: 'BANK_ACCOUNT',
      accountName: 'Demo Business Ltd - Savings',
      accountNumber: '0987654321',
      bankCode: '014',
      bankName: 'Access Bank',
      isDefault: false,
    },
  ];

  for (const methodData of payoutMethods) {
    await prisma.payoutMethod.create({
      data: methodData,
    });
  }

  // Create demo payouts
  console.log('💸 Creating demo payouts...');
  const defaultPayoutMethod = await prisma.payoutMethod.findFirst({
    where: { merchantId: merchant.id, isDefault: true },
  });

  if (defaultPayoutMethod) {
    const payouts = [
      {
        merchantId: merchant.id,
        payoutMethodId: defaultPayoutMethod.id,
        amount: 5000.0,
        fee: 50.0,
        netAmount: 4950.0,
        currency: 'NGN',
        status: 'COMPLETED' as const,
        frequency: 'WEEKLY' as const,
        reference: 'PAY-2024-001',
        processedAt: new Date(Date.now() - 604800000), // 1 week ago
      },
      {
        merchantId: merchant.id,
        payoutMethodId: defaultPayoutMethod.id,
        amount: 7500.0,
        fee: 75.0,
        netAmount: 7425.0,
        currency: 'NGN',
        status: 'PENDING' as const,
        frequency: 'WEEKLY' as const,
        reference: 'PAY-2024-002',
        scheduledFor: new Date(Date.now() + 86400000), // Tomorrow
      },
    ];

    for (const payoutData of payouts) {
      await prisma.payout.create({
        data: payoutData,
      });
    }
  }

  // Create system configuration
  console.log('⚙️ Creating system configuration...');
  const systemConfigs = [
    { key: 'PLATFORM_NAME', value: 'Mint Platform', type: 'STRING' },
    { key: 'DEFAULT_CURRENCY', value: 'NGN', type: 'STRING' },
    { key: 'DEFAULT_FEE_PERCENTAGE', value: '2.5', type: 'NUMBER' },
    { key: 'MIN_FEE_AMOUNT', value: '50', type: 'NUMBER' },
    { key: 'MAX_FEE_AMOUNT', value: '2000', type: 'NUMBER' },
    { key: 'PAYOUT_PROCESSING_ENABLED', value: 'true', type: 'BOOLEAN' },
    { key: 'TERMINAL_HEARTBEAT_INTERVAL', value: '300', type: 'NUMBER' },
    { key: 'INVOICE_EXPIRY_HOURS', value: '24', type: 'NUMBER' },
  ];

  for (const config of systemConfigs) {
    await prisma.systemConfig.upsert({
      where: { key: config.key },
      update: {},
      create: config,
    });
  }

  console.log('✅ Database seeding completed successfully!');
  console.log('\n📋 Summary:');
  console.log(`- Created ${permissions.length} permissions`);
  console.log(`- Created ${roles.length} roles`);
  console.log(`- Created ${paymentCategories.length} payment categories`);
  console.log(`- Created 1 admin user (admin@mintplatform.com)`);
  console.log(`- Created 1 demo merchant (merchant@demo.com)`);
  console.log(`- Created ${outlets.length} demo outlets`);
  console.log(`- Created ${terminals.length} demo terminals`);
  console.log(`- Created ${invoices.length} demo invoices`);
  console.log(`- Created ${systemConfigs.length} system configurations`);
  console.log('\n🔐 Default credentials:');
  console.log('Admin: admin@mintplatform.com / admin123!');
  console.log('Merchant: merchant@demo.com / merchant123!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
