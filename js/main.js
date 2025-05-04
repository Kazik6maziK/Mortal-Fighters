import { GameEngine } from './core/GameEngine.js'; // Убедитесь что путь правильный
import { Sprite } from './core/Sprite.js';

const gameEngine = new GameEngine();

// Проверьте параметры вашего спрайта!
const scorpionIdle = new Sprite({
    imageSrc: './assets/characters/scorpion/idle.png',
    frameRate: 7,
    frameWidth: 104, // Должно совпадать с реальными размерами
    gap: 5,
    frameBuffer: 10
});

// Важно: проверьте загрузку изображения
scorpionIdle.image.onerror = () => {
    console.error("Failed to load sprite image!");
};

gameEngine.addSprite(scorpionIdle);

// Запуск после полной загрузки
window.addEventListener('load', () => {
    gameEngine.start();
});