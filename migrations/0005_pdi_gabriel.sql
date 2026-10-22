-- Modelo do PDI: trilhas de estudo, ciclos trimestrais e disciplinas da graduação.
-- Campos novos em goals: ciclo, trilha e visibilidade (público ou admin).
CREATE TABLE trilhas (
  id TEXT PRIMARY KEY,                 -- cloud | dados | automacao | ia | ingles
  nome TEXT NOT NULL,
  icon TEXT NOT NULL,                  -- nome de ícone lucide
  dia_semana TEXT NOT NULL,            -- segunda..sexta
  horas_semana REAL NOT NULL,
  foco TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE ciclos (
  id TEXT PRIMARY KEY,                 -- ciclo-1, ciclo-2
  nome TEXT NOT NULL,
  inicio TEXT NOT NULL,                -- YYYY-MM-DD
  fim TEXT NOT NULL,                   -- YYYY-MM-DD
  foco TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL CHECK (status IN ('planejado','atual','concluido')),
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE disciplinas (
  id TEXT PRIMARY KEY,
  nome TEXT NOT NULL,
  semestre INTEGER NOT NULL CHECK (semestre BETWEEN 1 AND 10),
  fase TEXT NOT NULL CHECK (fase IN ('cursada','cursando','futura')),
  trilha_id TEXT REFERENCES trilhas(id),   -- NULL quando arquivada sem trilha
  ementa_resumo TEXT NOT NULL DEFAULT '',
  ementa_fonte TEXT NOT NULL DEFAULT 'generica', -- generica | plano-de-ensino
  aplicacao_trabalho TEXT NOT NULL DEFAULT '',
  recurso_titulo TEXT NOT NULL DEFAULT '',
  recurso_url TEXT,
  entregavel TEXT NOT NULL DEFAULT '',
  dominio TEXT NOT NULL CHECK (dominio IN ('domino','estudando','preciso-estudar')),
  arquivada INTEGER NOT NULL DEFAULT 0 CHECK (arquivada IN (0,1)),
  motivo_arquivamento TEXT,
  visibilidade TEXT NOT NULL DEFAULT 'publica' CHECK (visibilidade IN ('publica','admin')),
  nota_admin TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  CHECK (arquivada = 0 OR (motivo_arquivamento IS NOT NULL AND length(trim(motivo_arquivamento)) >= 3))
);

CREATE INDEX idx_disciplinas_publico ON disciplinas (arquivada, visibilidade, trilha_id);

ALTER TABLE goals ADD COLUMN ciclo_id TEXT;
ALTER TABLE goals ADD COLUMN trilha_id TEXT;
ALTER TABLE goals ADD COLUMN visibilidade TEXT NOT NULL DEFAULT 'publica';
