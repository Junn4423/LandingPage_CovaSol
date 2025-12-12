import { Router, type Request } from 'express';
import multer from 'multer';
import { StatusCodes } from 'http-status-codes';
import { uploadImageFromBuffer, listCloudinaryImages, deleteCloudinaryImage } from '../../services/upload.service';
import { logger } from '../../logger';

const MAX_UPLOAD_SIZE = 200 * 1024 * 1024; // 200MB

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    // Allow large uploads; compression handled by Cloudinary transformations
    fileSize: MAX_UPLOAD_SIZE
  }
});

export const adminUploadRouter = Router();

type UploadRequest = Request & { file?: Express.Multer.File };

adminUploadRouter.post('/images', upload.single('file'), async (req: UploadRequest, res) => {
  try {
    logger.info({
      path: req.originalUrl,
      contentLength: req.headers['content-length'],
      mime: req.file?.mimetype,
      size: req.file?.size
    }, 'upload: incoming request');

    if (!req.file) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: 'Thiếu file ảnh. Vui lòng chọn 1 ảnh để tải lên.' });
    }

    if (!req.file.mimetype?.startsWith('image/')) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: 'Chỉ hỗ trợ upload định dạng ảnh.' });
    }

    const folder = typeof req.body?.folder === 'string' && req.body.folder.trim() ? req.body.folder.trim() : undefined;
    const result = await uploadImageFromBuffer(req.file.buffer, { folder, filename: req.file.originalname });

    return res.status(StatusCodes.CREATED).json({
      url: result.url,
      publicId: result.publicId,
      width: result.width,
      height: result.height,
      bytes: result.bytes,
      format: result.format
    });
  } catch (error: any) {
    const status = typeof error?.status === 'number' ? error.status : StatusCodes.INTERNAL_SERVER_ERROR;
    const message = error?.message || 'Upload thất bại, vui lòng thử lại.';
    if (error?.code === 'LIMIT_FILE_SIZE') {
      logger.warn({ size: req.file?.size, limit: MAX_UPLOAD_SIZE }, 'upload: file size exceeds limit');
    } else {
      logger.error({ err: error, path: req.originalUrl }, 'upload: failed');
    }
    return res.status(status).json({ message });
  }
});

// GET /admin/uploads/album - List all images from Cloudinary
adminUploadRouter.get('/album', async (req, res) => {
  try {
    const folder = typeof req.query?.folder === 'string' ? req.query.folder : undefined;
    const maxResults = typeof req.query?.maxResults === 'string' ? parseInt(req.query.maxResults, 10) : 100;
    const nextCursor = typeof req.query?.nextCursor === 'string' ? req.query.nextCursor : undefined;
    
    const result = await listCloudinaryImages({ folder, maxResults, nextCursor });
    
    return res.status(StatusCodes.OK).json({
      success: true,
      data: result
    });
  } catch (error: any) {
    const status = typeof error?.status === 'number' ? error.status : StatusCodes.INTERNAL_SERVER_ERROR;
    const message = error?.message || 'Không thể tải danh sách ảnh.';
    return res.status(status).json({ success: false, message });
  }
});

// DELETE /admin/uploads/images/:publicId - Delete an image from Cloudinary
adminUploadRouter.delete('/images/:publicId(*)', async (req, res) => {
  try {
    const { publicId } = req.params;
    
    if (!publicId) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ success: false, message: 'Thiếu publicId của ảnh.' });
    }

    await deleteCloudinaryImage(publicId);
    
    return res.status(StatusCodes.OK).json({
      success: true,
      message: 'Đã xóa ảnh thành công.'
    });
  } catch (error: any) {
    const status = typeof error?.status === 'number' ? error.status : StatusCodes.INTERNAL_SERVER_ERROR;
    const message = error?.message || 'Xóa ảnh thất bại, vui lòng thử lại.';
    return res.status(status).json({ success: false, message });
  }
});
