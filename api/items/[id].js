import { supabase, tableName } from '../_supabase.js';

export default async function handler(req, res) {
  const { id } = req.query;
  if (!id) return res.status(400).json({ error: 'Missing id parameter' });

  if (req.method === 'GET') {
    const { data, error } = await supabase.from(tableName).select('*').eq('id', id).single();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  if (req.method === 'PUT') {
    const payload = req.body;
    const { data, error } = await supabase.from(tableName).update(payload).eq('id', id).select();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  if (req.method === 'DELETE') {
    const { error } = await supabase.from(tableName).delete().eq('id', id);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(204).send('');
  }

  res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
  res.status(405).json({ error: `Method ${req.method} not allowed` });
}
