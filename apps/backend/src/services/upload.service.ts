import { v2 as cloudinary, type UploadApiResponse, type UploadApiErrorResponse } from 'cloudinary';
import { StatusCodes } from 'http-status-codes';
import { config } from '../config';

const hasCloudinaryCredentials = Boolean(
  config.cloudinary.url ||
    (config.cloudinary.cloudName && config.cloudinary.apiKey && config.cloudinary.apiSecret)
);

if (hasCloudinaryCredentials) {
  cloudinary.config(
    config.cloudinary.url
      ? { cloudinary_url: config.cloudinary.url }
      : {
          cloud_name: config.cloudinary.cloudName,
          api_key: config.cloudinary.apiKey,
          api_secret: config.cloudinary.apiSecret
        }
  );
}

export class UploadError extends Error {
  status: number;

  constructor(message: string, status = StatusCodes.INTERNAL_SERVER_ERROR) {
    super(message);
    this.status = status;
  }
}

function ensureCloudinaryConfigured() {
  if (!hasCloudinaryCredentials) {
    throw new UploadError('Cloudinary chưa được cấu hình. Vui lòng bổ sung CLOUDINARY_URL hoặc bộ CLOUDINARY_CLOUD_NAME/API_KEY/API_SECRET.', StatusCodes.SERVICE_UNAVAILABLE);
  }
}

function resolveFolder(folder?: string) {
  const base = config.cloudinary.folder || 'landing_page_assets';
  if (!folder) return base;
  return `${base}/${folder}`.replace(/\/*$/, '');
}

export interface UploadResult {
  url: string;
  publicId: string;
  width?: number;
  height?: number;
  bytes?: number;
  format?: string;
}

export interface CloudinaryImage {
  publicId: string;
  url: string;
  secureUrl: string;
  width: number;
  height: number;
  bytes: number;
  format: string;
  createdAt: string;
  folder: string;
}

export interface ListImagesResult {
  images: CloudinaryImage[];
  nextCursor?: string;
  totalCount?: number;
}

export async function uploadImageFromBuffer(
  fileBuffer: Buffer,
  options?: { folder?: string; filename?: string }
): Promise<UploadResult> {
  ensureCloudinaryConfigured();

  if (!fileBuffer?.length) {
    throw new UploadError('Không tìm thấy dữ liệu file để upload', StatusCodes.BAD_REQUEST);
  }

  const folder = resolveFolder(options?.folder);

  const result = await new Promise<UploadApiResponse>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        use_filename: Boolean(options?.filename),
        filename_override: options?.filename,
        unique_filename: !options?.filename,
        overwrite: false
      },
      (error?: UploadApiErrorResponse, uploadResult?: UploadApiResponse) => {
        if (error || !uploadResult) {
          return reject(new UploadError(error?.message || 'Upload lên Cloudinary thất bại'));
        }
        resolve(uploadResult);
      }
    );

    stream.end(fileBuffer);
  });

  return {
    url: result.secure_url || result.url,
    publicId: result.public_id,
    width: result.width,
    height: result.height,
    bytes: result.bytes,
    format: result.format
  };
}

export async function listCloudinaryImages(options?: {
  folder?: string;
  maxResults?: number;
  nextCursor?: string;
}): Promise<ListImagesResult> {
  ensureCloudinaryConfigured();

  const baseFolder = config.cloudinary.folder || 'landing_page_assets';
  const searchFolder = options?.folder 
    ? `${baseFolder}/${options.folder}` 
    : baseFolder;

  try {
    const result = await cloudinary.search
      .expression(`folder:${searchFolder}/* AND resource_type:image`)
      .sort_by('created_at', 'desc')
      .max_results(options?.maxResults || 100)
      .next_cursor(options?.nextCursor || '')
      .execute();

    const images: CloudinaryImage[] = (result.resources || []).map((resource: any) => ({
      publicId: resource.public_id,
      url: resource.url,
      secureUrl: resource.secure_url,
      width: resource.width,
      height: resource.height,
      bytes: resource.bytes,
      format: resource.format,
      createdAt: resource.created_at,
      folder: resource.folder || ''
    }));

    return {
      images,
      nextCursor: result.next_cursor,
      totalCount: result.total_count
    };
  } catch (error: any) {
    throw new UploadError(
      error?.message || 'Không thể tải danh sách ảnh từ Cloudinary',
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
}

export async function deleteCloudinaryImage(publicId: string): Promise<void> {
  ensureCloudinaryConfigured();

  if (!publicId) {
    throw new UploadError('Thiếu publicId của ảnh', StatusCodes.BAD_REQUEST);
  }

  try {
    const result = await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
    
    if (result.result !== 'ok' && result.result !== 'not found') {
      throw new UploadError(`Xóa ảnh thất bại: ${result.result}`, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  } catch (error: any) {
    if (error instanceof UploadError) throw error;
    throw new UploadError(
      error?.message || 'Không thể xóa ảnh từ Cloudinary',
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
}
