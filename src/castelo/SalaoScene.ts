import Phaser from "phaser";
import type { Alvo } from "./model";
import { buildTabuas } from "./pixels";
import { Sala } from "./Sala";

// Salão central (SPEC 9.3): altar com o "Sobre" e uma porta por trilha.
// Porta de ala pronta fica iluminada; as demais ficam com tábuas até a fase C4.
export class SalaoScene extends Sala {
  constructor() {
    super("salao");
  }

  create(dados: { voltandoDe?: string }) {
    this.montarMapa("mapa-salao");
    this.acenderTochas();

    for (const slot of this.slotsDe("coluna")) {
      this.add.image(slot.x, slot.y, "coluna").setOrigin(0.5, 1).setDepth(1);
    }

    const [sobre] = this.slotsDe("sobre");
    if (sobre) {
      this.add.image(sobre.x, sobre.y, "altar").setOrigin(0.5, 1).setDepth(1);
      this.brilho(sobre.x, sobre.y - 60, 44);
      this.registrarAlvo(sobre.x, 124, { tipo: "sobre" });
    }

    const portas = this.slotsDe("porta");
    const tabuas = buildTabuas(this);
    let entrada = this.slotsDe("entrada")[0]?.x ?? 400;
    this.opts.data.alas.forEach((ala, i) => {
      const porta = portas[i];
      if (!porta) {
        if (import.meta.env.DEV) console.warn(`Castelo: sem porta no salão para a ala ${ala.nome}.`);
        return;
      }
      if (ala.aberta) {
        const luz = this.add.rectangle(porta.x, porta.y - 26, 18, 50, 0xffb347, 0.1).setDepth(1);
        luz.setBlendMode(Phaser.BlendModes.ADD);
      } else {
        this.add.image(porta.x, porta.y, tabuas).setOrigin(0.5, 1).setDepth(2);
      }
      this.registrarAlvo(porta.x, 70, { tipo: "porta", ala });
      if (dados?.voltandoDe === ala.trilhaId) entrada = porta.x;
    });

    this.posicionarHeroi(entrada);
    this.opts.onLocal({ sala: "salao" });
  }

  protected atravessar(alvo: Alvo) {
    if (alvo.tipo === "porta") this.scene.start("ala", { trilhaId: alvo.ala.trilhaId });
  }
}
