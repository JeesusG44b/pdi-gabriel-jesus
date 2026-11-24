// Gera os mapas do castelo no formato JSON do Tiled (SPEC 9.2), em public/castelo/mapas/.
// Uso: node scripts/castelo/gerar-mapas.mjs
//
// Os arquivos gerados abrem no editor Tiled. Enquanto as salas forem simples, este script é a
// fonte; quando uma sala passar a ser editada à mão no Tiled, tire-a daqui para não sobrescrever.
//
// A cena lê duas coisas do mapa:
//   - camada "solido": tiles com colisão (chão e plataformas);
//   - camada de objetos "slots": pontos nomeados onde os dados do PDI aparecem (SPEC 9.4, regra 4).
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const SAIDA = join(RAIZ, "public", "castelo", "mapas");

const TILE = 16;
const COLUNAS_TILESET = 21;
const ALTURA = 17; // 272 px; a vista do jogo tem 270
const LINHA_CHAO = 14; // topo do chão em y = 224

// Posição (coluna, linha) no tileset do Gothicvania Church Pack -> gid do Tiled.
const gid = (col, lin) => lin * COLUNAS_TILESET + col + 1;
const PISO_TOPO = [gid(1, 7), gid(2, 7)];
const PISO_MIOLO = [gid(1, 8), gid(2, 8)];
const ARCO = [
  [gid(18, 1), gid(19, 1)],
  [gid(18, 2), gid(19, 2)],
  [gid(18, 3), gid(19, 3)],
  [gid(18, 4), gid(19, 4)],
];

function novoMapa(largura) {
  const vazio = () => new Array(largura * ALTURA).fill(0);
  const fundo = vazio();
  const solido = vazio();
  const objetos = [];
  let proximoId = 1;

  const set = (camada, col, lin, valor) => {
    if (col < 0 || col >= largura || lin < 0 || lin >= ALTURA) return;
    camada[lin * largura + col] = valor;
  };

  // Chão em toda a largura.
  for (let col = 0; col < largura; col++) {
    set(solido, col, LINHA_CHAO, PISO_TOPO[col % 2]);
    for (let lin = LINHA_CHAO + 1; lin < ALTURA; lin++) set(solido, col, lin, PISO_MIOLO[col % 2]);
  }

  return {
    /** Bloco de pedra com duas linhas de altura, usado como plataforma. */
    plataforma(col, lin, colunas) {
      for (let i = 0; i < colunas; i++) {
        set(solido, col + i, lin, PISO_TOPO[(col + i) % 2]);
        set(solido, col + i, lin + 1, PISO_MIOLO[(col + i) % 2]);
      }
    },
    /** Arco de porta (2x4 tiles) apoiado no chão, na camada de fundo. */
    arco(col) {
      ARCO.forEach((linha, i) => {
        set(fundo, col, LINHA_CHAO - 4 + i, linha[0]);
        set(fundo, col + 1, LINHA_CHAO - 4 + i, linha[1]);
      });
    },
    /** Ponto nomeado. x em pixels; y padrão é o topo do chão. */
    slot(type, x, { ordem = 0, y = LINHA_CHAO * TILE } = {}) {
      objetos.push({
        id: proximoId++,
        name: `${type}-${ordem}`,
        type,
        x,
        y,
        width: 0,
        height: 0,
        point: true,
        rotation: 0,
        visible: true,
        properties: [{ name: "ordem", type: "int", value: ordem }],
      });
    },
    json() {
      const camada = (id, name, data) => ({
        id,
        name,
        type: "tilelayer",
        data,
        width: largura,
        height: ALTURA,
        x: 0,
        y: 0,
        opacity: 1,
        visible: true,
      });
      return {
        type: "map",
        version: "1.10",
        tiledversion: "1.10.2",
        orientation: "orthogonal",
        renderorder: "right-down",
        infinite: false,
        compressionlevel: -1,
        width: largura,
        height: ALTURA,
        tilewidth: TILE,
        tileheight: TILE,
        nextlayerid: 4,
        nextobjectid: proximoId,
        tilesets: [
          {
            firstgid: 1,
            name: "igreja",
            image: "../arte/tileset.png",
            imagewidth: 336,
            imageheight: 224,
            tilewidth: TILE,
            tileheight: TILE,
            tilecount: 294,
            columns: COLUNAS_TILESET,
            margin: 0,
            spacing: 0,
          },
        ],
        layers: [
          camada(1, "fundo", fundo),
          camada(2, "solido", solido),
          {
            id: 3,
            name: "slots",
            type: "objectgroup",
            draworder: "topdown",
            objects: objetos,
            x: 0,
            y: 0,
            opacity: 1,
            visible: true,
          },
        ],
      };
    },
  };
}

// Salão central: altar no meio, três portas à esquerda e duas à direita.
function salao() {
  const m = novoMapa(60);
  const portas = [6, 14, 22, 40, 50];
  portas.forEach((col, ordem) => {
    m.arco(col);
    m.slot("porta", (col + 1) * TILE, { ordem });
  });
  m.slot("sobre", 31 * TILE);
  m.slot("entrada", 27 * TILE);
  [10.5, 18.5, 36.5, 45.5, 56].forEach((col, ordem) => m.slot("tocha", col * TILE, { ordem }));
  m.slot("coluna", 2.5 * TILE);
  return m.json();
}

// Ala de uma trilha: galeria de estandartes, peças das metas e estante de tomos.
// O mesmo mapa serve a todas as alas; os dados da trilha preenchem os slots.
function ala() {
  const m = novoMapa(112);
  m.arco(2);
  m.slot("saida", 3 * TILE);
  m.slot("entrada", 6 * TILE);
  for (let i = 0; i < 12; i++) m.slot("estandarte", 136 + i * 32, { ordem: i, y: 88 });
  for (let i = 0; i < 6; i++) m.slot("meta", 640 + i * 168, { ordem: i });
  m.slot("estante", 1680);
  [34, 104].forEach((col, ordem) => m.slot("tocha", col * TILE, { ordem }));
  return m.json();
}

mkdirSync(SAIDA, { recursive: true });
for (const [nome, mapa] of Object.entries({ salao: salao(), ala: ala() })) {
  writeFileSync(join(SAIDA, `${nome}.json`), `${JSON.stringify(mapa)}\n`);
  console.log(`${nome}.json: ${mapa.width}x${mapa.height} tiles, ${mapa.layers[2].objects.length} slots`);
}
