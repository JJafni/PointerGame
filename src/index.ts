import Phaser from 'phaser';
import FlappyBirdGame from './scenes/Game';
import config from './config';

new Phaser.Game(
  Object.assign(config, {
    scene: [FlappyBirdGame]
  })
);

