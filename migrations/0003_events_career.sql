-- Tabelas para conteúdo editável de Eventos e Objetivo de Carreira
CREATE TABLE events (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  date TEXT NOT NULL,
  location TEXT NOT NULL,
  type TEXT NOT NULL,
  image TEXT NOT NULL DEFAULT '',
  highlights TEXT NOT NULL DEFAULT '[]', -- JSON string[]
  link TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE career_steps (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  focus TEXT NOT NULL,
  is_current INTEGER NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE career_goals (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);
