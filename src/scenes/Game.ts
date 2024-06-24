import Phaser from 'phaser';

// Define a custom interface that extends Phaser.GameObjects.Image
interface CustomImage extends Phaser.GameObjects.Image {
  passed: boolean;
}

export default class Demo extends Phaser.Scene {
  speed: number;
  obstacleSpeed: number;
  ceilingY: number;
  floorY: number;
  obstacles: CustomImage[];
  speedIncrement: number;
  score: number;
  logo!: Phaser.GameObjects.Image;
  debugGraphics!: Phaser.GameObjects.Graphics;
  hitboxRadius!: number;
  scoreText!: Phaser.GameObjects.Text;
  cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  spacebar!: Phaser.Input.Keyboard.Key;
  background!: Phaser.GameObjects.TileSprite;
  hitboxWidth: number;  // Define the hitbox width
  hitboxHeight: number; // Define the hitbox height
  startButton!: Phaser.GameObjects.Text; // Define startButton property
  backgroundMusic!: Phaser.Sound.BaseSound; // Define backgroundMusic property
  restartButton!: Phaser.GameObjects.Text; // Define restartButton property
  gameOverFlag: boolean | undefined;
  gameStarted: boolean; // Flag to track if the game has started


  constructor() {
    super('GameScene');
    this.speed = 5;
    this.obstacleSpeed = 3;
    this.ceilingY = 10; // Adjusted ceilingY value
    this.floorY = window.innerHeight - 30; // Adjusted floorY value
    this.obstacles = [];
    this.score = 0; // Initialize score
    this.speedIncrement = 0.1; // Speed increment for each score
    this.hitboxWidth = 50;  // Set the width of the hitbox
    this.hitboxHeight = 30; // Set the height of the hitbox
    this.gameOverFlag = false;
    this.gameStarted = false; // Initialize gameStarted flag

  }

  preload() {
    this.load.image('logo', 'assets/plane.png');
    this.load.image('obstacle', 'assets/obstacle.png');
    this.load.audio('backgroundMusic', 'assets/8bit.mp3'); // Preload background music
    this.load.image('background', 'assets/background.jpg');
  }

  create() {
    // Add tile sprite for background
    this.background = this.add
      .tileSprite(0, 0, window.innerWidth, window.innerHeight, 'background')
      .setOrigin(0, 0)
      .setDisplaySize(window.innerWidth, window.innerHeight);
  
    // Add logo image
    this.logo = this.add.image(200, 300, 'logo');
    this.logo.setScale(0.07);
    this.logo.setSize(
      this.logo.displayWidth * 0.1,
      this.logo.displayHeight * 0.1
    );
    this.logo.setOrigin(0.01, 0.01);
    this.physics.add.existing(this.logo);
    (this.logo.body as Phaser.Physics.Arcade.Body).setGravityY(300);
    (this.logo.body as Phaser.Physics.Arcade.Body).setCollideWorldBounds(true);
  
    // Initialize input keys
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spacebar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
  
    // Create score text
    this.scoreText = this.add.text(16, 16, 'Score: 0', {
      fontSize: '32px',
    });
  
    // Add background music
    this.backgroundMusic = this.sound.add('backgroundMusic');
    this.backgroundMusic.play({ loop: true, volume: 0.1 }); // Play background music with looping and set volume
  
    // Create debug graphics for hitbox
    this.debugGraphics = this.add.graphics();
  
    // Create start game button
    this.startButton = this.add.text(
      this.cameras.main.centerX,
      this.cameras.main.centerY,
      'Start Game',
      {
        fontSize: '32px',
        color: '#ffffff',
        backgroundColor: '#0000ff',
        padding: { left: 10, right: 10, top: 5, bottom: 5 }
      }
    );
    this.startButton.setOrigin(0.5, 0.5);
    this.startButton.setInteractive({ useHandCursor: true });
  
    // Add click event to start the game
    this.startButton.on('pointerdown', () => {
      this.startGame();
    });
  }
  
  startGame() {
    // Hide the start button
    this.startButton.setVisible(false);
  
    // Enable game elements
    this.gameOverFlag = false;
  
    // Reset game state if needed
    this.score = 0;
    this.obstacleSpeed = 3;
    this.scoreText.setText('Score: 0');
    this.obstacles = [];
  
    // Create obstacles
    this.createObstacles();
  }

