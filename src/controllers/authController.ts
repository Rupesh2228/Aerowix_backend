import { Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../config/db';
import { asyncHandler } from '../utils/asyncHandler';
import { loginSchema } from '../validators/schemas';
import { AuthRequest } from '../middleware/auth';

export const login = asyncHandler(async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid email or password format.' });
  }
  const { email, password } = parsed.data;

  const result = await pool.query('SELECT * FROM admins WHERE email = $1', [email]);
  const admin = result.rows[0];
  if (!admin) return res.status(401).json({ error: 'Invalid credentials.' });

  const match = await bcrypt.compare(password, admin.password_hash);
  if (!match) return res.status(401).json({ error: 'Invalid credentials.' });

  const token = jwt.sign(
    { id: admin.id, email: admin.email, role: admin.role },
    process.env.JWT_SECRET as string,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as jwt.SignOptions
  );

  res.json({
    token,
    admin: { id: admin.id, name: admin.name, email: admin.email, role: admin.role },
  });
});

export const me = asyncHandler(async (req: AuthRequest, res: Response) => {
  res.json({ admin: req.admin });
});
