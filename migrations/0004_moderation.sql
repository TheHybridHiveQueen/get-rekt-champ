alter table memes add column if not exists status text not null default 'live';

alter table memes drop constraint if exists memes_status_check;
alter table memes add constraint memes_status_check check (status in ('live', 'pending', 'hidden'));

create index if not exists memes_status_idx on memes (status);

create table if not exists reports (
  id integer generated always as identity primary key,
  meme_id integer not null references memes (id) on delete cascade,
  token text not null,
  reason text not null check (reason in ('minor', 'explicit', 'private', 'harassment', 'copyright')),
  created_at timestamptz not null default now(),
  unique (meme_id, token)
);

create table if not exists rate_hits (
  bucket text primary key,
  hits integer not null,
  window_start timestamptz not null
);