  createObstacles() {
    for (let i = 0; i < 5; i++) {
      let x = Phaser.Math.Between(window.innerWidth + 100, window.innerWidth + 300); // Spawn off-screen to the right
      let y = Phaser.Math.Between(this.ceilingY, this.floorY);
      let obstacle = this.add.image(x, y, 'obstacle') as CustomImage;

      obstacle.setScale(0.1); // Adjust the scale value as needed

      obstacle.passed = false; // Custom property to check if passed
      this.obstacles.push(obstacle);
    }
  }

  update() {
    if (this.gameOverFlag) {
      return;
    }
    if (!this.gameStarted) {
      // If game hasn't started, disable logo control
      // Optionally, you can add code here to disable or handle the logo control behavior.
    }
    
    if (this.gameStarted && this.spacebar.isDown) {
      // Check if game has started and spacebar is pressed
      (this.logo.body as Phaser.Physics.Arcade.Body).setVelocityY(-200);
    }
    

    // Gradually rotate the logo based on its vertical velocity
    let targetAngle = 0;
    if (this.logo.body.velocity.y > 0) {
      targetAngle = 90; // Rotate downwards
    } else if (this.logo.body.velocity.y < 0) {
      targetAngle = -90; // Rotate upwards
    }

    // Smoothly interpolate the angle
    this.logo.angle = Phaser.Math.Linear(this.logo.angle, targetAngle, 0.01);

    this.background.tilePositionX += 2; // Adjust this value to control the speed

    this.obstacles.forEach(obstacle => {
      obstacle.x -= this.obstacleSpeed;
      if (obstacle.x < -50) { // Once it moves past the left edge
        obstacle.x = Phaser.Math.Between(window.innerWidth + 100, window.innerWidth + 300); // Respawn off-screen to the right
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
    // Calculate hitbox position centered on the logo
    const hitboxX = this.logo.x - this.hitboxWidth / 2;
    const hitboxY = this.logo.y - this.hitboxHeight / 2;

    const hitbox = new Phaser.Geom.Rectangle(
      hitboxX,
      hitboxY,
      this.hitboxWidth,
      this.hitboxHeight
    );

    // Check for collisions with obstacles
    this.obstacles.forEach(obstacle => {
      if (Phaser.Geom.Intersects.RectangleToRectangle(hitbox, obstacle.getBounds())) {
        this.gameOver();
      }
    });

    // Check for collision with the floor or ceiling
    if (this.logo.y - this.logo.displayHeight / 2 <= this.ceilingY) {
      this.gameOver();
    }
  }
  
  
  

  gameOver() {
    this.gameOverFlag = true;
    const gameOverText = this.add.text(
      this.cameras.main.centerX,
      this.cameras.main.centerY,
      'Game Over!',
      {
        fontSize: '64px',
        color: '#ff0000',
      }
    );
    gameOverText.setOrigin(0.5, 0.5);
  
    // Stop background music
    this.backgroundMusic.stop();
  
    // Create restart button
    this.restartButton = this.add.text(
      this.cameras.main.centerX,
      this.cameras.main.centerY + 70, // Position below the game over text
      'Restart',
      {
        fontSize: '32px',
        color: '#00ff00',
        backgroundColor: '#000000',
        padding: { left: 10, right: 10, top: 5, bottom: 5 },
      }
    );
    this.restartButton.setOrigin(0.5, 0.5);
    this.restartButton.setInteractive({ useHandCursor: true }); // Makes the text clickable and changes the cursor to a pointer
  
    // Add click event to restart the game
    this.restartButton.on('pointerdown', () => {
      // Reset the logo's position and velocity
      this.logo.x = 200;
      this.logo.y = 300;
      (this.logo.body as Phaser.Physics.Arcade.Body).setVelocity(0, 0);
      (this.logo.body as Phaser.Physics.Arcade.Body).setGravityY(300);
  
      // Reset game state
      this.score = 0;
      this.obstacleSpeed = 3;
      this.gameOverFlag = false;
      this.scoreText.setText('Score: 0');
      this.obstacles.forEach(obstacle => {
        obstacle.x = Phaser.Math.Between(window.innerWidth + 100, window.innerWidth + 300);
        obstacle.y = Phaser.Math.Between(this.ceilingY, this.floorY);
        obstacle.passed = false;
      });
  
      // Restart the scene
      this.scene.restart();
    });
  }
}
