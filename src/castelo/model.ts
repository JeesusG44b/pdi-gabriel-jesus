import type { Ciclo, Deadline, Disciplina, Fase, GoalStatus, RoadmapArea, Status, Trilha } from "@/types";

// Modelo do castelo (SPEC 9.3): traduz os dados do PDI em lugares e objetos.
// Funções puras, sem Phaser: rodam no loader da rota (servidor) e nos testes.

export type EstadoMeta = "ruina" | "obra" | "restaurado";
export type EstadoEstandarte = "rasgado" | "remendado" | "inteiro";

// Alas com sala pronta. As demais aparecem como porta fechada no salão (SPEC 9.5, fase C4).
export const ALAS_ABERTAS: readonly string[] = ["cloud"];

export const ESTADO_DA_META: Record<GoalStatus, EstadoMeta> = {
  Planejado: "ruina",
  "Em progresso": "obra",
  Concluído: "restaurado",
};

export const ESTADO_DO_ESTANDARTE: Record<Status, EstadoEstandarte> = {
  "preciso-estudar": "rasgado",
  estudando: "remendado",
  domino: "inteiro",
};

export const ROTULO_DOMINIO: Record<Status, string> = {
  "preciso-estudar": "Preciso estudar",
  estudando: "Estudando",
  domino: "Domino",
};

export const ROTULO_FASE: Record<Fase, string> = {
  cursada: "Cursada",
  cursando: "Cursando",
  futura: "Futura",
};

export interface MetaCastelo {
  id: string;
  titulo: string;
  descricao: string;
  prazo: string; // YYYY-MM-DD
  prioridade: Deadline["prioridade"];
  status: GoalStatus;
  progresso?: number;
  cicloNome?: string;
  trilhaNome: string;
  estado: EstadoMeta;
}

export interface EstandarteCastelo {
  nome: string;
  status: Status;
  estado: EstadoEstandarte;
  trilhaNome: string;
}

export interface TomoCastelo {
  id: string;
  nome: string;
  semestre: number;
  fase: Fase;
  dominio: Status;
  ementa: string;
  aplicacao: string;
  recursoTitulo: string;
  recursoUrl: string | null;
  entregavel: string;
}

export interface AlaCastelo {
  trilhaId: string;
  nome: string;
  foco: string;
  diaSemana: string;
  horasSemana: number;
  aberta: boolean;
  metas: MetaCastelo[];
  estandartes: EstandarteCastelo[];
  tomos: TomoCastelo[];
  metasConcluidas: number;
  /** 0 a 1. Sem metas, vale 0. Define a iluminação da ala. */
  fracaoConcluida: number;
}

export interface CasteloData {
  alas: AlaCastelo[];
  cicloAtual?: { nome: string; inicio: string; fim: string };
}

export interface FontesDoCastelo {
  trilhas: Trilha[];
  metas: Deadline[];
  roadmap: RoadmapArea[];
  disciplinas: Disciplina[];
  ciclos: Ciclo[];
}

