import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;
const tableName = process.env.SUPABASE_TABLE || 'items';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_ANON_KEY in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy' });
});

app.get('/api/items', async (req, res) => {
  try {
    const { data, error } = await supabase.from(tableName).select('*');
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to fetch items' });
  }
});

app.get('/api/items/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { data, error } = await supabase.from(tableName).select('*').eq('id', id).single();
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to fetch item' });
  }
});

app.post('/api/items', async (req, res) => {
  const payload = req.body;
  try {
    const { data, error } = await supabase.from(tableName).insert(payload).select();
    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to create item' });
  }
});

app.put('/api/items/:id', async (req, res) => {
  const { id } = req.params;
  const payload = req.body;
  try {
    const { data, error } = await supabase.from(tableName).update(payload).eq('id', id).select();
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to update item' });
  }
});

app.delete('/api/items/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { error } = await supabase.from(tableName).delete().eq('id', id);
    if (error) throw error;
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to delete item' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});