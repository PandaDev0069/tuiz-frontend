<h1 style="text-align: center; text-decoration: underline; color: blue"> Database Schema Design for quiz game flow </h1>

This database is going to consist all the basic requirements for the game and some analytics too

## Player

This table will keep track of the players, their device id, game id, player name, is logged in, is host etc. When a user hopps into the website, their device id will be fetched via browser, stored in local storage and will be made persistent for future visits. Reconnection of websocket will be done via this device id. This is a separate table from auth users, as we don't want to force users to login/signup to play the game. They can play as guest too.
This table will not interact with auth users table, but will check if the user is logged in or not (if logged in then we can fetch their user id from auth users table via api). (Needs more thinking...)

```sql
create table public.players (
  id uuid not null default gen_random_uuid (),
  device_id character varying(100) null,
  game_id uuid not null,
  player_name character varying(100) not null,
  is_logged_in boolean not null default false,
  is_host boolean not null default false,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
) TABLESPACE pg_default;

```

## Game

This table will keep track of the game details, like game code, current players, status etc.

enums for game status: waiting, active, paused, finished

```sql
create table public.games (
  id uuid not null default gen_random_uuid (),
  quiz_set_id uuid not null,
  game_code character varying(10) not null, -- Fetch from quiz-set game settings json field
  current_players integer null default 0,
  status character varying(20) null default 'waiting'::character varying,
  current_question_index integer null default 0,
  current_question_start_time timestamp with time zone null, (Think later about this if needed)
  game_settings jsonb null default '{}'::jsonb,
  locked boolean null default false, -- if game is locked, no new players can join
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  started_at timestamp with time zone null,
  paused_at timestamp with time zone null, -- when game is paused
  resumed_at timestamp with time zone null, -- when game is resumed from pause
  ended_at timestamp with time zone null,
) TABLESPACE pg_default;
```

## Game flow

This table will keep track of the game flow, like current question, time etc.

```sql
create table public.game_flows (
  id uuid not null default gen_random_uuid (),
  game_id uuid not null,
  quiz_set_id uuid not null,
  total_questions integer not null default 0,
  current_question_id uuid null,
  next_question_id uuid null,
  current_question_index integer null default 0,
  current_question_start_time timestamp with time zone null,
  current_question_end_time timestamp with time zone null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
) TABLESPACE pg_default;

```

## Player_data

This table will keep track of scores , leaderboard , etc..

```sql
create table public.game_player_data (
  id uuid not null default gen_random_uuid (),
  player_id uuid not null,
  player_device_id character varying(100) not null, -- fetch from players table
  game_id uuid not null,
  score integer not null default 0, -- Calculate rank from the score
  answer_report jsonb null default '{}'::jsonb, --(will contain the report for each question and answers serving as analytics for each player and can be used in analytics of dashboard
 -- {
 -- "q1": { "answer": "B", "is_correct": true, "time_taken": 4200 },
 -- "q2": { "answer": "A", "is_correct": false, "time_taken": 7000 }
 -- })
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
) TABLESPACE pg_default;
```

# Finalized version

```sql
-- players: lightweight identity per-session (guest friendly)
create table public.players (
  id uuid not null default gen_random_uuid(),
  device_id varchar(100),
  game_id uuid not null,
  player_name varchar(100) not null,
  is_logged_in boolean not null default false,
  is_host boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (id)
);

create index idx_players_game_id on public.players (game_id);
create index idx_players_device_id on public.players (device_id);

-- games: session lifecycle & settings only (no heavy counters)
create table public.games (
  id uuid not null default gen_random_uuid(),
  quiz_set_id uuid not null,
  game_code varchar(10) not null,
  current_players integer default 0,
  status enum('waiting', 'active', 'paused', 'finished') default 'waiting',
  current_question_index integer default 0,
  current_question_start_time timestamptz,
  game_settings jsonb default '{}'::jsonb,
  locked boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  started_at timestamptz,
  paused_at timestamptz,
  resumed_at timestamptz,
  ended_at timestamptz,
  primary key (id)
);

-- add uniqueness for quick lookups (optional)
create unique index uq_games_game_code on public.games (game_code);

-- game_flows: pointer to per-game state (minimal)
create table public.game_flows (
  id uuid not null default gen_random_uuid(),
  game_id uuid not null,
  quiz_set_id uuid not null,
  total_questions integer not null default 0,
  current_question_id uuid,
  next_question_id uuid,
  current_question_index integer default 0,
  current_question_start_time timestamptz,
  current_question_end_time timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (id)
);

create index idx_game_flows_game_id on public.game_flows (game_id);

-- game_player_data: per-player per-game final/ongoing stats (score + json report)
create table public.game_player_data (
  id uuid not null default gen_random_uuid(),
  player_id uuid not null,
  player_device_id varchar(100) not null,
  game_id uuid not null,
  score integer not null default 0,
  answer_report jsonb default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (id)
);

-- indexes for leaderboard queries
create index idx_gpd_game_score on public.game_player_data (game_id, score desc);
create index idx_gpd_player_game on public.game_player_data (player_id, game_id);

-- Optional foreign keys (enable if you want referential integrity)
alter table public.players
  add constraint fk_players_games foreign key (game_id) references public.games(id) on delete cascade;

alter table public.game_player_data
  add constraint fk_gpd_players foreign key (player_id) references public.players(id) on delete cascade;

alter table public.game_player_data
  add constraint fk_gpd_games foreign key (game_id) references public.games(id) on delete cascade;

```
