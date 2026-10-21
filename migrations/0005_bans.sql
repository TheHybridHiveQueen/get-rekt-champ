alter table memes add column if not exists submitter_token text not null default '';
alter table memes add column if not exists submitter_net text not null default '';
alter table memes add column if not exists accepted_terms boolean not null default false;

create table if not exists blocked_gifs (
  gif_key text primary key,
  reason text not null,
  created_at timestamptz not null default now()
);

create table if not exists upload_bans (
  bucket text primary key,
  reason text not null,
  created_at timestamptz not null default now()
);
