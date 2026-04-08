import { supabase, tableName } from './_supabase.js';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { data, error } = await supabase.from(tableName).select('*');
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  if (req.method === 'POST') {
    const payload = req.body;
    const { data, error } = await supabase.from(tableName).insert(payload).select();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json(data);
  }

  res.setHeader('Allow', ['GET', 'POST']);
  res.status(405).json({ error: `Method ${req.method} not allowed` });
}
