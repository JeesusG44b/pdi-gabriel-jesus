import Phaser from "phaser";
import type { CasteloOptions } from "./input";
import { abrePergaminho, type Alvo } from "./model";

export const VIEW_W = 480;
export const VIEW_H = 270;

/** Cor chapada da parede: a mesma do fundo dos painéis do pack de arte. */
export const COR_PAREDE = 0x272638;

const SPEED = 110;
const JUMP_SPEED = 310; // com gravidade 760, alcança cerca de 63 px
const ALCANCE = 24; // distância horizontal para acionar um alvo

// Quadro de 82x60 nas folhas do personagem; o corpo ocupa o centro, com os pés na base.
const HEROI = { frameW: 82, frameH: 60, corpoW: 14, corpoH: 40, offsetX: 34, offsetY: 20 };

const QUADRO_PARADO = 1;

type Keys = Record<"left" | "right" | "a" | "d" | "up" | "w" | "space" | "e" | "enter", Phaser.Input.Keyboard.Key>;

export interface Slot {
  x: number;
  y: number;
  ordem: number;
}

interface AlvoNaSala {
  x: number;
  /** Altura do marcador "E", em pixels acima do chão. */
  altura: number;
  alvo: Alvo;
}

/** Carrega a arte e os mapas uma vez e abre o salão. */
export class BootScene extends Phaser.Scene {
  constructor() {
    super("boot");
  }

  preload() {
    this.load.setPath("/castelo/");
    this.load.image("tileset", "arte/tileset.png");
    for (const peca of ["janela", "coluna", "altar", "gargula", "tocha-parede"]) {
      this.load.image(peca, `arte/${peca}.png`);
    }
    for (const pose of ["andando", "pulando", "caindo"]) {
      this.load.spritesheet(`heroi-${pose}`, `arte/heroi-${pose}.png`, {
        frameWidth: HEROI.frameW,
        frameHeight: HEROI.frameH,
      });
    }
    this.load.tilemapTiledJSON("mapa-salao", "mapas/salao.json");
    this.load.tilemapTiledJSON("mapa-ala", "mapas/ala.json");
  }

  create() {
    this.anims.create({
      key: "heroi-andando",
      frames: this.anims.generateFrameNumbers("heroi-andando", { start: 0, end: 5 }),
      frameRate: 10,
      repeat: -1,
    });
    this.scene.start("salao");
  }
}

/** Base das salas: mapa do Tiled, personagem, controles e alvos acionáveis. */
export abstract class Sala extends Phaser.Scene {
  protected chaoY = 0;
  private heroi!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  private keys?: Keys;
  private slots: Phaser.Types.Tilemaps.TiledObject[] = [];
  private alvos: AlvoNaSala[] = [];
  private emFoco: AlvoNaSala | null = null;
  private marcador!: Phaser.GameObjects.Text;
  private prevJump = false;
  private prevInteract = false;

  /** Opções e dados do castelo, postos no registro do jogo em createGame. */
  protected get opts(): CasteloOptions {
    return this.registry.get("options") as CasteloOptions;
  }

