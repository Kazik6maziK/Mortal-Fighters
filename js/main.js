import { GameEngine } from './core/GameEngine.js';
import { CONFIG } from './config.js';

const game = new GameEngine(CONFIG);
game.initialize();
game.start();