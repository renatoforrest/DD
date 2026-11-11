class CorridorScene extends TravelScene {
  constructor() {
    super('CorridorScene');
    this.worldWidth = 1400;
    this.wallTop = 70;
    this.wallBottom = 70;
  }

  bgKey() {
    return 'bg-corridor';
  }

  bgOpts() {
    return { wallTop: this.wallTop, wallBottom: this.wallBottom, floor: '#232330', torchSpacing: 200 };
  }
}
