import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { pool } from './db';

dotenv.config();

async function migrate() {
  const sql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
  await pool.query(sql);
  console.log('✔ Schema migrated.');

  const email = process.env.ADMIN_SEED_EMAIL || 'admin@aerowix.com';
  const password = process.env.ADMIN_SEED_PASSWORD || 'ChangeMe123!';
  const existing = await pool.query('SELECT id FROM admins WHERE email = $1', [email]);

  if (existing.rows.length === 0) {
    const hash = await bcrypt.hash(password, 12);
    await pool.query(
      'INSERT INTO admins (name, email, password_hash, role) VALUES ($1, $2, $3, $4)',
      ['Aerowix Admin', email, hash, 'super_admin']
    );
    console.log(`✔ Seed admin created: ${email} (change the password after first login!)`);
  } else {
    console.log('✔ Admin already exists, skipping seed.');
  }

  process.exit(0);
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
