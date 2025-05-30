-- Enable RLS (Row Level Security)
alter table if exists public.users enable row level security;
alter table if exists public.checklist_answers enable row level security;
alter table if exists public.admin_users enable row level security;

-- Create users table
create table if not exists public.users (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  email text not null unique,
  whatsapp text not null,
  location jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create checklist_answers table
create table if not exists public.checklist_answers (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  answers jsonb not null default '{}',
  completed_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create admin_users table for admin authentication
create table if not exists public.admin_users (
  id uuid default gen_random_uuid() primary key,
  email text not null unique,
  name text not null,
  role text not null default 'admin',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create indexes for better performance
create index if not exists users_email_idx on public.users(email);
create index if not exists users_whatsapp_idx on public.users(whatsapp);
create index if not exists checklist_answers_user_id_idx on public.checklist_answers(user_id);
create index if not exists admin_users_email_idx on public.admin_users(email);

-- Create updated_at trigger function
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Create triggers for updated_at
create trigger handle_users_updated_at
  before update on public.users
  for each row execute procedure public.handle_updated_at();

create trigger handle_checklist_answers_updated_at
  before update on public.checklist_answers
  for each row execute procedure public.handle_updated_at();

create trigger handle_admin_users_updated_at
  before update on public.admin_users
  for each row execute procedure public.handle_updated_at();

-- RLS Policies

-- Users table policies (public read/write for the app)
create policy "Users are publicly readable" on public.users
  for select using (true);

create policy "Users can be inserted publicly" on public.users
  for insert with check (true);

create policy "Users can be updated publicly" on public.users
  for update using (true);

-- Checklist answers policies
create policy "Checklist answers are publicly readable" on public.checklist_answers
  for select using (true);

create policy "Checklist answers can be inserted publicly" on public.checklist_answers
  for insert with check (true);

create policy "Checklist answers can be updated publicly" on public.checklist_answers
  for update using (true);

-- Admin users policies (only authenticated admins can access)
create policy "Admin users are readable by authenticated admins" on public.admin_users
  for select using (auth.role() = 'authenticated');

create policy "Admin users can be inserted by authenticated admins" on public.admin_users
  for insert with check (auth.role() = 'authenticated');

-- Insert default admin user (you'll need to create this user in Supabase Auth)
-- This will be linked to the auth.users table
insert into public.admin_users (email, name, role) 
values ('admin@climbergoat.com', 'Admin Climber Goat', 'super_admin')
on conflict (email) do nothing;
