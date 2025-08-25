```Sql
-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.answers (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  question_id uuid NOT NULL,
  image_url text,
  is_correct boolean NOT NULL DEFAULT false,
  order_index integer NOT NULL CHECK (order_index >= 0),
  answer_text text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT answers_pkey PRIMARY KEY (id),
  CONSTRAINT answers_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.questions(id)
);
CREATE TABLE public.question_sets (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title character varying NOT NULL,
  description text,
  thumbnail_url text,
  is_public boolean DEFAULT false,
  difficulty_level character varying DEFAULT 'medium'::character varying CHECK (difficulty_level::text = ANY (ARRAY['easy'::character varying, 'medium'::character varying, 'hard'::character varying, 'expert'::character varying]::text[])),
  category character varying,
  total_questions integer DEFAULT 0 CHECK (total_questions >= 0),
  times_played integer DEFAULT 0 CHECK (times_played >= 0),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  status USER-DEFINED DEFAULT 'draft'::question_set_status_enum,
  tags ARRAY DEFAULT ARRAY[]::text[],
  completion_rate double precision DEFAULT 0.0,
  last_played_at timestamp with time zone,
  play_settings jsonb DEFAULT '{}'::jsonb,
  cloned_from uuid,
  CONSTRAINT question_sets_pkey PRIMARY KEY (id),
  CONSTRAINT question_sets_cloned_from_fkey FOREIGN KEY (cloned_from) REFERENCES public.question_sets(id),
  CONSTRAINT question_sets_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.questions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  question_set_id uuid NOT NULL,
  question_text text NOT NULL,
  question_type USER-DEFINED DEFAULT 'multiple_choice'::question_type_enum,
  image_url text,
  time_limit integer DEFAULT 30 CHECK (time_limit > 0),
  points integer DEFAULT 100 CHECK (points > 0),
  difficulty character varying DEFAULT 'medium'::character varying CHECK (difficulty::text = ANY (ARRAY['easy'::character varying, 'medium'::character varying, 'hard'::character varying, 'expert'::character varying]::text[])),
  order_index integer NOT NULL CHECK (order_index >= 0),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  explanation_title text,
  explanation_text text,
  explanation_image_url text,
  CONSTRAINT questions_pkey PRIMARY KEY (id),
  CONSTRAINT questions_question_set_id_fkey FOREIGN KEY (question_set_id) REFERENCES public.question_sets(id)
);
```
