import Phaser from "phaser";
import type { CasteloInput, CasteloOptions } from "./input";
import { PLAYER_H, PLAYER_W, buildPlayerTexture, buildStoneTexture, buildTorchTexture } from "./pixels";

export const VIEW_W = 480;
export const VIEW_H = 270;

const WORLD_W = 960;
const FLOOR_Y = 238; // topo do chão
const SPEED = 110;
const JUMP_SPEED = 310; // com gravidade 760, alcança cerca de 63 px: cada degrau da sala tem no máximo 56
const INTERACT_RANGE = 26;

type Keys = Record<"left" | "right" | "a" | "d" | "up" | "w" | "space" | "e" | "enter", Phaser.Input.Keyboard.Key>;

// Sala de teste da fase C1 (SPEC 9.5): valida movimento, pulo, colisão e interação.
// A tocha antecipa a ideia da restauração: apagada ou acesa.
export class TestRoomScene extends Phaser.Scene {
  private player!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  private keys?: Keys;
  private torch!: Phaser.GameObjects.Image;
  private glow!: Phaser.GameObjects.Arc;
  private hint!: Phaser.GameObjects.Text;
  private torchLit = false;
  private flicker?: Phaser.Tweens.Tween;
  private touch!: CasteloInput;
  private reducedMotion = false;
  private prevJump = false;
  private prevInteract = false;

  constructor() {
    super("test-room");
  }

  create() {
    const options = this.registry.get("options") as CasteloOptions;
    this.touch = options.input;
    this.reducedMotion = options.reducedMotion;

    buildStoneTexture(this, "stone-far", "#1b1926", "#13111b", "#211f2e");
    buildStoneTexture(this, "stone", "#3b3848", "#25232e", "#4d495d");
    buildPlayerTexture(this, "player");
    buildTorchTexture(this, "torch");

    this.physics.world.setBounds(0, 0, WORLD_W, VIEW_H);
    this.cameras.main.setBounds(0, 0, WORLD_W, VIEW_H);

    // Fundo: parede distante com paralaxe e janelas em arco.
    this.add.tileSprite(0, 0, WORLD_W, VIEW_H, "stone-far").setOrigin(0).setScrollFactor(0.5);
    const windows = this.add.graphics().setScrollFactor(0.5);
    for (let x = 90; x < WORLD_W; x += 190) {
      windows.fillStyle(0x24345c, 1);
      windows.fillRect(x, 70, 34, 80);
      windows.fillCircle(x + 17, 70, 17);
      windows.fillStyle(0x13111b, 1);
      windows.fillRect(x + 16, 53, 2, 97);
      windows.fillRect(x, 104, 34, 2);
    }

    // Chão e plataformas: corpos estáticos.
    const solids = this.physics.add.staticGroup();
    const addSolid = (x: number, y: number, w: number, h: number) => {
      const block = this.add.tileSprite(x, y, w, h, "stone").setOrigin(0);
      solids.add(block);
    };
    addSolid(0, FLOOR_Y, WORLD_W, VIEW_H - FLOOR_Y);
    addSolid(176, 190, 64, 16);
    addSolid(288, 150, 80, 16);
    addSolid(432, 190, 48, 16);
    addSolid(704, 182, 96, 16);
    addSolid(848, 134, 64, 16);

    // Tocha interativa.
    const torchX = 590;
    this.glow = this.add.circle(torchX, FLOOR_Y - 34, 46, 0xffb347, 0.16).setVisible(false);
    this.glow.setBlendMode(Phaser.BlendModes.ADD);
    this.torch = this.add.image(torchX, FLOOR_Y, "torch", "off").setOrigin(0.5, 1).setScale(2);
    this.hint = this.add
      .text(torchX, FLOOR_Y - 44, "E", {
        fontFamily: "monospace",
        fontSize: "10px",
        color: "#f6f8fc",
        backgroundColor: "#0b3d91",
        padding: { x: 3, y: 1 },
      })
      .setOrigin(0.5, 1)
      .setVisible(false);

    // Personagem.
    this.player = this.physics.add.sprite(60, FLOOR_Y - PLAYER_H, "player", "idle");
    this.player.setCollideWorldBounds(true);
    this.player.body.setSize(PLAYER_W - 6, PLAYER_H - 2).setOffset(3, 2);
    this.anims.create({
      key: "walk",
      frames: [
        { key: "player", frame: "walk1" },
        { key: "player", frame: "idle" },
        { key: "player", frame: "walk2" },
        { key: "player", frame: "idle" },
      ],
      frameRate: 9,
      repeat: -1,
    });
    this.physics.add.collider(this.player, solids);
    this.cameras.main.startFollow(this.player, true, 0.15, 0.15);

    // Teclado. addKeys captura as teclas, então seta e espaço não rolam a página.
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
  }

  update() {
    const k = this.keys;
    const left = this.touch.left || !!k?.left.isDown || !!k?.a.isDown;
    const right = this.touch.right || !!k?.right.isDown || !!k?.d.isDown;
    const jumpHeld = this.touch.jump || !!k?.space.isDown || !!k?.up.isDown || !!k?.w.isDown;
    const interactHeld = this.touch.interact || !!k?.e.isDown || !!k?.enter.isDown;

    // Pulo e interação disparam na borda de subida: um toque, uma ação.
    const jumpPressed = jumpHeld && !this.prevJump;
    const interactPressed = interactHeld && !this.prevInteract;
    this.prevJump = jumpHeld;
    this.prevInteract = interactHeld;

    const body = this.player.body;
    const onGround = body.blocked.down || body.touching.down;

    if (left === right) {
      this.player.setVelocityX(0);
    } else {
      this.player.setVelocityX(left ? -SPEED : SPEED);
      this.player.setFlipX(left);
    }
    if (jumpPressed && onGround) this.player.setVelocityY(-JUMP_SPEED);

    if (!onGround) {
      this.player.anims.stop();
      this.player.setFrame("jump");
    } else if (body.velocity.x !== 0) {
      this.player.anims.play("walk", true);
    } else {
      this.player.anims.stop();
      this.player.setFrame("idle");
    }

    const near = Math.abs(this.player.x - this.torch.x) < INTERACT_RANGE && onGround;
    this.hint.setVisible(near);
    if (near && interactPressed) this.toggleTorch();
  }

  private toggleTorch() {
    this.torchLit = !this.torchLit;
    this.torch.setFrame(this.torchLit ? "on" : "off");
    this.glow.setVisible(this.torchLit);
    this.flicker?.stop();
    this.flicker = undefined;
    this.glow.setAlpha(1);
    // SPEC 9.4, regra 5: sem piscar de tocha com prefers-reduced-motion.
    if (this.torchLit && !this.reducedMotion) {
      this.flicker = this.tweens.add({
        targets: this.glow,
        alpha: 0.7,
        duration: 420,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });
    }
  }
}