export function buildCastelo(fontes: FontesDoCastelo): CasteloData {
  const cicloPorId = new Map(fontes.ciclos.map((c) => [c.id, c]));
  const areaPorId = new Map(fontes.roadmap.map((a) => [a.id, a]));

  const alas = fontes.trilhas.map((trilha): AlaCastelo => {
    const metas = fontes.metas
      .filter((m) => m.trilhaId === trilha.id)
      .map(
        (m): MetaCastelo => ({
          id: m.id,
          titulo: m.titulo,
          descricao: m.descricao,
          prazo: m.dataPrazo,
          prioridade: m.prioridade,
          status: m.status,
          progresso: m.progresso,
          cicloNome: m.cicloId ? cicloPorId.get(m.cicloId)?.nome : undefined,
          trilhaNome: trilha.nome,
          estado: ESTADO_DA_META[m.status] ?? "ruina",
        }),
      );

    // A área do roadmap e a trilha compartilham o id (ex.: "cloud").
    const estandartes = (areaPorId.get(trilha.id)?.techs ?? []).map(
      (t): EstandarteCastelo => ({
        nome: t.name,
        status: t.status,
        estado: ESTADO_DO_ESTANDARTE[t.status] ?? "rasgado",
        trilhaNome: trilha.nome,
      }),
    );

    const tomos = fontes.disciplinas
      .filter((d) => d.trilhaId === trilha.id)
      .map(
        (d): TomoCastelo => ({
          id: d.id,
          nome: d.nome,
          semestre: d.semestre,
          fase: d.fase,
          dominio: d.dominio,
          ementa: d.ementaResumo,
          aplicacao: d.aplicacaoTrabalho,
          recursoTitulo: d.recursoTitulo,
          recursoUrl: d.recursoUrl,
          entregavel: d.entregavel,
        }),
      );

    const metasConcluidas = metas.filter((m) => m.estado === "restaurado").length;
    return {
      trilhaId: trilha.id,
      nome: trilha.nome,
      foco: trilha.foco,
      diaSemana: trilha.diaSemana,
      horasSemana: trilha.horasSemana,
      aberta: ALAS_ABERTAS.includes(trilha.id),
      metas,
      estandartes,
      tomos,
      metasConcluidas,
      fracaoConcluida: metas.length === 0 ? 0 : metasConcluidas / metas.length,
    };
  });

  const atual = fontes.ciclos.find((c) => c.status === "atual");
  return {
    alas,
    cicloAtual: atual ? { nome: atual.nome, inicio: atual.inicio, fim: atual.fim } : undefined,
  };
}

/**
 * SPEC 9.4, regra 4: a sala tem um número fixo de posições (slots) e os dados ocupam
 * as primeiras. O que não couber fica fora da cena e aparece só nos painéis de lista.
 */
export function distribuir<T>(itens: T[], slots: number): { colocados: T[]; excedentes: T[] } {
  const n = Math.max(0, slots);
  return { colocados: itens.slice(0, n), excedentes: itens.slice(n) };
}

// O que o personagem pode acionar. A cena emite, o React mostra a legenda e o pergaminho.
export type Alvo =
  | { tipo: "meta"; meta: MetaCastelo }
  | { tipo: "estandarte"; estandarte: EstandarteCastelo }
  | { tipo: "estante"; ala: AlaCastelo }
  | { tipo: "porta"; ala: AlaCastelo }
  | { tipo: "sobre" }
  | { tipo: "saida" };

/** Abre pergaminho (true) ou troca de sala (false). */
export function abrePergaminho(alvo: Alvo): boolean {
  if (alvo.tipo === "saida") return false;
  if (alvo.tipo === "porta") return !alvo.ala.aberta;
  return true;
}

/** Texto curto mostrado sob o jogo quando o personagem está perto de um alvo. */
export function legendaDoAlvo(alvo: Alvo): string {
  switch (alvo.tipo) {
    case "meta":
      return `Meta: ${alvo.meta.titulo} (${alvo.meta.status})`;
    case "estandarte":
      return `Tecnologia: ${alvo.estandarte.nome} (${ROTULO_DOMINIO[alvo.estandarte.status]})`;
    case "estante":
      return `Estante: ${alvo.ala.tomos.length} disciplinas de ${alvo.ala.nome}`;
    case "porta":
      return alvo.ala.aberta
        ? `Porta: ala ${alvo.ala.nome}`
        : `Porta fechada: ala ${alvo.ala.nome}, em obras`;
    case "sobre":
      return "Altar: sobre este PDI";
    case "saida":
      return "Porta: voltar ao salão";
  }
}

export type LocalCastelo = { sala: "salao" } | { sala: "ala"; trilhaId: string; nome: string };

/** Rota tradicional equivalente ao lugar onde o personagem está (SPEC 9.2). */
export function paginaDoLocal(local: LocalCastelo): { to: "/" | "/metas"; label: string } {
  return local.sala === "salao" ? { to: "/", label: "Sobre" } : { to: "/metas", label: "Metas" };
}
