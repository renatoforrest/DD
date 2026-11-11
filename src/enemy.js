const ENEMY_TYPES = {
  skulker: { tex: 'enemy-skulker', hp: 30, speed: 75, dmg: 8, range: 26, windup: 0.42, recover: 0.55, aggro: 160, scale: 1, body: [12, 20, 2, 3] },
  brute: { tex: 'enemy-brute', hp: 70, speed: 42, dmg: 16, range: 34, windup: 0.65, recover: 0.9, aggro: 150, scale: 1, body: [20, 24, 3, 4] },
  boss: { tex: 'enemy-brute', hp: 170, speed: 55, dmg: 22, range: 38, windup: 0.5, recover: 0.7, aggro: 220, scale: 1.35, tint: 0xff6a55, body: [20, 24, 3, 4] }
};

class Enemy {
  constructor(scene, x, y, typeKey, mode, id) {
    const t = ENEMY_TYPES[typeKey];
    this.type = typeKey;
    this.cfg = t;
    this.id = id;
    this.mode = mode;
    this.scene = scene;
    this.hp = t.hp;
    this.maxHp = t.hp;
    this.dead = false;
    this.state = 'idle';
    this.stateTime = 0;
    this.wanderTimer = 0;
    this.wanderDir = new Phaser.Math.Vector2(0, 0);
    this.sprite = scene.physics.add.sprite(x, y, t.tex).setDepth(9);
    this.sprite.setScale(t.scale);
    this.sprite.body.setSize(t.body[0], t.body[1]).setOffset(t.body[2], t.body[3]);
    this.sprite.setCollideWorldBounds(true);
    if (t.tint) this.sprite.setTint(t.tint);
    if (mode === 'battle') {
      const by = this.sprite.y - 24 * t.scale;
      this.barBg = scene.add.rectangle(this.sprite.x, by, 32, 5, 0x000000, 0.65).setDepth(20);
      this.barFg = scene.add.rectangle(this.sprite.x - 15, by, 30, 3, 0xd23b2f).setOrigin(0, 0.5).setDepth(21);
    }
  }

  updateBars() {
    if (this.barFg) this.barFg.scaleX = Math.max(0, this.hp / this.maxHp);
  }

  update(dt, player) {
    if (this.dead) return;
    const sp = this.sprite;
    const ps = player.sprite;
    const dist = Phaser.Math.Distance.Between(sp.x, sp.y, ps.x, ps.y);
    this.stateTime += dt;

    if (this.mode === 'travel') {
      if (dist < 26) {
        this.scene.triggerAmbush(this);
        return;
      }
      if (dist < this.cfg.aggro) {
        this.scene.physics.moveTo(sp, ps.x, ps.y, this.cfg.speed * 0.8);
      } else {
        this.wanderTimer -= dt;
        if (this.wanderTimer <= 0) {
          this.wanderTimer = 1.2 + Math.random() * 1.2;
          if (Math.random() < 0.4) this.wanderDir.set(0, 0);
          else this.wanderDir.setToPolar(Math.random() * Math.PI * 2, 1);
        }
        sp.setVelocity(this.wanderDir.x * 26, this.wanderDir.y * 26);
      }
      return;
    }

    switch (this.state) {
      case 'idle':
        if (dist > this.cfg.range * 0.85) {
          this.scene.physics.moveTo(sp, ps.x, ps.y, this.cfg.speed);
        } else {
          sp.setVelocity(0, 0);
          this.state = 'windup';
          this.stateTime = 0;
          sp.setTintFill(0xffb347);
        }
        break;
      case 'windup':
        sp.setVelocity(0, 0);
        if (this.stateTime >= this.cfg.windup) {
          this.state = 'strike';
          this.stateTime = 0;
          sp.clearTint();
          if (this.cfg.tint) sp.setTint(this.cfg.tint);
          this.scene.physics.moveTo(sp, ps.x, ps.y, this.cfg.speed * 3);
        }
        break;
      case 'strike':
        if (dist < this.cfg.range + 12) player.takeHit(this.cfg.dmg, sp.x);
        if (this.stateTime >= 0.18) {
          this.state = 'recover';
          this.stateTime = 0;
          sp.setVelocity(0, 0);
        }
        break;
      case 'recover':
        if (this.stateTime >= this.cfg.recover) {
          this.state = 'idle';
          this.stateTime = 0;
        }
        break;
    }
  }

  takeHit(dmg, fromX) {
    if (this.dead) return;
    this.hp -= dmg;
    this.updateBars();
    const sp = this.sprite;
    const dir = sp.x < fromX ? -1 : 1;
    sp.setVelocity(dir * 220, 0);
    sp.setTintFill(0xffffff);
    this.scene.time.delayedCall(70, () => {
      if (!this.dead && sp.active) {
        sp.clearTint();
        if (this.cfg.tint) sp.setTint(this.cfg.tint);
      }
    });
    if (this.hp <= 0) this.die();
  }

  die() {
    this.dead = true;
    this.sprite.setActive(false).setVisible(false);
    this.sprite.body.enable = false;
    if (this.barBg) this.barBg.destroy();
    if (this.barFg) this.barFg.destroy();
    this.scene.onEnemyDead(this);
  }
}
