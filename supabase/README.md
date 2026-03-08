# Supabase Configuration

## Setup Database

1. Crea un progetto su [Supabase](https://supabase.com)
2. Copia l'URL e la anon key in `.env.local`
3. Esegui le migration SQL in `supabase/migrations/`

## Schema Database

### Tabella: onboardings
```sql
create table onboardings (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  status text default 'pending',
  progress integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);
```

### Tabella: checklist_items
```sql
create table checklist_items (
  id uuid default gen_random_uuid() primary key,
  onboarding_id uuid references onboardings(id) on delete cascade,
  title text not null,
  completed boolean default false,
  order_index integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now())
);
```

### Auth
Abilita Email/Password auth nelle impostazioni Supabase.
