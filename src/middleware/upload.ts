import multer from 'multer';
import cloudinary from '../config/cloudinary';

const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

// Buffer the file in memory, then stream it to Cloudinary manually.
// (Avoids depending on multer-storage-cloudinary, which pins an old
// cloudinary@1.x peer dependency incompatible with cloudinary@2.x.)
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 }, // 8MB
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_MIME.includes(file.mimetype)) {
      return cb(new Error('Only JPG, PNG, WEBP and GIF images are allowed.'));
    }
    cb(null, true);
  },
});

export function uploadBufferToCloudinary(buffer: Buffer, folder = 'aerowix'): Promise<{ url: string; public_id: string }> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, transformation: [{ width: 1920, crop: 'limit' }] },
      (error, result) => {
        if (error || !result) return reject(error);
        resolve({ url: result.secure_url, public_id: result.public_id });
      }
    );
    stream.end(buffer);
  });
}
