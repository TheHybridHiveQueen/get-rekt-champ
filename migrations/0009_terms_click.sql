alter table memes add column if not exists terms_version text not null default '';
alter table memes add column if not exists terms_accepted_at timestamptz;

create table if not exists mod_acceptances (
  id integer generated always as identity primary key,
  mod_id text not null,
  terms_version text not null,
  accepted_at timestamptz not null default now()
);
