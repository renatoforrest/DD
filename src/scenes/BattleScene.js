class BattleScene extends Phaser.Scene {
  constructor() {
    super('BattleScene');
  }

  init(data) {
    this.battleData = data || {};
  }

  create() {
    const W = 640;
    const H = 360;
    this.ambushIntro = true;
    this.over = false;
    this.pendingCleanup = false;

    this.physics.world.setBounds(0, 0, W, H);
    this.cameras.main.setBackgroundColor('#050508');

    bakeBackground(this, 'bg-arena', W, H, { wallTop: 56, wallBottom: 56, floor: '#2a2330', torchSpacing: 220 });
    this.add.image(0, 0, 'bg-arena').setOrigin(0, 0).setDepth(0);

    this.walls = [];
    this.addWall(320, 28, 640, 56);
    this.addWall(320, 332, 640, 56);
    this.addWall(8, 180, 16, 360);
    this.addWall(632, 180, 16, 360);

    this.keys = this.input.keyboard.addKeys('W,A,S,D,UP,DOWN,LEFT,RIGHT,J,K,SPACE,SHIFT');
    this.player = new Player(this, 140, H / 2);
    this.physics.add.collider(this.player.sprite, this.walls);

    this.enemies = [];
    this.enemySprites = [];
    const foes = this.battleData.foes && this.battleData.foes.length ? this.battleData.foes : ['skulker'];
    foes.forEach((type, i) => {
      const x = 460 + (i % 2) * 60;
      const y = H / 2 + (i - (foes.length - 1) / 2) * 70;
      const e = new Enemy(this, x, y, type, 'battle', i);
      this.enemies.push(e);
      this.enemySprites.push(e.sprite);
    });
    for (const s of this.enemySprites) this.physics.add.collider(s, this.walls);
    if (this.enemySprites.length > 1) {
      this.physics.add.collider(this.enemySprites, this.enemySprites);
    }
    this.physics.add.collider(this.player.sprite, this.enemySprites);

    createHud(this);

    const intro = this.add.text(W / 2, 120, 'AMBUSH!', {
      fontFamily: 'monospace', fontSize: '28px', color: '#ff5544',
      stroke: '#000000', strokeThickness: 5
    }).setOrigin(0.5).setDepth(30);
    this.tweens.add({
      targets: intro,
      alpha: 0,
      delay: 500,
      duration: 900,
      onComplete: () => {
        intro.destroy();
        this.ambushIntro = false;
      }
    });
  }

  addWall(x, y, w, h) {
    const r = this.add.rectangle(x, y, w, h, 0x000000, 0);
    this.physics.add.existing(r, true);
    this.walls.push(r);
  }

  onPlayerDamaged() {
    this.updateHud();
    if (RunState.hp <= 0) this.endBattle(false);
  }

  onEnemyDead() {
    this.pendingCleanup = true;
  }

  endBattle(win) {
    if (this.over) return;
    this.over = true;
    this.physics.pause();
    this.player.sprite.setVelocity(0, 0);
    this.player.swing.setVisible(false);
    this.add.text(320, 160, win ? 'VICTORY' : 'YOU DIED', {
      fontFamily: 'monospace', fontSize: '30px', color: win ? '#7fd67f' : '#ff5544',
      stroke: '#000000', strokeThickness: 6
    }).setOrigin(0.5).setDepth(30);
    this.time.delayedCall(win ? 1000 : 1500, () => {
      if (win) {
        this.scene.start(this.battleData.fromKey || 'CorridorScene', {
          removeIds: this.battleData.removeIds || []
        });
      } else {
        this.scene.start('EndScene', { win: false });
      }
    });
  }

  update(time, delta) {
    if (this.over || this.ambushIntro) return;
    const dt = delta / 1000;
    this.player.update(dt);
    for (const e of this.enemies) e.update(dt, this.player);
    if (this.pendingCleanup) {
      this.enemies = this.enemies.filter((e) => !e.dead);
      this.pendingCleanup = false;
    }
    if (this.enemies.length === 0) this.endBattle(true);
  }
}
