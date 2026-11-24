import Phaser from "phaser";
import type { CasteloOptions } from "./input";
import { TestRoomScene, VIEW_H, VIEW_W } from "./TestRoomScene";

// Único ponto de entrada do jogo. Este módulo importa o Phaser, então só pode ser carregado
// por import dinâmico no navegador (SPEC 9.4, regra 2). Ver src/components/castelo/CasteloGame.tsx.
export function createGame(parent: HTMLElement, options: CasteloOptions): () => void {
  const game = new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    width: VIEW_W,
    height: VIEW_H,
    pixelArt: true,
    backgroundColor: "#0d0b14",
    banner: false,
    audio: { noAudio: true }, // áudio entra na fase C3
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
    physics: { default: "arcade", arcade: { gravity: { x: 0, y: 760 } } },
    callbacks: {
      preBoot: (g) => g.registry.set("options", options),
    },
    scene: [TestRoomScene],
  });
  return () => game.destroy(true);
}
