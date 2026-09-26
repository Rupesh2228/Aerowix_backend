import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { uploadBufferToCloudinary } from '../middleware/upload';

export const handleUpload = async (req: AuthRequest, res: Response) => {
  const file = (req as any).file as Express.Multer.File | undefined;
  if (!file) return res.status(400).json({ error: 'No file uploaded.' });
  try {
    const result = await uploadBufferToCloudinary(file.buffer);
    res.status(201).json({ url: result.url, public_id: result.public_id });
  } catch (err) {
    console.error('Cloudinary upload failed', err);
    res.status(500).json({ error: 'Image upload failed. Check Cloudinary configuration.' });
  }
};
