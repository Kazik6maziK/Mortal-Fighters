import { GameEngine } from './core/GameEngine.js';
import { Sprite } from './core/Sprite.js';

// Инициализация игрового движка
const gameEngine = new GameEngine();

// Создание спрайта (параметры укажите свои)
const scorpionIdle = new Sprite({
    imageSrc: './assets/characters/scorpion/idle.png',
    frameRate: 7,
    frameWidth: 104,
    gap: 10,
    frameBuffer: 7
});

// Добавление спрайта в движок
gameEngine.addSprite(scorpionIdle);

// Запуск после загрузки изображения
scorpionIdle.image.onload = () => {
    gameEngine.start();
};