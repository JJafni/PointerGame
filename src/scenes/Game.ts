import Phaser from 'phaser';

export default class Demo extends Phaser.Scene {
  speed: number;
  obstacleSpeed: number;
  ceilingY: number;
  floorY: number;
  obstacles: Phaser.GameObjects.Image[];
  speedIncrement: number;
  score: number;
  constructor() {
    super('GameScene');
    this.speed = 5;
    this.obstacleSpeed = 3;
    this.ceilingY = 50; 
    this.floorY = 500;
    this.obstacles = [];
    this.score = 0; // Initialize score
    this.speedIncrement = 0.1; // Speed increment for each score
  }

  preload() {
    this.load.image('logo', 'assets/plane.png');
    this.load.image('obstacle', 'assets/obstacle.png');
    this.load.audio('backgroundMusic', 'assets/8bit.mp3'); // Preload background music
    this.load.image('background', 'assets/background.jpg');
  }
  create() {
    // Add tile sprite for background
    this.background = this.add.tileSprite(0, 0, window.innerWidth, window.innerHeight, 'background')
        .setOrigin(0, 0)
        .setDisplaySize(window.innerWidth, window.innerHeight);

    // Add logo image
    this.logo = this.add.image(200, 300, 'logo');
    this.logo.setScale(0.07);
    this.logo.setSize(this.logo.displayWidth * 0.1, this.logo.displayHeight * 0.1);
    this.logo.setOrigin(0.01, 0.01);

    // Initialize input keys
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spacebar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // Create obstacles
    this.createObstacles();

    // Create score text
    this.scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#fff' });

    // Add background music
    this.backgroundMusic = this.sound.add('backgroundMusic');
    this.backgroundMusic.play({ loop: true, volume: 0.1 }); // Play background music with looping and set volume
}
  

  createObstacles() {
    for (let i = 0; i < 5; i++) {
      let x = Phaser.Math.Between(800, 1000);
      let y = Phaser.Math.Between(this.ceilingY, this.floorY);
      let obstacle = this.add.image(x, y, 'obstacle');

      obstacle.setScale(0.1); // Adjust the scale value as needed

      obstacle.passed = false; // Custom property to check if passed
      this.obstacles.push(obstacle);
    }
  }

  update() {
    if (this.spacebar.isDown && this.logo.y > this.ceilingY) {
        this.logo.y -= this.speed;
        this.logo.angle = 0;  // Points to the right
    } else if (this.logo.y < this.floorY) {
        this.logo.y += this.speed;
        this.logo.angle = 0;  // Points to the right and a bit downwards
    }
    this.background.tilePositionX += 2; // Adjust this value to control the speed


    this.obstacles.forEach(obstacle => {
      obstacle.x -= this.obstacleSpeed;
      if (obstacle.x < -50) {
        obstacle.x = Phaser.Math.Between(800, 1000);
        obstacle.y = Phaser.Math.Between(this.ceilingY, this.floorY);
        obstacle.passed = false; // Reset passed status
      } else if (!obstacle.passed && obstacle.x < this.logo.x) {
        obstacle.passed = true;
        this.score++; // Increment score
        this.obstacleSpeed += this.speedIncrement; // Increase obstacle speed
        this.scoreText.setText('Score: ' + this.score); // Update score text
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
    this.scene.pause();
    const gameOverText = this.add.text(
        this.cameras.main.centerX,
        this.cameras.main.centerY,
        'Game Over!',
        {
            fontSize: '64px',
            color: '#ff0000'
        }
    );
    gameOverText.setOrigin(0.5, 0.5);

    // Stop background music
    this.backgroundMusic.stop();

    // Create a restart button
    const restartButton = this.add.text(
        this.cameras.main.centerX,
        this.cameras.main.centerY + 70, // Position below the game over text
        'Restart',
        {
            fontSize: '32px',
            color: '#00ff00',
            backgroundColor: '#000000',
            padding: { left: 10, right: 10, top: 5, bottom: 5 }
        }
    );
    restartButton.setOrigin(0.5, 0.5);
    restartButton.setInteractive({ useHandCursor: true }); // Makes the text clickable and changes the cursor to a pointer

    // Add click event to restart the game
    restartButton.on('pointerdown', () => {
        this.scene.restart(); // This restarts the current scene
    });
}
}
