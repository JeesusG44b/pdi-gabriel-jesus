import type { AlaCastelo, Alvo, EstadoMeta } from "./model";
import { distribuir } from "./model";
import { buildAndaime, buildEntulho, buildEstandarte, buildEstante, ESTANTE_H } from "./pixels";
import { Sala, VIEW_H, VIEW_W } from "./Sala";

// Peça usada para cada meta, em rodízio, com a altura do marcador "E".
const PECAS = [
  { key: "janela", altura: 150 },
  { key: "gargula", altura: 96 },
  { key: "coluna", altura: 150 },
  { key: "altar", altura: 124 },
] as const;

// Quanto a peça escurece em cada estado (SPEC 9.3). Restaurada fica na cor original.
const TINTA: Record<EstadoMeta, number | null> = {
  ruina: 0x5a5a74,
  obra: 0xa9a9c4,
  restaurado: null,
};

// Ala de uma trilha (SPEC 9.3): estandartes das tecnologias, peças das metas e estante de tomos.
// O mapa é o mesmo para todas as alas; os dados preenchem os slots (SPEC 9.4, regra 4).
export class AlaScene extends Sala {
  private ala!: AlaCastelo;

  constructor() {
    super("ala");
  }

  create(dados: { trilhaId: string }) {
    const ala = this.opts.data.alas.find((a) => a.trilhaId === dados.trilhaId);
    if (!ala) {
      this.scene.start("salao");
      return;
    }
    this.ala = ala;
    this.montarMapa("mapa-ala");
    this.acenderTochas();

    const [saida] = this.slotsDe("saida");
    if (saida) this.registrarAlvo(saida.x, 70, { tipo: "saida" });

    this.pendurarEstandartes();
    this.erguerMetas();
    this.montarEstante();

    // Iluminação proporcional às metas concluídas. Nunca chega a esconder a sala.
    const penumbra = 0.3 * (1 - ala.fracaoConcluida);
    this.add
      .rectangle(0, 0, VIEW_W, VIEW_H, 0x05040a, penumbra)
      .setOrigin(0)
      .setScrollFactor(0)
      .setDepth(50);

    this.posicionarHeroi(this.slotsDe("entrada")[0]?.x ?? 96);
    this.opts.onLocal({ sala: "ala", trilhaId: ala.trilhaId, nome: ala.nome });
  }

  private avisarExcedentes(tipo: string, quantos: number) {
    if (quantos > 0 && import.meta.env.DEV) {
      console.warn(`Castelo: ${quantos} ${tipo} sem slot na ala ${this.ala.nome}.`);
    }
  }

  private pendurarEstandartes() {
    const slots = this.slotsDe("estandarte");
    const { colocados, excedentes } = distribuir(this.ala.estandartes, slots.length);
    this.avisarExcedentes("estandartes", excedentes.length);
    colocados.forEach((estandarte, i) => {
      const { x, y } = slots[i];
      this.add.image(x, y, buildEstandarte(this, estandarte.estado)).setOrigin(0.5, 0).setScale(2).setDepth(1);
      this.registrarAlvo(x, this.chaoY - y + 4, { tipo: "estandarte", estandarte });
    });
  }

  private erguerMetas() {
    const slots = this.slotsDe("meta");
    const { colocados, excedentes } = distribuir(this.ala.metas, slots.length);
    this.avisarExcedentes("metas", excedentes.length);
    const andaime = buildAndaime(this);
    const entulho = buildEntulho(this);
    colocados.forEach((meta, i) => {
      const { x, y } = slots[i];
      const peca = PECAS[i % PECAS.length];
      const imagem = this.add.image(x, y, peca.key).setOrigin(0.5, 1).setDepth(1);
      const tinta = TINTA[meta.estado];
      if (tinta !== null) imagem.setTint(tinta);

      if (meta.estado === "ruina") {
        this.add.image(x - 26, y, entulho).setOrigin(0.5, 1).setDepth(3);
        this.add.image(x + 30, y, entulho).setOrigin(0.5, 1).setFlipX(true).setDepth(3);
      } else if (meta.estado === "obra") {
        this.add.image(x + 34, y, andaime).setOrigin(0.5, 1).setDepth(3);
      } else {
        this.brilho(x, y - peca.altura / 2, 56);
        this.add.image(x, y - peca.altura - 6, buildEstandarte(this, "inteiro")).setOrigin(0.5, 0).setDepth(3);
      }
      this.registrarAlvo(x, peca.altura + 10, { tipo: "meta", meta });
    });
  }

  private montarEstante() {
    const [slot] = this.slotsDe("estante");
    if (!slot) return;
    const key = buildEstante(this, `estante-${this.ala.trilhaId}`, this.ala.tomos);
    this.add.image(slot.x, slot.y, key).setOrigin(0.5, 1).setScale(2).setDepth(1);
    this.registrarAlvo(slot.x, ESTANTE_H * 2 + 8, { tipo: "estante", ala: this.ala });
  }

  protected atravessar(alvo: Alvo) {
    if (alvo.tipo === "saida") this.scene.start("salao", { voltandoDe: this.ala.trilhaId });
  }
}
