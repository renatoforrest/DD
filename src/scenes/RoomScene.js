class RoomScene extends TravelScene {
  constructor() {
    super('RoomScene');
    this.worldWidth = 1000;
    this.wallTop = 90;
    this.wallBottom = 90;
  }

  bgKey() {
    return 'bg-room';
  }

  bgOpts() {
    return { wallTop: this.wallTop, wallBottom: this.wallBottom, floor: '#26222e', torchSpacing: 260, pillars: true };
  }
}
