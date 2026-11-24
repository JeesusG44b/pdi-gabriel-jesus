import type Phaser from "phaser";
import type { EstadoEstandarte, TomoCastelo } from "./model";

// Peças desenhadas em código, pixel a pixel, para o que o pack de arte não traz:
// estandartes, estante de tomos, andaime, entulho e tábuas. Ver public/castelo/CREDITOS.md.

// Cores tricolores do site (SPEC 6.1). Só aparecem no que está restaurado (SPEC 9.2).
const AZUL = "#0b3d91";
const BRANCO = "#e8eef7";
const VERMELHO = "#c8102e";

const MADEIRA = "#6b4a2b";
const MADEIRA_ESCURA = "#4a321c";
const PANO_GASTO = "#565a72";
const PANO_CINZA = "#3f3e4d";
const REMENDO = "#8a6a3a";

type Ctx = CanvasRenderingContext2D;

function criar(scene: Phaser.Scene, key: string, w: number, h: number, pintar: (ctx: Ctx) => void) {
  if (scene.textures.exists(key)) return;
  const texture = scene.textures.createCanvas(key, w, h);
  if (!texture) return;
  pintar(texture.getContext());
  texture.refresh();
}

function rect(ctx: Ctx, cor: string, x: number, y: number, w: number, h: number) {
  ctx.fillStyle = cor;
  ctx.fillRect(x, y, w, h);
}

export const ESTANDARTE_W = 14;
export const ESTANDARTE_H = 32;

/** Estandarte em três estados: rasgado e sem cor, remendado, inteiro com as cores do site. */
export function buildEstandarte(scene: Phaser.Scene, estado: EstadoEstandarte): string {
  const key = `estandarte-${estado}`;
  criar(scene, key, ESTANDARTE_W, ESTANDARTE_H, (ctx) => {
    rect(ctx, MADEIRA, 0, 0, ESTANDARTE_W, 2);
    rect(ctx, MADEIRA_ESCURA, 0, 2, 1, 1);
    rect(ctx, MADEIRA_ESCURA, ESTANDARTE_W - 1, 2, 1, 1);
    const rasgos = [19, 13, 21, 11, 17, 23, 9, 15, 20, 12, 18, 14];
    for (let cx = 0; cx < 12; cx++) {
      let altura: number;
      let cor: string;
      if (estado === "inteiro") {
        altura = 28 - Math.round(Math.abs(cx - 5.5)); // ponta em V
        cor = cx < 4 ? AZUL : cx < 8 ? BRANCO : VERMELHO;
      } else if (estado === "remendado") {
        altura = cx === 3 || cx === 9 ? 23 : 25;
        cor = cx < 4 ? "#3b5a9c" : PANO_GASTO;
      } else {
        altura = rasgos[cx];
        cor = PANO_CINZA;
      }
      rect(ctx, cor, cx + 1, 2, 1, altura);
    }
    if (estado === "remendado") {
      rect(ctx, REMENDO, 6, 10, 5, 5);
      rect(ctx, MADEIRA_ESCURA, 6, 12, 5, 1);
      rect(ctx, MADEIRA_ESCURA, 8, 10, 1, 5);
    }
    if (estado === "rasgado") {
      ctx.clearRect(4, 6, 2, 3);
      ctx.clearRect(9, 9, 2, 2);
    }
  });
  return key;
}

const COR_DA_LOMBADA: Record<TomoCastelo["fase"], string> = {
  cursada: AZUL,
  cursando: "#e3b341",
  futura: "#4a4a58",
};

export const ESTANTE_W = 44;
export const ESTANTE_H = 52;

/** Estante com um tomo por disciplina; a lombada mostra a fase. Uma textura por ala. */
export function buildEstante(scene: Phaser.Scene, key: string, tomos: TomoCastelo[]): string {
  criar(scene, key, ESTANTE_W, ESTANTE_H, (ctx) => {
    rect(ctx, MADEIRA_ESCURA, 0, 0, ESTANTE_W, ESTANTE_H);
    rect(ctx, "#1b1926", 3, 3, ESTANTE_W - 6, ESTANTE_H - 6);
    const prateleiras = [3, 19, 35];
    prateleiras.forEach((y) => rect(ctx, MADEIRA, 2, y + 14, ESTANTE_W - 4, 2));
    tomos.slice(0, 18).forEach((tomo, i) => {
      const x = 5 + (i % 6) * 6;
      const y = prateleiras[Math.floor(i / 6)];
      const altura = 12 - (i % 3);
      rect(ctx, COR_DA_LOMBADA[tomo.fase], x, y + 14 - altura, 5, altura);
      rect(ctx, BRANCO, x + 1, y + 16 - altura, 3, 1);
    });
  });
  return key;
}

/** Andaime de madeira, posto na frente de uma peça em obra. */
export function buildAndaime(scene: Phaser.Scene): string {
  const key = "andaime";
  criar(scene, key, 40, 72, (ctx) => {
    rect(ctx, MADEIRA, 2, 0, 3, 72);
    rect(ctx, MADEIRA, 35, 0, 3, 72);
    [8, 34, 60].forEach((y) => rect(ctx, MADEIRA_ESCURA, 0, y, 40, 3));
    rect(ctx, "#8a6a3a", 0, 31, 40, 3);
    ctx.strokeStyle = MADEIRA_ESCURA;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(4, 60);
    ctx.lineTo(36, 36);
    ctx.stroke();
  });
  return key;
}

/** Entulho ao pé de uma peça em ruína. */
export function buildEntulho(scene: Phaser.Scene): string {
  const key = "entulho";
  criar(scene, key, 28, 10, (ctx) => {
    const pedras: [number, number, number, number][] = [
      [0, 6, 7, 4],
      [6, 3, 8, 7],
      [13, 5, 6, 5],
      [18, 2, 6, 8],
      [23, 7, 5, 3],
    ];
    pedras.forEach(([x, y, w, h], i) => {
      rect(ctx, i % 2 ? "#3b3848" : "#4d495d", x, y, w, h);
      rect(ctx, "#25232e", x, y + h - 1, w, 1);
    });
  });
  return key;
}

/** Tábuas cruzadas sobre a porta de uma ala ainda em obras. */
export function buildTabuas(scene: Phaser.Scene): string {
  const key = "tabuas";
  criar(scene, key, 32, 64, (ctx) => {
    ctx.lineWidth = 5;
    ctx.strokeStyle = MADEIRA;
    ctx.beginPath();
    ctx.moveTo(1, 10);
    ctx.lineTo(31, 34);
    ctx.moveTo(31, 30);
    ctx.lineTo(1, 56);
    ctx.stroke();
    ctx.lineWidth = 1;
    ctx.strokeStyle = MADEIRA_ESCURA;
    ctx.beginPath();
    ctx.moveTo(1, 13);
    ctx.lineTo(31, 37);
    ctx.moveTo(31, 33);
    ctx.lineTo(1, 59);
    ctx.stroke();
  });
  return key;
}
