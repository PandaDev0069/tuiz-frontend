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

  -- Add more fields later

```
