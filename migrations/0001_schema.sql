-- Tabelas do conteúdo editável do PDI
CREATE TABLE goals (
  id TEXT PRIMARY KEY,
  categoria TEXT NOT NULL,
  titulo TEXT NOT NULL,
  descricao TEXT NOT NULL DEFAULT '',
  data_prazo TEXT NOT NULL, -- ISO YYYY-MM-DD
  prioridade TEXT NOT NULL,
  status TEXT NOT NULL,
  icon TEXT,
  progresso INTEGER, -- NULL = cálculo automático no client
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE contributions (
  id TEXT PRIMARY KEY,
  icon TEXT NOT NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  technologies TEXT NOT NULL DEFAULT '[]', -- JSON string[]
  impacts TEXT NOT NULL DEFAULT '[]', -- JSON string[]
  status TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE roadmap_areas (
  id TEXT PRIMARY KEY,
  area TEXT NOT NULL,
  icon TEXT NOT NULL,
  techs TEXT NOT NULL DEFAULT '[]', -- JSON [{name, status}]
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE soft_skills (
  id TEXT PRIMARY KEY,
  icon TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL, -- "Já pratico" | "Em desenvolvimento"
  sort_order INTEGER NOT NULL DEFAULT 0
);
