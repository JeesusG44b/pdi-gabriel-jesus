import type { Alvo, CasteloData, LocalCastelo } from "./model";

// Estado de entrada compartilhado entre os botões de toque (React) e a cena (Phaser).
// O React escreve, a cena lê a cada quadro. O teclado é lido direto pelo Phaser.
export interface CasteloInput {
  left: boolean;
  right: boolean;
  jump: boolean;
  interact: boolean;
}

export type CasteloInputKey = keyof CasteloInput;

export function createCasteloInput(): CasteloInput {
  return { left: false, right: false, jump: false, interact: false };
}

export interface CasteloOptions {
  input: CasteloInput;
  reducedMotion: boolean;
  data: CasteloData;
  /** O personagem chegou perto de um alvo (ou se afastou: null). */
  onFoco: (alvo: Alvo | null) => void;
  /** O personagem acionou um alvo que abre pergaminho. */
  onAbrir: (alvo: Alvo) => void;
  /** O personagem entrou em uma sala. */
  onLocal: (local: LocalCastelo) => void;
}

export interface CasteloHandle {
  destruir: () => void;
  /** Congela o jogo enquanto um pergaminho está aberto. */
  pausar: (pausado: boolean) => void;
  /**
   * Liga ou desliga o teclado do jogo. Ligado, o Phaser captura setas, espaço e Enter;
   * por isso fica desligado sempre que o foco está em um link, botão ou painel da página.
   */
  teclado: (ligado: boolean) => void;
}
