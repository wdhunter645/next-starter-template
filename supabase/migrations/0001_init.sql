-- Tables
create table if not exists weekly_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  excerpt text,
  content text,
  published_at timestamptz default now()
);

create table if not exists milestones (
  id uuid primary key default gen_random_uuid(),
  year int not null check (year > 1800 and year < 3000),
  title text not null,
  description text
);

create table if not exists charities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  url text,
  blurb text
);

-- RLS
alter table weekly_posts enable row level security;
alter table milestones  enable row level security;
alter table charities   enable row level security;

-- Public READ policy (anon key)
create policy if not exists "weekly_posts_read_public"
  on weekly_posts for select using (true);

create policy if not exists "milestones_read_public"
  on milestones for select using (true);

create policy if not exists "charities_read_public"
  on charities for select using (true);

-- No insert/update/delete policies for anon — writes are disabled by default.
