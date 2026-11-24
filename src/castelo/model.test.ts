import { describe, expect, it } from "vitest";
import type { Ciclo, Deadline, Disciplina, RoadmapArea, Trilha } from "@/types";
import { abrePergaminho, buildCastelo, distribuir, legendaDoAlvo, paginaDoLocal } from "./model";

const trilhas: Trilha[] = [
  { id: "cloud", nome: "Cloud AWS", icon: "cloud", diaSemana: "segunda", horasSemana: 1, foco: "Serverless" },
  { id: "dados", nome: "Dados e SQL", icon: "database", diaSemana: "terça", horasSemana: 1, foco: "SQL" },
];

const ciclos: Ciclo[] = [
  { id: "ciclo-1", nome: "Ciclo 1", inicio: "2026-09-29", fim: "2026-12-31", foco: "", status: "atual" },
];

function meta(id: string, trilhaId: string | undefined, status: Deadline["status"]): Deadline {
  return {
    id,
    categoria: "x",
    titulo: `Meta ${id}`,
    descricao: "d",
    dataPrazo: "2026-12-31",
    prioridade: "Média",
    status,
    cicloId: "ciclo-1",
    trilhaId,
    visibilidade: "publica",
  };
}

const roadmap: RoadmapArea[] = [
  {
    id: "cloud",
    area: "Cloud AWS",
    icon: "cloud",
    techs: [
      { name: "AWS Lambda", status: "estudando" },
      { name: "IAM", status: "preciso-estudar" },
      { name: "SQL", status: "domino" },
    ],
  },
];

const disciplina: Disciplina = {
  id: "redes",
  nome: "Redes de Computadores",
  semestre: 8,
  fase: "cursando",
  trilhaId: "cloud",
  ementaResumo: "TCP/IP",
  ementaFonte: "generica",
  aplicacaoTrabalho: "Webhook",
  recursoTitulo: "Kurose",
  recursoUrl: null,
  entregavel: "Diagrama",
  dominio: "estudando",
  arquivada: false,
  visibilidade: "publica",
};

function castelo(metas: Deadline[]) {
  return buildCastelo({ trilhas, metas, roadmap, disciplinas: [disciplina], ciclos });
}

describe("buildCastelo", () => {
  it("cria uma ala por trilha, na ordem das trilhas", () => {
    expect(castelo([]).alas.map((a) => a.trilhaId)).toEqual(["cloud", "dados"]);
  });

  it("traduz o status da meta em estado de restauração", () => {
    const ala = castelo([
      meta("a", "cloud", "Planejado"),
      meta("b", "cloud", "Em progresso"),
      meta("c", "cloud", "Concluído"),
    ]).alas[0];
    expect(ala.metas.map((m) => m.estado)).toEqual(["ruina", "obra", "restaurado"]);
    expect(ala.metas[0].cicloNome).toBe("Ciclo 1");
  });

  it("põe cada meta só na ala da sua trilha e ignora meta sem trilha", () => {
    const { alas } = castelo([meta("a", "cloud", "Planejado"), meta("b", "dados", "Planejado"), meta("c", undefined, "Planejado")]);
    expect(alas[0].metas.map((m) => m.id)).toEqual(["a"]);
    expect(alas[1].metas.map((m) => m.id)).toEqual(["b"]);
  });

  it("calcula a fração concluída, que define a iluminação", () => {
    const ala = castelo([meta("a", "cloud", "Concluído"), meta("b", "cloud", "Planejado")]).alas[0];
    expect(ala.metasConcluidas).toBe(1);
    expect(ala.fracaoConcluida).toBe(0.5);
  });

  it("ala sem metas tem fração zero, não NaN", () => {
    expect(castelo([]).alas[0].fracaoConcluida).toBe(0);
  });

  it("traduz o domínio da tecnologia em estado do estandarte", () => {
    expect(castelo([]).alas[0].estandartes.map((e) => e.estado)).toEqual(["remendado", "rasgado", "inteiro"]);
  });

  it("trilha sem área no roadmap fica sem estandartes", () => {
    expect(castelo([]).alas[1].estandartes).toEqual([]);
  });

  it("leva as disciplinas da trilha para a estante", () => {
    const { alas } = castelo([]);
    expect(alas[0].tomos.map((t) => t.id)).toEqual(["redes"]);
    expect(alas[1].tomos).toEqual([]);
  });

  it("abre só as alas com sala pronta", () => {
    expect(castelo([]).alas.map((a) => a.aberta)).toEqual([true, false]);
  });

  it("expõe o ciclo atual", () => {
    expect(castelo([]).cicloAtual?.nome).toBe("Ciclo 1");
  });
});

describe("distribuir", () => {
  it("ocupa os slots na ordem e separa o que não coube", () => {
    expect(distribuir([1, 2, 3], 2)).toEqual({ colocados: [1, 2], excedentes: [3] });
  });

  it("aceita menos itens que slots", () => {
    expect(distribuir([1], 4)).toEqual({ colocados: [1], excedentes: [] });
  });
});

describe("alvos", () => {
  const { alas } = castelo([meta("a", "cloud", "Em progresso")]);

  it("porta de ala aberta troca de sala; porta fechada abre pergaminho", () => {
    expect(abrePergaminho({ tipo: "porta", ala: alas[0] })).toBe(false);
    expect(abrePergaminho({ tipo: "porta", ala: alas[1] })).toBe(true);
    expect(abrePergaminho({ tipo: "saida" })).toBe(false);
    expect(abrePergaminho({ tipo: "meta", meta: alas[0].metas[0] })).toBe(true);
  });

  it("a legenda traz o status por escrito, não só por cor", () => {
    expect(legendaDoAlvo({ tipo: "meta", meta: alas[0].metas[0] })).toBe("Meta: Meta a (Em progresso)");
    expect(legendaDoAlvo({ tipo: "estandarte", estandarte: alas[0].estandartes[1] })).toBe(
      "Tecnologia: IAM (Preciso estudar)",
    );
  });

  it("aponta a página tradicional equivalente ao local", () => {
    expect(paginaDoLocal({ sala: "salao" }).to).toBe("/");
    expect(paginaDoLocal({ sala: "ala", trilhaId: "cloud", nome: "Cloud AWS" }).to).toBe("/metas");
  });
});
