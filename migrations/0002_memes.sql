create table if not exists memes (
  id serial primary key,
  seed_key text unique,
  champ_slug text not null,
  format text not null check (format in ('impact', 'quote', 'score')),
  line_a text not null,
  line_b text not null default '',
  alias_a text not null,
  alias_b text not null,
  rekt integer not null default 0 check (rekt >= 0),
  defend integer not null default 0 check (defend >= 0),
  crown integer not null default 0 check (crown >= 0),
  created_at timestamptz not null default now()
);

create unique index if not exists memes_combo_idx
  on memes (champ_slug, format, line_a, line_b);

create index if not exists memes_created_idx on memes (created_at desc);
create index if not exists memes_champ_idx on memes (champ_slug);

create table if not exists votes (
  meme_id integer not null references memes (id) on delete cascade,
  token text not null,
  kind text not null check (kind in ('rekt', 'defend', 'crown')),
  primary key (meme_id, token)
);
