import Phaser from 'phaser';

export default class Demo extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.speed = 10;
    this.obstacleSpeed = 3;
    this.ceilingY = 50; 
    this.floorY = 500;
    this.obstacles = [];
  }

  preload() {
    this.load.image('logo', 'assets/plane.png');
    this.load.image('obstacle', 'assets/obstacle.png');
  }

  create() {
    this.logo = this.add.image(200, 300, 'logo');
    this.logo.setScale(0.2);
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spacebar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.createObstacles();
  }

  createObstacles() {
    for (let i = 0; i < 5; i++) {
      let x = Phaser.Math.Between(800, 1000); // Start off-screen to the right
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

    this.obstacles.forEach(obstacle => {
      obstacle.x -= this.obstacleSpeed; // Move each obstacle to the left
      if (obstacle.x < -50) { // Reset obstacle position if it moves off-screen
        obstacle.x = Phaser.Math.Between(800, 1000);
        obstacle.y = Phaser.Math.Between(this.ceilingY, this.floorY);
      }
    });

    this.checkCollisions();
  }

  checkCollisions() {
    this.obstacles.forEach(obstacle => {
      if (Phaser.Geom.Intersects.RectangleToRectangle(this.logo.getBounds(), obstacle.getBounds())) {
        this.gameOver();
      }
    });
  }

  gameOver() {
    // Handle game over logic, e.g., stop the game, display a message, etc.
    this.scene.pause();
    
    // Create a text object to display 'Game Over'
    const gameOverText = this.add.text(
        this.cameras.main.centerX, // X position (center of the screen)
        this.cameras.main.centerY, // Y position (center of the screen)
        'Game Over!', // Text to display
        {
            fontSize: '64px', // Font size
            color: '#ff0000'  // Font color
        }
    );
    
    // Center the text object
    gameOverText.setOrigin(0.5, 0.5);
}

}