  /** Monta o mapa e devolve a largura da sala em pixels. */
  protected montarMapa(key: string): number {
    this.alvos = [];
    this.emFoco = null;
    this.prevJump = false;
    this.prevInteract = true; // ignora o E que trouxe o personagem até aqui

    const map = this.make.tilemap({ key });
    const tiles = map.addTilesetImage("igreja", "tileset");
    if (!tiles) throw new Error("Tileset do castelo não carregou.");
    map.createLayer("fundo", tiles);
    const solido = map.createLayer("solido", tiles);
    if (!solido) throw new Error(`Mapa ${key} sem a camada "solido".`);
    solido.setCollisionByExclusion([-1]);
    solido.setDepth(5);
    this.slots = map.getObjectLayer("slots")?.objects ?? [];
    this.chaoY = this.slotsDe("entrada")[0]?.y ?? 224;

    this.physics.world.setBounds(0, 0, map.widthInPixels, VIEW_H);
    this.cameras.main.setBounds(0, 0, map.widthInPixels, VIEW_H);
    this.cameras.main.setBackgroundColor(COR_PAREDE);

    this.heroi = this.physics.add.sprite(0, 0, "heroi-andando", QUADRO_PARADO);
    this.heroi.setDepth(20).setCollideWorldBounds(true);
    this.heroi.body.setSize(HEROI.corpoW, HEROI.corpoH).setOffset(HEROI.offsetX, HEROI.offsetY);
    this.physics.add.collider(this.heroi, solido);
    this.cameras.main.startFollow(this.heroi, true, 0.15, 0.15);

    this.marcador = this.add
      .text(0, 0, "E", {
        fontFamily: "monospace",
        fontSize: "10px",
        color: "#f6f8fc",
        backgroundColor: "#0b3d91",
        padding: { x: 3, y: 1 },
      })
      .setOrigin(0.5, 1)
      .setDepth(60)
      .setVisible(false);

    // addKeys captura as teclas: seta e espaço não rolam a página enquanto o jogo tem o teclado.
    this.keys = this.input.keyboard?.addKeys({
      left: Phaser.Input.Keyboard.KeyCodes.LEFT,
      right: Phaser.Input.Keyboard.KeyCodes.RIGHT,
      a: Phaser.Input.Keyboard.KeyCodes.A,
      d: Phaser.Input.Keyboard.KeyCodes.D,
      up: Phaser.Input.Keyboard.KeyCodes.UP,
      w: Phaser.Input.Keyboard.KeyCodes.W,
      space: Phaser.Input.Keyboard.KeyCodes.SPACE,
      e: Phaser.Input.Keyboard.KeyCodes.E,
      enter: Phaser.Input.Keyboard.KeyCodes.ENTER,
    }) as Keys | undefined;

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.opts.onFoco(null));
    return map.widthInPixels;
  }

  /** Slots de um tipo, na ordem definida no mapa. */
  protected slotsDe(tipo: string): Slot[] {
    return this.slots
      .filter((o) => o.type === tipo)
      .map((o) => {
        const props = (o.properties ?? []) as { name: string; value: unknown }[];
        const ordem = Number(props.find((p) => p.name === "ordem")?.value ?? 0);
        return { x: o.x ?? 0, y: o.y ?? 0, ordem };
      })
      .sort((a, b) => a.ordem - b.ordem);
  }

  protected posicionarHeroi(x: number) {
    this.heroi.setPosition(x, this.chaoY - HEROI.frameH / 2);
    this.heroi.setVelocity(0, 0);
  }

  protected registrarAlvo(x: number, altura: number, alvo: Alvo) {
    this.alvos.push({ x, altura, alvo });
  }

  /** Tochas de parede decorativas nos slots "tocha". */
  protected acenderTochas() {
    for (const slot of this.slotsDe("tocha")) {
      this.add.image(slot.x, slot.y, "tocha-parede").setOrigin(0.5, 1).setDepth(1);
      this.brilho(slot.x, slot.y - 96, 34);
    }
  }

  /** Halo de luz quente. Pisca de leve, a não ser com prefers-reduced-motion (SPEC 9.4). */
  protected brilho(x: number, y: number, raio: number) {
    const halo = this.add.circle(x, y, raio, 0xffb347, 0.14).setDepth(2);
    halo.setBlendMode(Phaser.BlendModes.ADD);
    if (!this.opts.reducedMotion) {
      this.tweens.add({
        targets: halo,
        alpha: 0.08,
        duration: 380 + Math.round(x) % 160,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });
    }
    return halo;
  }

  /** Chamado quando o alvo acionado não abre pergaminho (porta aberta, saída). */
  protected abstract atravessar(alvo: Alvo): void;

  update() {
    const k = this.keys;
    const t = this.opts.input;
    const left = t.left || !!k?.left.isDown || !!k?.a.isDown;
    const right = t.right || !!k?.right.isDown || !!k?.d.isDown;
    const jumpHeld = t.jump || !!k?.space.isDown || !!k?.up.isDown || !!k?.w.isDown;
    const interactHeld = t.interact || !!k?.e.isDown || !!k?.enter.isDown;

    // Pulo e interação disparam na borda de subida: um toque, uma ação.
    const jumpPressed = jumpHeld && !this.prevJump;
    const interactPressed = interactHeld && !this.prevInteract;
    this.prevJump = jumpHeld;
    this.prevInteract = interactHeld;

    const body = this.heroi.body;
    const noChao = body.blocked.down || body.touching.down;

    if (left === right) {
      this.heroi.setVelocityX(0);
    } else {
      this.heroi.setVelocityX(left ? -SPEED : SPEED);
      this.heroi.setFlipX(left);
    }
    if (jumpPressed && noChao) this.heroi.setVelocityY(-JUMP_SPEED);

    if (!noChao) {
      this.heroi.anims.stop();
      this.heroi.setTexture(body.velocity.y < 0 ? "heroi-pulando" : "heroi-caindo", 0);
    } else if (body.velocity.x !== 0) {
      this.heroi.anims.play("heroi-andando", true);
    } else {
      // A pose parada do pack é de luta; um quadro ereto da caminhada serve melhor até a fase C3.
      this.heroi.anims.stop();
      this.heroi.setTexture("heroi-andando", QUADRO_PARADO);
    }

    // Alvo mais próximo dentro do alcance, só com os pés no chão.
    let perto: AlvoNaSala | null = null;
    if (noChao) {
      let menor = ALCANCE;
      for (const a of this.alvos) {
        const d = Math.abs(a.x - this.heroi.x);
        if (d < menor) {
          menor = d;
          perto = a;
        }
      }
    }
    if (perto !== this.emFoco) {
      this.emFoco = perto;
      this.opts.onFoco(perto?.alvo ?? null);
    }
    this.marcador.setVisible(!!perto);
    if (perto) {
      this.marcador.setPosition(perto.x, this.chaoY - perto.altura);
      if (interactPressed) {
        if (abrePergaminho(perto.alvo)) this.opts.onAbrir(perto.alvo);
        else this.atravessar(perto.alvo);
      }
    }
  }
}
