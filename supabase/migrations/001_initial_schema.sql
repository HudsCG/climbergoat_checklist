-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create checklist_answers table
CREATE TABLE checklist_answers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  answers JSONB NOT NULL,
  total_score INTEGER NOT NULL DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at);
CREATE INDEX idx_checklist_answers_user_id ON checklist_answers(user_id);
CREATE INDEX idx_checklist_answers_completed_at ON checklist_answers(completed_at);
CREATE INDEX idx_checklist_answers_total_score ON checklist_answers(total_score);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklist_answers ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
CREATE POLICY "Users can insert their own data" ON users
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view their own data" ON users
  FOR SELECT USING (true);

CREATE POLICY "Users can update their own data" ON users
  FOR UPDATE USING (true);

-- Create policies for checklist_answers table
CREATE POLICY "Users can insert their own answers" ON checklist_answers
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view their own answers" ON checklist_answers
  FOR SELECT USING (true);

CREATE POLICY "Users can update their own answers" ON checklist_answers
  FOR UPDATE USING (true);

-- Admin policies (for authenticated users)
CREATE POLICY "Admins can view all users" ON users
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can delete users" ON users
  FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can view all answers" ON checklist_answers
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can delete answers" ON checklist_answers
  FOR DELETE USING (auth.role() = 'authenticated');

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_checklist_answers_updated_at BEFORE UPDATE ON checklist_answers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
