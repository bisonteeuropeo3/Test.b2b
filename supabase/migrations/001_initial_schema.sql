-- Create onboardings table
create table if not exists public.onboardings (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  status text default 'pending' check (status in ('pending', 'active', 'completed')),
  progress integer default 0 check (progress >= 0 and progress <= 100),
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Create checklist_items table
create table if not exists public.checklist_items (
  id uuid default gen_random_uuid() primary key,
  onboarding_id uuid references public.onboardings(id) on delete cascade,
  title text not null,
  completed boolean default false,
  order_index integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable RLS
alter table public.onboardings enable row level security;
alter table public.checklist_items enable row level security;

-- Create policies
create policy "Enable read access for all users" on public.onboardings
  for select using (true);

create policy "Enable insert access for authenticated users" on public.onboardings
  for insert with check (auth.role() = 'authenticated');

create policy "Enable read access for all users" on public.checklist_items
  for select using (true);
