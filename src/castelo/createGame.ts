import Phaser from "phaser";
import { AlaScene } from "./AlaScene";
import type { CasteloHandle, CasteloOptions } from "./input";
import { BootScene, COR_PAREDE, VIEW_H, VIEW_W } from "./Sala";
import { SalaoScene } from "./SalaoScene";

// Único ponto de entrada do jogo. Este módulo importa o Phaser, então só pode ser carregado
// por import dinâmico no navegador (SPEC 9.4, regra 2). Ver src/components/castelo/CasteloGame.tsx.
export function createGame(parent: HTMLElement, options: CasteloOptions): CasteloHandle {
  const game = new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    width: VIEW_W,
    height: VIEW_H,
    pixelArt: true,
    backgroundColor: COR_PAREDE,
    banner: false,
    audio: { noAudio: true }, // áudio entra na fase C3
    // O jogo não usa ponteiro. Sem isso o canvas engoliria a roda do mouse e o arrasto de toque.
    input: { mouse: false, touch: false },
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
    physics: { default: "arcade", arcade: { gravity: { x: 0, y: 760 } } },
    callbacks: {
      preBoot: (g) => g.registry.set("options", options),
    },
    scene: [BootScene, SalaoScene, AlaScene],
  });

  // Só em desenvolvimento: deixa o jogo acessível no console para depuração e testes manuais.
  if (import.meta.env.DEV) (window as unknown as { __castelo?: Phaser.Game }).__castelo = game;

  return {
    destruir: () => game.destroy(true),
    pausar: (pausado) => {
      for (const scene of game.scene.getScenes(false)) {
        if (scene.scene.key === "boot") continue;
        if (pausado && scene.scene.isActive()) scene.scene.pause();
        else if (!pausado && scene.scene.isPaused()) scene.scene.resume();
      }
    },
    teclado: (ligado) => {
      const teclado = game.input.keyboard;
      if (!teclado || teclado.enabled === ligado) return;
      teclado.enabled = ligado;
      // Uma tecla solta com o teclado desligado ficaria "presa": zera o estado de todas.
      for (const scene of game.scene.getScenes(false)) scene.input.keyboard?.resetKeys();
    },
  };
}
