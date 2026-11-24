import type Phaser from "phaser";

// Arte provisória da fase C1 (SPEC 9.5), desenhada em código pixel a pixel.
// Cada caractere é um pixel; "." é transparente. Sai na fase C3, com os packs de licença aberta.

const PALETTE: Record<string, string> = {
  h: "#2b1d16", // cabelo
  s: "#e2b58f", // pele
  e: "#15131c", // olho
  r: "#c8102e", // cachecol (vermelho do site)
  c: "#3a4a78", // casaco
  d: "#273458", // casaco, sombra
  b: "#8a6a3a", // cinto
  p: "#23212e", // calça
  k: "#15131c", // bota
  w: "#6b4a2b", // madeira
  i: "#4a4a58", // ferro
  f: "#ffb347", // chama
  y: "#fff1a8", // chama, centro
  a: "#2a2833", // brasa apagada
};

export const PLAYER_W = 14;
export const PLAYER_H = 22;

const PLAYER_TOP = [
  "....hhhhhh....",
  "...hhhhhhhh...",
  "...hhhsssss...",
  "...hhssesse...",
  "...hsssssss...",
  "....ssssss....",
  "...rrrrrrrr...",
  "..cccccccccc..",
  ".dccccccccccd.",
  ".dccccccccccd.",
  ".sdccccccccds.",
  ".sdccccccccds.",
  "...dccccccd...",
  "...bbbbbbbb...",
  "...cccccccc...",
  "...pppppppp...",
];

const LEGS: Record<string, string[]> = {
  idle: [
    "...ppp..ppp...",
    "...ppp..ppp...",
    "...ppp..ppp...",
    "...ppp..ppp...",
    "...kkk..kkk...",
    "...kkkk.kkkk..",
  ],
  walk1: [
    "...ppp..ppp...",
    "..ppp....ppp..",
    "..ppp....ppp..",
    ".ppp......ppp.",
    ".kkk......kkk.",
    ".kkkk.....kkkk",
  ],
  walk2: [
    "....pppppp....",
    "....pppppp....",
    ".....pppp.....",
    ".....pppp.....",
    ".....kkkk.....",
    ".....kkkkk....",
  ],
  jump: [
    "..pppp..ppp...",
    ".pppp...ppp...",
    ".kkk....ppp...",
    ".kkk.....ppp..",
    ".........kkk..",
    ".........kkkk.",
  ],
};

export const PLAYER_FRAMES = ["idle", "walk1", "walk2", "jump"] as const;

const TORCH_BASE = [
  "..........",
  "..........",
  "..........",
  "..........",
  "..........",
  "..........",
  "..iiiiii..",
  "...iiii...",
  "....ww....",
  "....ww....",
  "....ww....",
  "....ww....",
  "....ww....",
  "....ww....",
];

const TORCH_OFF = ["..........", "..........", "..........", "..........", "...aaaa...", "..aaaaaa.."];

const TORCH_ON = [
  "....ff....",
  "...ffff...",
  "...fyyf...",
  "..ffyyff..",
  "..fyyyyf..",
  "..ffyyff..",
];

function paint(ctx: CanvasRenderingContext2D, rows: string[], offsetX: number, offsetY: number) {
  rows.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      const color = PALETTE[row[x]];
      if (!color) continue;
      ctx.fillStyle = color;
      ctx.fillRect(offsetX + x, offsetY + y, 1, 1);
    }
  });
}

/** Folha de sprites do personagem: um quadro por pose, lado a lado. Quadros nomeados por pose. */
export function buildPlayerTexture(scene: Phaser.Scene, key: string) {
  const texture = scene.textures.createCanvas(key, PLAYER_W * PLAYER_FRAMES.length, PLAYER_H);
  if (!texture) return;
  const ctx = texture.getContext();
  PLAYER_FRAMES.forEach((pose, index) => {
    const x = index * PLAYER_W;
    paint(ctx, PLAYER_TOP, x, 0);
    paint(ctx, LEGS[pose], x, PLAYER_TOP.length);
    texture.add(pose, 0, x, 0, PLAYER_W, PLAYER_H);
  });
  texture.refresh();
}

/** Tocha em dois quadros: "off" (apagada) e "on" (acesa). */
export function buildTorchTexture(scene: Phaser.Scene, key: string) {
  const w = 10;
  const h = TORCH_BASE.length;
  const texture = scene.textures.createCanvas(key, w * 2, h);
  if (!texture) return;
  const ctx = texture.getContext();
  paint(ctx, TORCH_BASE, 0, 0);
  paint(ctx, TORCH_OFF, 0, 0);
  paint(ctx, TORCH_BASE, w, 0);
  paint(ctx, TORCH_ON, w, 0);
  texture.add("off", 0, 0, 0, w, h);
  texture.add("on", 0, w, 0, w, h);
  texture.refresh();
}

/** Bloco de pedra 16x16 que se repete sem emenda. */
export function buildStoneTexture(scene: Phaser.Scene, key: string, base: string, mortar: string, light: string) {
  const size = 16;
  const texture = scene.textures.createCanvas(key, size, size);
  if (!texture) return;
  const ctx = texture.getContext();
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, size, size);
  ctx.fillStyle = mortar;
  ctx.fillRect(0, 7, size, 1);
  ctx.fillRect(0, 15, size, 1);
  ctx.fillRect(7, 0, 1, 7);
  ctx.fillRect(15, 8, 1, 7);
  ctx.fillStyle = light;
  ctx.fillRect(0, 0, 7, 1);
  ctx.fillRect(8, 0, 7, 1);
  ctx.fillRect(0, 8, 15, 1);
  texture.refresh();
}
