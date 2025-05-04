import { Sprite } from './core/Sprite.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Настройка размеров canvas
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Параметры спрайта (подставьте свои значения)
const scorpionIdle = new Sprite({
    imageSrc: './assets/characters/scorpion/idle.png',
    frameRate: 7,    // Количество кадров
    frameWidth: 104,  // Ширина одного кадра
    gap: 10,          // Расстояние между кадрами
    frameBuffer: 7    // Скорость анимации
});

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    scorpionIdle.update();
    scorpionIdle.draw(ctx, canvas);
    requestAnimationFrame(animate);
}

// Запуск анимации после загрузки
scorpionIdle.image.onload = () => {
    animate();
};