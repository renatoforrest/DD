class EndScene extends Phaser.Scene {
  constructor() {
    super('EndScene');
  }

  init(data) {
    this.result = data || {};
  }

  create() {
    const win = !!this.result.win;
    this.add.rectangle(320, 180, 640, 360, 0x050508).setDepth(0);
    this.add.text(320, 140, win ? 'THE DUNGEON IS CLEARED' : 'YOU DIED IN THE DARK', {
      fontFamily: 'monospace', fontSize: '24px', color: win ? '#7fd67f' : '#ff5544',
      stroke: '#000000', strokeThickness: 5
    }).setOrigin(0.5).setDepth(10);
    this.add.text(320, 190, win
      ? 'You fought through every corridor and room.'
      : `You fell at depth ${RunState.depth + 1}/${RunState.total}.`, {
      fontFamily: 'monospace', fontSize: '12px', color: '#9aa0b4'
    }).setOrigin(0.5).setDepth(10);
    this.add.text(320, 240, 'Press ENTER for a new run', {
      fontFamily: 'monospace', fontSize: '14px', color: '#e8e2d0'
    }).setOrigin(0.5).setDepth(10);
    this.keys = this.input.keyboard.addKeys('ENTER');
  }

  update() {
    if (Phaser.Input.Keyboard.JustDown(this.keys.ENTER)) {
      RunState.newRun();
      this.scene.start('CorridorScene', {});
    }
  }
}
