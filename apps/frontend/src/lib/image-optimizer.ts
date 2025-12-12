const DEFAULT_MAX_BYTES = 1.2 * 1024 * 1024; // ~1.2MB to stay under proxy limits
const DEFAULT_MAX_DIMENSION = 1920;

export interface OptimizedImage {
  file: File;
  wasCompressed: boolean;
  originalSize: number;
  finalSize: number;
}

function normalizeFilename(name: string) {
  const base = name.replace(/\.[^/.]+$/, '') || 'upload';
  return `${base}.jpg`;
}

function loadImage(file: File): Promise<{ image: HTMLImageElement; revoke: () => void }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => resolve({ image: img, revoke: () => URL.revokeObjectURL(url) });
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Không thể đọc ảnh để nén.'));
    };
    img.src = url;
  });
}

function canvasToBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(blob => {
      if (!blob) return reject(new Error('Không thể nén ảnh.'));
      resolve(blob);
    }, 'image/jpeg', quality);
  });
}

export async function compressImageFile(
  file: File,
  options?: { maxBytes?: number; maxDimension?: number }
): Promise<OptimizedImage> {
  const maxBytes = options?.maxBytes ?? DEFAULT_MAX_BYTES;
  const maxDimension = options?.maxDimension ?? DEFAULT_MAX_DIMENSION;

  if (!file.type.startsWith('image/')) {
    return { file, wasCompressed: false, originalSize: file.size, finalSize: file.size };
  }

  // Already small enough; keep original type to preserve transparency when possible.
  if (file.size <= maxBytes && file.type === 'image/jpeg') {
    return { file, wasCompressed: false, originalSize: file.size, finalSize: file.size };
  }

  const { image, revoke } = await loadImage(file);
  let width = image.width;
  let height = image.height;

  const scale = Math.min(1, maxDimension / Math.max(width, height));
  width = Math.max(1, Math.round(width * scale));
  height = Math.max(1, Math.round(height * scale));

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    revoke();
    throw new Error('Trình duyệt không hỗ trợ canvas để nén ảnh.');
  }

  let quality = 0.82;
  let attempt = 0;
  let blob: Blob | null = null;

  while (attempt < 6) {
    canvas.width = Math.max(1, Math.round(width));
    canvas.height = Math.max(1, Math.round(height));
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

    blob = await canvasToBlob(canvas, quality);

    if (blob.size <= maxBytes) {
      break;
    }

    quality = Math.max(0.45, quality - 0.1);
    width = Math.max(1, Math.round(width * 0.88));
    height = Math.max(1, Math.round(height * 0.88));
    attempt += 1;
  }

  revoke();

  if (!blob) {
    throw new Error('Không thể nén ảnh.');
  }

  if (blob.size > maxBytes) {
    throw new Error('Ảnh quá lớn, vui lòng chọn ảnh nhỏ hơn hoặc giảm độ phân giải.');
  }

  const compressedFile = new File([blob], normalizeFilename(file.name), { type: 'image/jpeg' });

  return {
    file: compressedFile,
    wasCompressed: true,
    originalSize: file.size,
    finalSize: compressedFile.size
  };
}

export { DEFAULT_MAX_BYTES as DEFAULT_MAX_UPLOAD_BYTES, DEFAULT_MAX_DIMENSION as DEFAULT_MAX_UPLOAD_DIMENSION };
