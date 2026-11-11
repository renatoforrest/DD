class Player {
  constructor(scene, x, y) {
    this.scene = scene;
    this.maxHp = RunState.maxHp;
    this.hp = RunState.hp;
    this.sprite = scene.physics.add.sprite(x, y, 'hero').setDepth(10);
    this.sprite.body.setSize(12, 20).setOffset(3, 5);
    this.sprite.setCollideWorldBounds(true);
    this.speed = 150;
    this.atkCd = 0;
    this.atkTime = 0;
    this.dashCd = 0;
    this.dashTime = 0;
    this.iframes = 0;
    this.facing = new Phaser.Math.Vector2(1, 0);
    this.hitCircle = new Phaser.Geom.Circle(0, 0, 30);
    this.tmpRect = new Phaser.Geom.Rectangle(0, 0, 0, 0);
    this.swing = scene.add.image(x, y, 'swing').setDepth(11).setVisible(false);
    this.swingHits = new Set();
  }

  update(dt) {
    const s = this.scene;
    const k = s.keys;
    const sp = this.sprite;
    this.atkCd = Math.max(0, this.atkCd - dt);
    this.dashCd = Math.max(0, this.dashCd - dt);
    this.iframes = Math.max(0, this.iframes - dt);

    let vx = 0;
    let vy = 0;
    if (k.A.isDown || k.LEFT.isDown) vx -= 1;
    if (k.D.isDown || k.RIGHT.isDown) vx += 1;
    if (k.W.isDown || k.UP.isDown) vy -= 1;
    if (k.S.isDown || k.DOWN.isDown) vy += 1;

    if (this.dashTime > 0) {
      this.dashTime -= dt;
      sp.setVelocity(this.facing.x * 380, this.facing.y * 380);
      sp.setAlpha(0.55);
    } else {
      const len = Math.hypot(vx, vy) || 1;
      if (vx || vy) this.facing.set(vx / len, vy / len);
      sp.setVelocity((vx / len) * this.speed, (vy / len) * this.speed);
      sp.setAlpha(this.iframes > 0 && Math.floor(s.time.now / 80) % 2 === 0 ? 0.35 : 1);
    }

    const atkPressed = Phaser.Input.Keyboard.JustDown(k.J) || Phaser.Input.Keyboard.JustDown(k.SPACE);
    const dashPressed = Phaser.Input.Keyboard.JustDown(k.K) || Phaser.Input.Keyboard.JustDown(k.SHIFT);

    if (dashPressed && this.dashCd <= 0) {
      this.dashTime = 0.16;
      this.dashCd = 0.8;
      this.iframes = Math.max(this.iframes, 0.24);
    }
    if (atkPressed && this.atkCd <= 0 && this.dashTime <= 0) {
      this.atkCd = 0.38;
      this.atkTime = 0.14;
      this.swingHits.clear();
    }

    if (this.atkTime > 0) {
      this.atkTime -= dt;
      const t = Math.max(0, this.atkTime) / 0.14;
      this.swing.setPosition(sp.x + this.facing.x * 22, sp.y + this.facing.y * 16);
      this.swing.setRotation(Math.atan2(this.facing.y, this.facing.x));
      this.swing.setAlpha(t * 0.9).setVisible(true);
      this.hitCircle.setTo(sp.x + this.facing.x * 24, sp.y + this.facing.y * 16, 30);
      for (const e of s.enemies) {
        if (e.dead || this.swingHits.has(e)) continue;
        e.sprite.getBounds(this.tmpRect);
        if (Phaser.Geom.Intersects.CircleToRectangle(this.hitCircle, this.tmpRect)) {
          this.swingHits.add(e);
          e.takeHit(12 + Math.floor(Math.random() * 7), sp.x);
        }
      }
      if (this.atkTime <= 0) this.swing.setVisible(false);
    }
  }

  takeHit(dmg, fromX) {
    if (this.iframes > 0 || this.dashTime > 0 || this.hp <= 0) return false;
    this.hp = Math.max(0, this.hp - dmg);
    RunState.hp = this.hp;
    this.iframes = 0.7;
    const dir = this.sprite.x < fromX ? -1 : 1;
    this.sprite.setVelocity(dir * 300, 0);
    this.sprite.setTintFill(0xff4444);
    this.scene.time.delayedCall(90, () => {
      if (this.sprite.active) this.sprite.clearTint();
    });
    this.scene.cameras.main.shake(110, 0.008);
    this.scene.onPlayerDamaged();
    return true;
  }
}
