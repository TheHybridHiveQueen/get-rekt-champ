alter table memes add column if not exists gif_url text not null default '';

alter table memes drop constraint if exists memes_gif_url_len;
alter table memes add constraint memes_gif_url_len check (char_length(gif_url) <= 400);

drop index if exists memes_combo_idx;
create unique index if not exists memes_combo_idx
  on memes (champ_slug, format, line_a, line_b, gif_url);
