import { pool } from '../config/db';
import { asyncHandler } from '../utils/asyncHandler';
import { contactSchema, projectRequestSchema } from '../validators/schemas';
import { notifyNewInquiry } from '../services/mailer';

// Contact form (general inquiries)
export const submitContactMessage = asyncHandler(async (req, res) => {
  const parsed = contactSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.errors[0].message });
  const d = parsed.data;
  const result = await pool.query(
    `INSERT INTO contact_messages (name, email, phone, company, service, budget, message)
     VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
    [d.name, d.email, d.phone || null, d.company || null, d.service || null, d.budget || null, d.message]
  );
  notifyNewInquiry(
    `New contact message from ${d.name}`,
    `<p><b>Name:</b> ${d.name}</p><p><b>Email:</b> ${d.email}</p><p><b>Message:</b> ${d.message}</p>`
  );
  res.status(201).json({ success: true, message: result.rows[0] });
});

export const listAdminContactMessages = asyncHandler(async (req, res) => {
  const result = await pool.query(`SELECT * FROM contact_messages ORDER BY created_at DESC`);
  res.json({ messages: result.rows });
});

export const updateContactStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const result = await pool.query(
    `UPDATE contact_messages SET status = $1 WHERE id = $2 RETURNING *`,
    [status, req.params.id]
  );
  res.json({ message: result.rows[0] });
});

export const deleteContactMessage = asyncHandler(async (req, res) => {
  await pool.query(`DELETE FROM contact_messages WHERE id = $1`, [req.params.id]);
  res.json({ success: true });
});

// Project / "Start a Project" requests
export const submitProjectRequest = asyncHandler(async (req, res) => {
  const parsed = projectRequestSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.errors[0].message });
  const d = parsed.data;
  const result = await pool.query(
    `INSERT INTO project_requests (name, email, phone, company, service, project_type, budget, deadline, description)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
    [d.name, d.email, d.phone || null, d.company || null, d.service || null, d.project_type || null,
     d.budget || null, d.deadline || null, d.description]
  );
  notifyNewInquiry(
    `New project request from ${d.name}`,
    `<p><b>Name:</b> ${d.name}</p><p><b>Email:</b> ${d.email}</p><p><b>Service:</b> ${d.service || 'N/A'}</p><p><b>Description:</b> ${d.description}</p>`
  );
  res.status(201).json({ success: true, request: result.rows[0] });
});

export const listAdminProjectRequests = asyncHandler(async (req, res) => {
  const result = await pool.query(`SELECT * FROM project_requests ORDER BY created_at DESC`);
  res.json({ requests: result.rows });
});

export const updateProjectRequestStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const result = await pool.query(
    `UPDATE project_requests SET status = $1 WHERE id = $2 RETURNING *`,
    [status, req.params.id]
  );
  res.json({ request: result.rows[0] });
});

export const deleteProjectRequest = asyncHandler(async (req, res) => {
  await pool.query(`DELETE FROM project_requests WHERE id = $1`, [req.params.id]);
  res.json({ success: true });
});
