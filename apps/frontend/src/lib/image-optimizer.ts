const DEFAULT_MAX_BYTES = 1.2 * 1024 * 1024; // ~1.2MB to stay under proxy limits
const DEFAULT_MAX_DIMENSION = 1920;

export interface OptimizedImage {
  file: File;
  wasCompressed: boolean;
  originalSize: number;
  finalSize: number;
}

function normalizeFilename(name: string, ext: 'jpg' | 'webp' | 'png') {
  const base = name.replace(/\.[^/.]+$/, '') || 'upload';
  return `${base}.${ext}`;
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

function canvasToBlob(canvas: HTMLCanvasElement, format: string, quality?: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      blob => {
        if (!blob) return reject(new Error('Không thể nén ảnh.'));
        resolve(blob);
      },
      format,
      quality
    );
  });
}

function hasTransparency(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D): boolean {
  // Sample every 10th pixel to keep it fast on big images.
  const { width, height } = canvas;
  const step = 10;
  const sampleWidth = Math.max(1, Math.floor(width / step));
  const sampleHeight = Math.max(1, Math.floor(height / step));
  const imageData = ctx.getImageData(0, 0, sampleWidth, sampleHeight);
  for (let i = 3; i < imageData.data.length; i += 4) {
    if (imageData.data[i] < 250) {
      return true;
    }
  }
  return false;
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
  if (file.size <= maxBytes && (file.type === 'image/jpeg' || file.type === 'image/png')) {
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
  let targetFormat: 'image/jpeg' | 'image/webp' | 'image/png' = 'image/jpeg';
  let targetExt: 'jpg' | 'webp' | 'png' = 'jpg';

  while (attempt < 6) {
    canvas.width = Math.max(1, Math.round(width));
    canvas.height = Math.max(1, Math.round(height));
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

    // Detect transparency after first draw, then stick with chosen format for subsequent passes.
    if (attempt === 0) {
      const transparent = hasTransparency(canvas, ctx);
      if (transparent) {
        targetFormat = 'image/webp';
        targetExt = 'webp';
      } else {
        targetFormat = 'image/jpeg';
        targetExt = 'jpg';
      }
    }

    blob = await canvasToBlob(canvas, targetFormat, quality);

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

  // Preserve transparency by keeping a format that supports alpha (webp/png).
  const compressedFile = new File([blob], normalizeFilename(file.name, targetExt), { type: targetFormat });

  return {
    file: compressedFile,
    wasCompressed: true,
    originalSize: file.size,
    finalSize: compressedFile.size
  };
}

export { DEFAULT_MAX_BYTES as DEFAULT_MAX_UPLOAD_BYTES, DEFAULT_MAX_DIMENSION as DEFAULT_MAX_UPLOAD_DIMENSION };
