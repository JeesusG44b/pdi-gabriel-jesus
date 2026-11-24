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
}
