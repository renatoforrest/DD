class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  create() {
    this.makeTex('hero', 18, 26, (g) => {
      g.fillStyle(0x1c2735, 1);
      g.fillRect(3, 9, 12, 15);
      g.fillRect(2, 11, 14, 9);
      g.fillStyle(0x2c3d52, 1);
      g.fillRect(3, 9, 5, 15);
      g.fillStyle(0xd9c7a7, 1);
      g.fillCircle(9, 6, 4);
      g.fillStyle(0x141a24, 1);
      g.fillRect(5, 2, 8, 4);
      g.fillStyle(0xffd873, 1);
      g.fillRect(15, 13, 2, 3);
    });

    this.makeTex('enemy-skulker', 16, 24, (g) => {
      g.fillStyle(0xcfc7ae, 1);
      g.fillRect(4, 8, 8, 12);
      g.fillRect(5, 20, 2, 4);
      g.fillRect(9, 20, 2, 4);
      g.fillStyle(0x8f8874, 1);
      g.fillRect(6, 10, 1, 9);
      g.fillRect(9, 10, 1, 9);
      g.fillStyle(0xcfc7ae, 1);
      g.fillCircle(8, 5, 3.5);
      g.fillStyle(0x1a1a1a, 1);
      g.fillRect(6, 4, 2, 2);
      g.fillRect(9, 4, 2, 2);
    });

    this.makeTex('enemy-brute', 26, 30, (g) => {
      g.fillStyle(0x5a2e2e, 1);
      g.fillRect(5, 8, 16, 18);
      g.fillRect(2, 10, 22, 10);
      g.fillStyle(0x6e3a3a, 1);
      g.fillRect(5, 8, 6, 18);
      g.fillStyle(0x472424, 1);
      g.fillRect(0, 12, 4, 8);
      g.fillRect(22, 12, 4, 8);
      g.fillStyle(0x4a2626, 1);
      g.fillCircle(13, 6, 5);
      g.fillStyle(0xff5533, 1);
      g.fillRect(10, 5, 3, 2);
      g.fillRect(16, 5, 3, 2);
    });

    this.makeTex('door', 36, 54, (g) => {
      g.fillStyle(0x2b2016, 1);
      g.fillRect(0, 0, 36, 54);
      g.fillStyle(0x0e0a08, 1);
      g.fillRect(4, 6, 28, 48);
      g.fillStyle(0x3a2c1c, 1);
      g.fillRect(4, 6, 28, 4);
      g.fillStyle(0x8a7a4a, 1);
      g.fillRect(26, 30, 3, 3);
    });

    this.makeTex('swing', 48, 48, (g) => {
      g.lineStyle(5, 0xffe9b0, 0.9);
      g.beginPath();
      g.arc(4, 24, 18, -1.1, 1.1);
      g.strokePath();
      g.lineStyle(2, 0xfff6d8, 1);
      g.beginPath();
      g.arc(4, 24, 13, -0.9, 0.9);
      g.strokePath();
    });

    if (!RunState.plan.length) RunState.newRun();
    this.scene.start('CorridorScene', {});
  }

  makeTex(key, w, h, draw) {
    const g = this.make.graphics({ add: false });
    draw(g);
    g.generateTexture(key, w, h);
    g.destroy();
  }
}
