import Phaser from 'phaser';

export default class Demo extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.speed = 2; // Adjust the speed as needed
  }

  preload() {
    this.load.image('logo', 'assets/plane.png');
  }

  create() {
    this.logo = this.add.image(400, 70, 'logo');
    this.cursors = this.input.keyboard.createCursorKeys();
  }

  update() {
    if (this.cursors.up.isDown) {
      this.logo.y -= this.speed;
    } else if (this.cursors.down.isDown) {
      this.logo.y += this.speed;
    }
  }
}
