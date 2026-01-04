import { prisma } from '../db/prisma';

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

export function generateCategoryCode(name: string): string {
  return removeVietnameseDiacritics(name)
    .toUpperCase()
    .replace(/[^A-Z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 50);
}

export interface CategoryItem {
  id: number;
  code: string;
  name: string;
  description?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCategoryInput {
  name: string;
  code?: string;
  description?: string;
}

// =====================================================
// Blog Categories
// =====================================================

export async function listBlogCategories(): Promise<CategoryItem[]> {
  return prisma.blogCategory.findMany({
    orderBy: { name: 'asc' }
  });
}

export async function getBlogCategoryByCode(code: string): Promise<CategoryItem | null> {
  return prisma.blogCategory.findUnique({ where: { code } });
}

export async function getBlogCategoryByName(name: string): Promise<CategoryItem | null> {
  return prisma.blogCategory.findUnique({ where: { name } });
}

export async function createBlogCategory(input: CreateCategoryInput): Promise<CategoryItem> {
  const code = input.code || generateCategoryCode(input.name);
  
  // Kiểm tra trùng code hoặc name
  const existing = await prisma.blogCategory.findFirst({
    where: {
      OR: [
        { code },
        { name: input.name }
      ]
    }
  });
  
  if (existing) {
    if (existing.code === code) {
      throw new Error(`Mã danh mục "${code}" đã tồn tại`);
    }
    throw new Error(`Tên danh mục "${input.name}" đã tồn tại`);
  }
  
  return prisma.blogCategory.create({
    data: {
      code,
      name: input.name,
      description: input.description
    }
  });
}

export async function updateBlogCategory(
  id: number,
  input: Partial<CreateCategoryInput>
): Promise<CategoryItem> {
  const existing = await prisma.blogCategory.findUnique({ where: { id } });
  if (!existing) {
    throw new Error('Không tìm thấy danh mục');
  }
  
  // Nếu thay đổi code hoặc name, kiểm tra trùng
  if (input.code && input.code !== existing.code) {
    const codeExists = await prisma.blogCategory.findUnique({ where: { code: input.code } });
    if (codeExists) {
      throw new Error(`Mã danh mục "${input.code}" đã tồn tại`);
    }
  }
  
  if (input.name && input.name !== existing.name) {
    const nameExists = await prisma.blogCategory.findUnique({ where: { name: input.name } });
    if (nameExists) {
      throw new Error(`Tên danh mục "${input.name}" đã tồn tại`);
    }
  }
  
  return prisma.blogCategory.update({
    where: { id },
    data: {
      ...(input.code && { code: input.code }),
      ...(input.name && { name: input.name }),
      ...(input.description !== undefined && { description: input.description })
    }
  });
}

export async function deleteBlogCategory(id: number): Promise<void> {
  await prisma.blogCategory.delete({ where: { id } });
}

/**
 * Tìm hoặc tạo danh mục blog
 * Nếu name không tồn tại, tự động tạo mới
 */
export async function findOrCreateBlogCategory(name: string): Promise<CategoryItem> {
  const trimmedName = name.trim();
  if (!trimmedName) {
    throw new Error('Tên danh mục không được để trống');
  }
  
  // Tìm theo tên
  const existing = await prisma.blogCategory.findUnique({
    where: { name: trimmedName }
  });
  
  if (existing) {
    return existing;
  }
  
  // Tạo mới
  const code = generateCategoryCode(trimmedName);
  
  // Kiểm tra code có trùng không
  let finalCode = code;
  const codeExists = await prisma.blogCategory.findUnique({ where: { code } });
  if (codeExists) {
    // Thêm suffix số
    let suffix = 1;
    while (await prisma.blogCategory.findUnique({ where: { code: `${code}-${suffix}` } })) {
      suffix++;
    }
    finalCode = `${code}-${suffix}`;
  }
  
  return prisma.blogCategory.create({
    data: {
      code: finalCode,
      name: trimmedName
    }
  });
}

// =====================================================
// Product Categories
// =====================================================

export async function listProductCategories(): Promise<CategoryItem[]> {
  return prisma.productCategory.findMany({
    orderBy: { name: 'asc' }
  });
}

export async function getProductCategoryByCode(code: string): Promise<CategoryItem | null> {
  return prisma.productCategory.findUnique({ where: { code } });
}

export async function getProductCategoryByName(name: string): Promise<CategoryItem | null> {
  return prisma.productCategory.findUnique({ where: { name } });
}

export async function createProductCategory(input: CreateCategoryInput): Promise<CategoryItem> {
  const code = input.code || generateCategoryCode(input.name);
  
  // Kiểm tra trùng code hoặc name
  const existing = await prisma.productCategory.findFirst({
    where: {
      OR: [
        { code },
        { name: input.name }
      ]
    }
  });
  
  if (existing) {
    if (existing.code === code) {
      throw new Error(`Mã danh mục "${code}" đã tồn tại`);
    }
    throw new Error(`Tên danh mục "${input.name}" đã tồn tại`);
  }
  
  return prisma.productCategory.create({
    data: {
      code,
      name: input.name,
      description: input.description
    }
  });
}

export async function updateProductCategory(
  id: number,
  input: Partial<CreateCategoryInput>
): Promise<CategoryItem> {
  const existing = await prisma.productCategory.findUnique({ where: { id } });
  if (!existing) {
    throw new Error('Không tìm thấy danh mục');
  }
  
  // Nếu thay đổi code hoặc name, kiểm tra trùng
  if (input.code && input.code !== existing.code) {
    const codeExists = await prisma.productCategory.findUnique({ where: { code: input.code } });
    if (codeExists) {
      throw new Error(`Mã danh mục "${input.code}" đã tồn tại`);
    }
  }
  
  if (input.name && input.name !== existing.name) {
    const nameExists = await prisma.productCategory.findUnique({ where: { name: input.name } });
    if (nameExists) {
      throw new Error(`Tên danh mục "${input.name}" đã tồn tại`);
    }
  }
  
  return prisma.productCategory.update({
    where: { id },
    data: {
      ...(input.code && { code: input.code }),
      ...(input.name && { name: input.name }),
      ...(input.description !== undefined && { description: input.description })
    }
  });
}

export async function deleteProductCategory(id: number): Promise<void> {
  await prisma.productCategory.delete({ where: { id } });
}

/**
 * Tìm hoặc tạo danh mục product
 * Nếu name không tồn tại, tự động tạo mới
 */
export async function findOrCreateProductCategory(name: string): Promise<CategoryItem> {
  const trimmedName = name.trim();
  if (!trimmedName) {
    throw new Error('Tên danh mục không được để trống');
  }
  
  // Tìm theo tên
  const existing = await prisma.productCategory.findUnique({
    where: { name: trimmedName }
  });
  
  if (existing) {
    return existing;
  }
  
  // Tạo mới
  const code = generateCategoryCode(trimmedName);
  
  // Kiểm tra code có trùng không
  let finalCode = code;
  const codeExists = await prisma.productCategory.findUnique({ where: { code } });
  if (codeExists) {
    // Thêm suffix số
    let suffix = 1;
    while (await prisma.productCategory.findUnique({ where: { code: `${code}-${suffix}` } })) {
      suffix++;
    }
    finalCode = `${code}-${suffix}`;
  }
  
  return prisma.productCategory.create({
    data: {
      code: finalCode,
      name: trimmedName
    }
  });
}
