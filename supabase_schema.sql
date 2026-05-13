create table if not exists clients (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default now(),
  full_name text not null,
  email text,
  sex text,
  age integer,
  height_cm numeric,
  goal text,
  status text default 'Attivo'
);

create table if not exists body_measurements (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id) on delete cascade,
  measured_at date not null,
  weight_kg numeric,
  abdomen_cm numeric,
  bf_percent numeric,
  lean_mass_kg numeric,
  fat_mass_kg numeric,
  skinfold_sum_mm numeric,
  density numeric
);

create table if not exists training_plans (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id) on delete cascade,
  created_at timestamp with time zone default now(),
  title text,
  duration text,
  goal text,
  workout_count integer default 3
);

create table if not exists training_exercises (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid references training_plans(id) on delete cascade,
  workout_label text,
  exercise_name text,
  fixed_series_reps text,
  rest_time text,
  execution_mode text,
  superset_code text,
  week_1 text,
  week_2 text,
  week_3 text,
  week_4 text,
  sort_order integer
);
