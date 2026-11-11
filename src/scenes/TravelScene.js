class TravelScene extends Phaser.Scene {
  constructor(key) {
    super(key);
    this.sceneKey = key;
  }

  init(data) {
    this.removeIds = (data && data.removeIds) || [];
  }

  create() {
    const node = RunState.current();
    this.node = node;
    this.ambushing = false;
    this.exiting = false;
    this.pendingCleanup = false;

    const W = this.worldWidth;
    const H = 360;
    const top = this.wallTop;
    const bot = this.wallBottom;

    this.physics.world.setBounds(0, 0, W, H);
    this.cameras.main.setBounds(0, 0, W, H);

    bakeBackground(this, this.bgKey(), W, H, this.bgOpts());
    this.add.image(0, 0, this.bgKey()).setOrigin(0, 0).setDepth(0);

    const cy = top + (H - top - bot) / 2;

    this.add.image(30, cy, 'door').setDepth(1);
    this.add.image(W - 30, cy, 'door').setDepth(1);

    this.walls = [];
    this.addWall(W / 2, top / 2, W, top);
    this.addWall(W / 2, H - bot / 2, W, bot);

    this.keys = this.input.keyboard.addKeys('W,A,S,D,UP,DOWN,LEFT,RIGHT,J,K,SPACE,SHIFT');
    this.player = new Player(this, 80, cy);
    this.physics.add.collider(this.player.sprite, this.walls);

    this.enemies = [];
    this.enemySprites = [];
    const placed = [];
    for (let id = 0; id < node.enemies.length; id++) {
      if (this.removeIds.includes(id)) continue;
      let x = 0;
      let y = 0;
      for (let a = 0; a < 40; a++) {
        x = Phaser.Math.Between(300, W - 140);
        y = Phaser.Math.Between(top + 30, H - bot - 30);
        if (placed.every((p) => Phaser.Math.Distance.Between(p.x, p.y, x, y) > 90)) break;
      }
      placed.push({ x, y });
      const e = new Enemy(this, x, y, node.enemies[id], 'travel', id);
      this.enemies.push(e);
      this.enemySprites.push(e.sprite);
    }
    for (const s of this.enemySprites) this.physics.add.collider(s, this.walls);
    if (this.enemySprites.length > 1) {
      this.physics.add.collider(this.enemySprites, this.enemySprites);
    }

    const exitZone = this.add.zone(W - 26, cy, 26, H - top - bot);
    this.physics.add.existing(exitZone, true);
    this.physics.add.overlap(this.player.sprite, exitZone, () => this.onExit());

    this.cameras.main.startFollow(this.player.sprite, true, 1, 1);

    createHud(this);
  }

  addWall(x, y, w, h) {
    const r = this.add.rectangle(x, y, w, h, 0x000000, 0);
    this.physics.add.existing(r, true);
    this.walls.push(r);
  }

  triggerAmbush(enemy) {
    if (this.ambushing || this.exiting) return;
    this.ambushing = true;
    this.physics.pause();
    this.player.sprite.setVelocity(0, 0);
    const foes = [enemy];
    for (const e of this.enemies) {
      if (e === enemy || e.dead || foes.length >= 3) continue;
      if (Phaser.Math.Distance.Between(e.sprite.x, e.sprite.y, enemy.sprite.x, enemy.sprite.y) < 220) {
        foes.push(e);
      }
    }
    const removeIds = [...this.removeIds, ...foes.map((f) => f.id)];
    this.cameras.main.flash(250, 120, 0, 0);
    this.add.text(this.player.sprite.x, this.player.sprite.y - 60, 'AMBUSHED!', {
      fontFamily: 'monospace', fontSize: '26px', color: '#ff5544',
      stroke: '#000000', strokeThickness: 5
    }).setOrigin(0.5).setDepth(30);
    this.time.delayedCall(850, () => {
      this.scene.start('BattleScene', {
        foes: foes.map((f) => f.type),
        removeIds,
        fromKey: this.sceneKey
      });
    });
  }

  onExit() {
    if (this.ambushing || this.exiting) return;
    this.exiting = true;
    RunState.depth++;
    if (RunState.depth >= RunState.total) {
      this.scene.start('EndScene', { win: true });
      return;
    }
    this.cameras.main.fade(200, 0, 0, 0);
    this.time.delayedCall(220, () => {
      this.scene.start(RunState.current().kind + 'Scene', {});
    });
  }

  onPlayerDamaged() {
    this.updateHud();
  }

  onEnemyDead() {
    this.pendingCleanup = true;
  }

  update(time, delta) {
    if (this.ambushing || this.exiting) return;
    const dt = delta / 1000;
    this.player.update(dt);
    for (const e of this.enemies) e.update(dt, this.player);
    if (this.pendingCleanup) {
      this.enemies = this.enemies.filter((e) => !e.dead);
      this.pendingCleanup = false;
    }
  }
}
