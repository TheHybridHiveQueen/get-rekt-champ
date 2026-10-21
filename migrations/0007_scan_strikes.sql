create table if not exists scan_strikes (
  bucket text primary key,
  hits integer not null,
  updated_at timestamptz not null default now()
);

create table if not exists blocked_hashes (
  sha256 text primary key,
  reason text not null,
  created_at timestamptz not null default now()
);
