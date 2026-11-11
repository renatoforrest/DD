const RunState = {
  maxHp: 100,
  hp: 100,
  depth: 0,
  total: 6,
  plan: [],

  newRun() {
    this.hp = this.maxHp;
    this.depth = 0;
    this.plan = [];
    for (let i = 0; i < this.total; i++) {
      const kind = i % 2 === 0 ? 'Corridor' : 'Room';
      let enemies = [];
      if (i === 0) {
        if (Math.random() < 0.5) enemies = ['skulker'];
      } else if (i === this.total - 1) {
        enemies = ['boss'];
        const adds = Phaser.Math.Between(1, 2);
        for (let a = 0; a < adds; a++) enemies.push('skulker');
      } else if (kind === 'Corridor') {
        const n = Phaser.Math.Between(0, 2);
        for (let a = 0; a < n; a++) enemies.push(Math.random() < 0.6 ? 'skulker' : 'brute');
      } else {
        const n = Phaser.Math.Between(1, 2);
        for (let a = 0; a < n; a++) enemies.push(Math.random() < 0.5 ? 'skulker' : 'brute');
      }
      this.plan.push({ kind, enemies });
    }
  },

  current() {
    return this.plan[this.depth];
  }
};
