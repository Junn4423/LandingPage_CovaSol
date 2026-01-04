/**
 * Script để migrate categories hiện có từ blog_posts và products
 * vào bảng blog_categories và product_categories
 * 
 * Chạy: npx ts-node scripts/migrate-categories.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Vietnamese diacritics mapping
const VIETNAMESE_DIACRITICS: Record<string, string> = {
  'à': 'a', 'á': 'a', 'ả': 'a', 'ã': 'a', 'ạ': 'a',
  'ă': 'a', 'ằ': 'a', 'ắ': 'a', 'ẳ': 'a', 'ẵ': 'a', 'ặ': 'a',
  'â': 'a', 'ầ': 'a', 'ấ': 'a', 'ẩ': 'a', 'ẫ': 'a', 'ậ': 'a',
  'è': 'e', 'é': 'e', 'ẻ': 'e', 'ẽ': 'e', 'ẹ': 'e',
  'ê': 'e', 'ề': 'e', 'ế': 'e', 'ể': 'e', 'ễ': 'e', 'ệ': 'e',
  'ì': 'i', 'í': 'i', 'ỉ': 'i', 'ĩ': 'i', 'ị': 'i',
  'ò': 'o', 'ó': 'o', 'ỏ': 'o', 'õ': 'o', 'ọ': 'o',
  'ô': 'o', 'ồ': 'o', 'ố': 'o', 'ổ': 'o', 'ỗ': 'o', 'ộ': 'o',
  'ơ': 'o', 'ờ': 'o', 'ớ': 'o', 'ở': 'o', 'ỡ': 'o', 'ợ': 'o',
  'ù': 'u', 'ú': 'u', 'ủ': 'u', 'ũ': 'u', 'ụ': 'u',
  'ư': 'u', 'ừ': 'u', 'ứ': 'u', 'ử': 'u', 'ữ': 'u', 'ự': 'u',
  'ỳ': 'y', 'ý': 'y', 'ỷ': 'y', 'ỹ': 'y', 'ỵ': 'y',
  'đ': 'd',
  'À': 'A', 'Á': 'A', 'Ả': 'A', 'Ã': 'A', 'Ạ': 'A',
  'Ă': 'A', 'Ằ': 'A', 'Ắ': 'A', 'Ẳ': 'A', 'Ẵ': 'A', 'Ặ': 'A',
  'Â': 'A', 'Ầ': 'A', 'Ấ': 'A', 'Ẩ': 'A', 'Ẫ': 'A', 'Ậ': 'A',
  'È': 'E', 'É': 'E', 'Ẻ': 'E', 'Ẽ': 'E', 'Ẹ': 'E',
  'Ê': 'E', 'Ề': 'E', 'Ế': 'E', 'Ể': 'E', 'Ễ': 'E', 'Ệ': 'E',
  'Ì': 'I', 'Í': 'I', 'Ỉ': 'I', 'Ĩ': 'I', 'Ị': 'I',
  'Ò': 'O', 'Ó': 'O', 'Ỏ': 'O', 'Õ': 'O', 'Ọ': 'O',
  'Ô': 'O', 'Ồ': 'O', 'Ố': 'O', 'Ổ': 'O', 'Ỗ': 'O', 'Ộ': 'O',
  'Ơ': 'O', 'Ờ': 'O', 'Ớ': 'O', 'Ở': 'O', 'Ỡ': 'O', 'Ợ': 'O',
  'Ù': 'U', 'Ú': 'U', 'Ủ': 'U', 'Ũ': 'U', 'Ụ': 'U',
  'Ư': 'U', 'Ừ': 'U', 'Ứ': 'U', 'Ử': 'U', 'Ữ': 'U', 'Ự': 'U',
  'Ỳ': 'Y', 'Ý': 'Y', 'Ỷ': 'Y', 'Ỹ': 'Y', 'Ỵ': 'Y',
  'Đ': 'D'
};

function removeVietnameseDiacritics(str: string): string {
  return str.split('').map(char => VIETNAMESE_DIACRITICS[char] || char).join('');
}

function generateCategoryCode(name: string): string {
  return removeVietnameseDiacritics(name)
    .toUpperCase()
    .replace(/[^A-Z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 50);
}

async function migrateBlogCategories() {
  console.log('📦 Đang migrate blog categories...');
  
  // Lấy tất cả categories unique từ blog_posts
  const blogPosts = await prisma.blogPost.findMany({
    select: { category: true },
    where: { category: { not: null } }
  });
  
  const uniqueCategories = [...new Set(
    blogPosts
      .map(p => p.category?.trim())
      .filter((c): c is string => !!c)
  )];
  
  console.log(`  Tìm thấy ${uniqueCategories.length} danh mục blog unique`);
  
  let created = 0;
  let skipped = 0;
  
  for (const categoryName of uniqueCategories) {
    const code = generateCategoryCode(categoryName);
    
    // Kiểm tra xem đã tồn tại chưa (theo code hoặc name)
    const existing = await prisma.blogCategory.findFirst({
      where: {
        OR: [
          { code },
          { name: categoryName }
        ]
      }
    });
    
    if (existing) {
      console.log(`  ⏭️ Bỏ qua: "${categoryName}" (đã tồn tại)`);
      skipped++;
      continue;
    }
    
    await prisma.blogCategory.create({
      data: {
        code,
        name: categoryName
      }
    });
    
    console.log(`  ✅ Đã tạo: "${categoryName}" (code: ${code})`);
    created++;
  }
  
  console.log(`📊 Blog categories: ${created} tạo mới, ${skipped} bỏ qua\n`);
}

async function migrateProductCategories() {
  console.log('📦 Đang migrate product categories...');
  
  // Lấy tất cả categories unique từ products
  const products = await prisma.product.findMany({
    select: { category: true },
    where: { category: { not: null } }
  });
  
  const uniqueCategories = [...new Set(
    products
      .map(p => p.category?.trim())
      .filter((c): c is string => !!c)
  )];
  
  console.log(`  Tìm thấy ${uniqueCategories.length} danh mục product unique`);
  
  let created = 0;
  let skipped = 0;
  
  for (const categoryName of uniqueCategories) {
    const code = generateCategoryCode(categoryName);
    
    // Kiểm tra xem đã tồn tại chưa (theo code hoặc name)
    const existing = await prisma.productCategory.findFirst({
      where: {
        OR: [
          { code },
          { name: categoryName }
        ]
      }
    });
    
    if (existing) {
      console.log(`  ⏭️ Bỏ qua: "${categoryName}" (đã tồn tại)`);
      skipped++;
      continue;
    }
    
    await prisma.productCategory.create({
      data: {
        code,
        name: categoryName
      }
    });
    
    console.log(`  ✅ Đã tạo: "${categoryName}" (code: ${code})`);
    created++;
  }
  
  console.log(`📊 Product categories: ${created} tạo mới, ${skipped} bỏ qua\n`);
}

async function main() {
  console.log('🚀 Bắt đầu migrate categories...\n');
  
  try {
    await migrateBlogCategories();
    await migrateProductCategories();
    
    // Hiển thị kết quả
    const blogCount = await prisma.blogCategory.count();
    const productCount = await prisma.productCategory.count();
    
    console.log('✅ Hoàn thành!');
    console.log(`  - Blog categories: ${blogCount}`);
    console.log(`  - Product categories: ${productCount}`);
  } catch (error) {
    console.error('❌ Lỗi khi migrate:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
