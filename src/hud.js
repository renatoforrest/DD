function createHud(scene) {
  scene.add.rectangle(10, 10, 104, 12, 0x000000, 0.55)
    .setOrigin(0, 0).setScrollFactor(0).setDepth(40);
  scene.hpFg = scene.add.rectangle(12, 12, 100, 8, 0xb8322a)
    .setOrigin(0, 0).setScrollFactor(0).setDepth(41);
  scene.add.text(630, 8, `DEPTH ${RunState.depth + 1}/${RunState.total}`, {
    fontFamily: 'monospace', fontSize: '10px', color: '#9aa0b4'
  }).setOrigin(1, 0).setScrollFactor(0).setDepth(40);

  scene.updateHud = () => {
    scene.hpFg.scaleX = Math.max(0, RunState.hp / RunState.maxHp);
  };
  scene.updateHud();

  const hint = scene.add.text(10, 344, 'WASD move   J/SPACE attack   K/SHIFT dash', {
    fontFamily: 'monospace', fontSize: '10px', color: '#6b7186'
  }).setScrollFactor(0).setDepth(40);
  scene.tweens.add({
    targets: hint,
    alpha: 0,
    delay: 6000,
    duration: 1200,
    onComplete: () => hint.destroy()
  });
}
