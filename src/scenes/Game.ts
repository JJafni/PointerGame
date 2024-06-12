import Phaser from 'phaser';

export default class Demo extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.speed = 15; // Adjust the speed as needed
    this.ceilingY = 50; // Adjust the ceiling position as needed
    this.floorY = 500; // Adjust the floor position as needed
  }

  preload() {
    this.load.image('logo', 'assets/plane.png');
  }

  create() {
    this.logo = this.add.image(400, 300, 'logo'); // Adjust initial position as needed
    this.logo.setScale(0.5); // Adjust the scale as needed
    this.cursors = this.input.keyboard.createCursorKeys();
  }

  update() {
    if (this.cursors.up.isDown && this.logo.y > this.ceilingY) {
      this.logo.y -= this.speed;
    } else if (this.cursors.down.isDown && this.logo.y < this.floorY) {
      this.logo.y += this.speed;
    }
  }
}
