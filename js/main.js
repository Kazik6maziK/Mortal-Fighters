import { GameEngine } from './core/GameEngine.js';
import { Fighter } from './core/Fighter.js';

const gameEngine = new GameEngine();

// Скорпион (справа)
const scorpion = new Fighter({
    position: { x: 600, y: 250 },
    imageSrc: './assets/characters/scorpion/idle.png',
    frameRate: 7,
    frameWidth: 110,
    gap: 7,
    flip: true
});

// Саб-Зиро (слева)
const subzero = new Fighter({
    position: { x: 200, y: 250 },
    imageSrc: './assets/characters/subzero/idle.png',
    frameRate: 12,
    frameWidth: 110, // Подберите под ваши спрайты
    gap: 7,
    flip: false // Зеркально отражаем
});

gameEngine.addFighter(scorpion);
gameEngine.addFighter(subzero);

window.addEventListener('load', () => {
    gameEngine.start();
});