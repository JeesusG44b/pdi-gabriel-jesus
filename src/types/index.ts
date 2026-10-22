export type Status = "domino" | "estudando" | "preciso-estudar";

export interface Profile {
  name: string;
  title: string;
  subtitle: string;
  company: string;
  area: string;
  course: string;
  graduationDate: string; // ISO (YYYY-MM-DD)
  graduationDateConfirmed: boolean; // false = data prevista
  github: string;
  linkedin: string;
  lastUpdate: string;
  bio: string;
  profileImage?: string; // URL da foto de perfil; vazio = avatar com iniciais
}

export interface CareerStep {
  id: string;
  title: string;
  focus: string;
  current?: boolean;
}

export interface Goal {
  id: string;
  title: string;
}

export type GoalPriority = "Alta" | "Média" | "Baixa";
export type GoalStatus = "Planejado" | "Em progresso" | "Concluído";
// Texto livre: as categorias vêm dos seeds (ex.: nome de trilha).
export type GoalCategory = string;

export type Visibilidade = "publica" | "admin";

export interface Deadline {
  id: string;
  categoria: GoalCategory;
  titulo: string;
  descricao: string;
  dataPrazo: string; // ISO format (YYYY-MM-DD)
  prioridade: GoalPriority;
  status: GoalStatus;
  icon?: string; // lucide icon name
  progresso?: number; // Manual progress (0-100), se não informado usa cálculo automático
  cicloId?: string; // ciclos.id
  trilhaId?: string; // trilhas.id
  visibilidade: Visibilidade; // o servidor sempre devolve; objetos novos no client usam 'publica'
}

// Texto livre: as categorias vêm dos seeds.
export type ContributionCategory = string;

export interface Contribution {
  id: string;
  icon: string; // lucide icon name
  title: string;
  category: ContributionCategory;
  description: string;
  technologies: string[];
  impacts: string[];
  status: "Em andamento" | "Concluído" | "Planejado";
}

export interface Tech {
  name: string;
  status: Status;
}
export interface RoadmapArea {
  id: string;
  area: string;
  icon: string;
  techs: Tech[];
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string; // ISO ou "mês ano"
  location: string;
  type: "Conferência" | "Workshop" | "Hackathon" | "Meetup" | "Curso" | "Palestra" | "Summit";
  image: string; // URL ou caminho da imagem
  highlights?: string[];
  link?: string;
}

export type Fase = "cursada" | "cursando" | "futura";

export interface Trilha {
  id: string; // cloud | dados | automacao | ia | ingles
  nome: string;
  icon: string; // lucide icon name
  diaSemana: string; // segunda..sexta
  horasSemana: number;
  foco: string;
}

export interface Ciclo {
  id: string; // ciclo-1, ciclo-2
  nome: string;
  inicio: string; // YYYY-MM-DD
  fim: string; // YYYY-MM-DD
  foco: string;
  status: "planejado" | "atual" | "concluido";
}

export interface Disciplina {
  id: string;
  nome: string;
  semestre: number;
  fase: Fase;
  trilhaId: string | null;
  ementaResumo: string;
  ementaFonte: "generica" | "plano-de-ensino";
  aplicacaoTrabalho: string;
  recursoTitulo: string;
  recursoUrl: string | null;
  entregavel: string;
  dominio: Status;
  arquivada: boolean;
  visibilidade: Visibilidade;
  // Só vêm na resposta para admin. Visitante não recebe essas chaves.
  motivoArquivamento?: string;
  notaAdmin?: string;
}

export interface SoftSkill {
  id: string;
  icon: string;
  title: string;
  description: string;
  status: "Já pratico" | "Em desenvolvimento";
}
