-- ReliefConnect Database Schema
-- Run this in your Supabase SQL Editor

-- Drives table
CREATE TABLE IF NOT EXISTS drives (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  location TEXT,
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Donations table
CREATE TABLE IF NOT EXISTS donations (
  id SERIAL PRIMARY KEY,
  drive_id INTEGER REFERENCES drives(id),
  donor_name TEXT NOT NULL,
  donor_email TEXT,
  item_type TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Requests table
CREATE TABLE IF NOT EXISTS requests (
  id SERIAL PRIMARY KEY,
  recipient_name TEXT NOT NULL,
  recipient_email TEXT,
  item_type TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  urgency TEXT DEFAULT 'medium',
  location TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Logistics tasks table
CREATE TABLE IF NOT EXISTS logistics_tasks (
  id SERIAL PRIMARY KEY,
  drive_id INTEGER REFERENCES drives(id),
  task_type TEXT NOT NULL,
  description TEXT,
  assigned_to TEXT,
  status TEXT DEFAULT 'pending',
  priority TEXT DEFAULT 'medium',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Enable Row Level Security (optional, for security)
ALTER TABLE drives ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE logistics_tasks ENABLE ROW LEVEL SECURITY;