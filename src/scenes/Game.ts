import Phaser from 'phaser';

export default class Demo extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.speed = 10;
    this.ceilingY = 50; 
    this.floorY = 500;
    this.obstacles = [];
  }

  preload() {
    this.load.image('logo', 'assets/plane.png');
    this.load.image('obstacle', 'assets/obstacle.png'); // Ensure you have an obstacle image in assets
  }

  create() {
    this.logo = this.add.image(200, 300, 'logo');
    this.logo.setScale(0.2);
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spacebar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.createObstacles();
  }

  createObstacles() {
    for (let i = 0; i < 5; i++) { // Create 5 obstacles
      let x = Phaser.Math.Between(100, 700);
      let y = Phaser.Math.Between(this.ceilingY, this.floorY);
      let obstacle = this.add.image(x, y, 'obstacle');
      this.obstacles.push(obstacle);
    }
  }

  update() {
    if (this.spacebar.isDown && this.logo.y > this.ceilingY) {
      this.logo.y -= this.speed;
    } else if (this.logo.y < this.floorY) {
      this.logo.y += this.speed;
    }

    // Optionally, move obstacles or check for collisions
  }
}