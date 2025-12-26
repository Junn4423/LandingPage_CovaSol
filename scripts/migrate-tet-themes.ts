#!/usr/bin/env node
/**
 * Migration script to consolidate Tet themes
 * This script will:
 * 1. Delete old 'new_year' and 'tet_nguyen_dan' themes
 * 2. Create or update the new consolidated 'tet' theme
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Starting Tet themes migration...\n');

  try {
    // 1. Delete old themes
    console.log('🗑️  Deleting old Tet themes...');
    const deleted = await prisma.seasonalTheme.deleteMany({
      where: {
        code: {
          in: ['new_year', 'tet_nguyen_dan', 'tet_tan_tai']
        }
      }
    });
    console.log(`✅ Deleted ${deleted.count} old theme(s)\n`);

    // 2. Create or update the new consolidated Tet theme
    console.log('📝 Creating consolidated Tet theme...');
    const currentYear = new Date().getFullYear();
    
    const tetTheme = await prisma.seasonalTheme.upsert({
      where: { code: 'tet' },
      update: {
        name: 'Tết',
        description: 'Tết Dương Lịch & Tết Nguyên Đán - Hoa đào/mai, câu đối tết',
        startDate: new Date(currentYear + 1, 0, 1),
        endDate: new Date(currentYear + 1, 1, 15),
        primaryColor: '#DC2626',
        secondaryColor: '#FBBF24',
        accentColor: '#FEE2E2',
        effectType: 'petals',
        effectEnabled: true,
        disableOnMobile: true,
        backgroundImageUrl: 'https://homenest.com.vn/wp-content/uploads/2025/12/Hoa-dao-ngay-tet-decor-website.png',
        decorations: [
          {
            id: 'tet-couplet-1-left',
            type: 'couplet',
            position: 'side-left',
            imageUrl: 'https://homenest.com.vn/wp-content/uploads/2025/12/Cau-noi-cau-duoc-uoc-thay.png',
            altText: 'Câu đối Tết bên trái',
            width: 180,
          },
          {
            id: 'tet-couplet-1-right',
            type: 'couplet',
            position: 'side-right',
            imageUrl: 'https://homenest.com.vn/wp-content/uploads/2025/12/Cau-noi-cau-duoc-uoc-thay.png',
            altText: 'Câu đối Tết bên phải',
            width: 180,
          },
          {
            id: 'tet-couplet-2-left',
            type: 'couplet',
            position: 'side-left',
            imageUrl: 'https://homenest.com.vn/wp-content/uploads/2025/12/Tan-tai-tan-loc-tan-binh-an.png',
            altText: 'Câu đối Tân tài bên trái',
            width: 180,
          },
          {
            id: 'tet-couplet-2-right',
            type: 'couplet',
            position: 'side-right',
            imageUrl: 'https://homenest.com.vn/wp-content/uploads/2025/12/Tan-tai-tan-loc-tan-binh-an.png',
            altText: 'Câu đối Tân tài bên phải',
            width: 180,
          },
        ],
        bannerText: '🏮 Chúc Mừng Năm Mới! An Khang Thịnh Vượng 🧧',
        priority: 20,
        status: 'active'
      },
      create: {
        code: 'tet',
        name: 'Tết',
        description: 'Tết Dương Lịch & Tết Nguyên Đán - Hoa đào/mai, câu đối tết',
        startDate: new Date(currentYear + 1, 0, 1),
        endDate: new Date(currentYear + 1, 1, 15),
        primaryColor: '#DC2626',
        secondaryColor: '#FBBF24',
        accentColor: '#FEE2E2',
        effectType: 'petals',
        effectEnabled: true,
        disableOnMobile: true,
        backgroundImageUrl: 'https://homenest.com.vn/wp-content/uploads/2025/12/Hoa-dao-ngay-tet-decor-website.png',
        decorations: [
          {
            id: 'tet-couplet-1-left',
            type: 'couplet',
            position: 'side-left',
            imageUrl: 'https://homenest.com.vn/wp-content/uploads/2025/12/Cau-noi-cau-duoc-uoc-thay.png',
            altText: 'Câu đối Tết bên trái',
            width: 180,
          },
          {
            id: 'tet-couplet-1-right',
            type: 'couplet',
            position: 'side-right',
            imageUrl: 'https://homenest.com.vn/wp-content/uploads/2025/12/Cau-noi-cau-duoc-uoc-thay.png',
            altText: 'Câu đối Tết bên phải',
            width: 180,
          },
          {
            id: 'tet-couplet-2-left',
            type: 'couplet',
            position: 'side-left',
            imageUrl: 'https://homenest.com.vn/wp-content/uploads/2025/12/Tan-tai-tan-loc-tan-binh-an.png',
            altText: 'Câu đối Tân tài bên trái',
            width: 180,
          },
          {
            id: 'tet-couplet-2-right',
            type: 'couplet',
            position: 'side-right',
            imageUrl: 'https://homenest.com.vn/wp-content/uploads/2025/12/Tan-tai-tan-loc-tan-binh-an.png',
            altText: 'Câu đối Tân tài bên phải',
            width: 180,
          },
        ],
        bannerText: '🏮 Chúc Mừng Năm Mới! An Khang Thịnh Vượng 🧧',
        isActive: false,
        priority: 20,
        status: 'active'
      }
    });

    console.log('✅ Consolidated Tet theme created/updated');
    console.log(`   ID: ${tetTheme.id}`);
    console.log(`   Code: ${tetTheme.code}`);
    console.log(`   Name: ${tetTheme.name}\n`);

    console.log('🎉 Migration completed successfully!');
    console.log('\n📋 Summary:');
    console.log('   - Removed old themes: new_year, tet_nguyen_dan, tet_tan_tai');
    console.log('   - Created/Updated: tet (consolidated theme)');
    console.log('   - Background image: ✓');
    console.log('   - Couplets: 2 sets (4 images total)\n');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
