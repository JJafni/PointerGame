import Phaser from 'phaser';

// Define an interface for custom obstacle images that includes a 'passed' property
interface CustomImage extends Phaser.GameObjects.Image {
  passed: boolean;
}

// Define the main game scene class
export default class Demo extends Phaser.Scene {
  speed: number; // speed of the player (not used in this snippet)
  obstacleSpeed: number; // speed of the obstacles
  ceilingY: number; // Y-coordinate for the ceiling limit
  floorY: number; // Y-coordinate for the floor limit
  obstacles: CustomImage[]; // array to hold obstacle objects
  speedIncrement: number; // value by which the obstacle speed increases
  score: number; // player's score
  logo!: Phaser.GameObjects.Image; // player object (logo image)
  debugGraphics!: Phaser.GameObjects.Graphics; // graphics object for debugging
  hitboxRadius!: number; // hitbox radius for collision detection (not used in this snippet)
  scoreText!: Phaser.GameObjects.Text; // text object to display the score
  cursors!: Phaser.Types.Input.Keyboard.CursorKeys; // cursor keys for input
  spacebar!: Phaser.Input.Keyboard.Key; // spacebar key for input
  background!: Phaser.GameObjects.TileSprite; // background image
  hitboxWidth: number; // width of the hitbox for collision detection
  hitboxHeight: number; // height of the hitbox for collision detection
  startButton!: Phaser.GameObjects.Text; // start button text object
  backgroundMusic!: Phaser.Sound.BaseSound; // background music object
  restartButton!: Phaser.GameObjects.Text; // restart button text object
  gameOverFlag: boolean | undefined; // flag to check if the game is over
  gameStarted: boolean; // flag to check if the game has started
  cornerLogo!: Phaser.GameObjects.Image; // logo displayed in the corner of the screen

  // Constructor to initialize the game scene
  constructor() {
    super('GameScene');
    this.speed = 5;
    this.obstacleSpeed = 3;
    this.ceilingY = 50;
    this.floorY = window.innerHeight - 30;
    this.obstacles = [];
    this.score = 0;
    this.speedIncrement = 0.1;
    this.hitboxWidth = 50;
    this.hitboxHeight = 30;
    this.gameOverFlag = false;
    this.gameStarted = false;
  }

  // Preload assets before the game starts
  preload() {
    this.load.image('logo', 'assets/plane.png'); // load player image
    this.load.image('obstacle', 'assets/obstacle.png'); // load obstacle image
    this.load.audio('backgroundMusic', 'assets/8bit.mp3'); // load background music
    this.load.image('background', 'assets/background.jpg'); // load background image
    this.load.audio('collisionSound', 'assets/trigger.mp3'); // load collision sound
    this.load.image('cornerLogo', 'assets/logo.png'); // load corner logo image
  }

  // Create game objects and initialize game state
  create() {
    // Set up the background image
    this.background = this.add
      .tileSprite(0, 0, window.innerWidth, window.innerHeight, 'background')
      .setOrigin(0, 0)
      .setDisplaySize(window.innerWidth, window.innerHeight);

    // Set up the player (logo) image
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

    // Set up the corner logo image
    this.cornerLogo = this.add.image(window.innerWidth - 50, window.innerHeight - 50, 'cornerLogo');
    this.cornerLogo.setScale(0.05);
    this.cornerLogo.setOrigin(13.7, 0.5);

    // Set up input controls
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spacebar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // Set up the score text
    this.scoreText = this.add.text(16, 16, 'Score: 0', {
      fontSize: '32px',
    });

    // Play background music
    this.backgroundMusic = this.sound.add('backgroundMusic');
    this.backgroundMusic.play({ loop: true, volume: 0.1 });

    // Create graphics object for debugging (not used in this snippet)
    this.debugGraphics = this.add.graphics();

    // Set up the start button
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

    // Add event listener to start the game when the start button is clicked
    this.startButton.on('pointerdown', () => {
      this.startGame();
    });
  }

  // Start the game: reset game state and create obstacles
  startGame() {
    this.startButton.setVisible(false);
    this.gameOverFlag = false;
    this.score = 0;
    this.obstacleSpeed = 3;
    this.scoreText.setText('Score: 0');
    this.obstacles = [];
    this.createObstacles();
  }

  // Create obstacles at random positions
  createObstacles() {
    for (let i = 0; i < 5; i++) {
      let x = Phaser.Math.Between(window.innerWidth + 100, window.innerWidth + 300);
      let y = Phaser.Math.Between(this.ceilingY, this.floorY);
      let obstacle = this.add.image(x, y, 'obstacle') as CustomImage;
      obstacle.setScale(0.1);
      obstacle.passed = false;
      this.obstacles.push(obstacle);
    }
  }

  // Update game state in each frame
  update() {
    if (this.gameOverFlag) {
      return;
    }

    // Apply upward force when the spacebar is pressed
    if (this.spacebar.isDown) {
      (this.logo.body as Phaser.Physics.Arcade.Body).setVelocityY(-200);
    }

    // Rotate the player based on its velocity
    let targetAngle = 0;
    if (this.logo.body.velocity.y > 0) {
      targetAngle = 90;
    } else if (this.logo.body.velocity.y < 0) {
      targetAngle = -90;
    }
    this.logo.angle = Phaser.Math.Linear(this.logo.angle, targetAngle, 0.01);

    // Move the background to create a scrolling effect
    this.background.tilePositionX += 2;

    // Move obstacles and check if they pass the player
    this.obstacles.forEach(obstacle => {
      obstacle.x -= this.obstacleSpeed;
      if (obstacle.x < -50) {
        // Reposition obstacle if it moves out of the screen
        obstacle.x = Phaser.Math.Between(window.innerWidth + 100, window.innerWidth + 300);
        obstacle.y = Phaser.Math.Between(this.ceilingY, this.floorY);
        obstacle.passed = false;
      } else if (!obstacle.passed && obstacle.x < this.logo.x) {
        // Increase score and speed if the player passes an obstacle
        obstacle.passed = true;
        this.score++;
        this.obstacleSpeed += this.speedIncrement;
        this.scoreText.setText('Score: ' + this.score);
      }
    });

    // Check for collisions between the player and obstacles
    this.checkCollisions();
  }

  // Check for collisions between the player and obstacles
  checkCollisions() {
    const hitboxX = this.logo.x - this.hitboxWidth / 2;
    const hitboxY = this.logo.y - this.hitboxHeight / 2;
    const hitbox = new Phaser.Geom.Rectangle(
      hitboxX,
      hitboxY,
      this.hitboxWidth,
      this.hitboxHeight
    );

    this.obstacles.forEach(obstacle => {
      if (Phaser.Geom.Intersects.RectangleToRectangle(hitbox, obstacle.getBounds())) {
        this.gameOver();
        this.sound.play('collisionSound');
      }
    });
  }

  // Handle game over state
  gameOver() {
    this.gameOverFlag = true;

    // Display game over text
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

    // Display restart button
    this.restartButton = this.add.text(
      this.cameras.main.centerX,
      this.cameras.main.centerY + 70,
      'Restart',
      {
        fontSize: '32px',
        color: '#00ff00',
        backgroundColor: '#000000',
        padding: { left: 10, right: 10, top: 5, bottom: 5 },
      }
    );
    this.restartButton.setOrigin(0.5, 0.5);
    this.restartButton.setInteractive({ useHandCursor: true });

    // Add event listener to restart the game when the restart button is clicked
    this.restartButton.on('pointerdown', () => {
      this.scene.restart();
    });
  }
}
