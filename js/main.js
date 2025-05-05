import { Sprite } from './core/Sprite.js';
import { InputHandler } from './core/InputHandler.js';

// Конфигурация игры
const CONFIG = {
    BOUNDARY_OFFSET: 0.1, // 10% отступ от краёв
    VERTICAL_POSITION: 15, // % от нижнего края
    MOVEMENT_SPEED: 4,
    CONTROLS: {
        scorpion: {
            left: 'a',
            right: 'd'
        },
        subzero: {
            left: 'arrowleft',
            right: 'arrowright'
        }
    }
};

class Game {
    constructor() {
        this.input = new InputHandler();
        this.characters = {};
        this.lastTime = 0;
        this.init();
    }

    async init() {
        // Инициализация персонажей
        this.characters.scorpion = new Sprite('#scorpion', {
            basePath: 'assets/characters/scorpion',
            startX: window.innerWidth * 0.3
        });

        this.characters.subzero = new Sprite('#subzero', {
            basePath: 'assets/characters/subzero',
            startX: window.innerWidth * 0.7
        });

        // Предзагрузка всех анимаций
        await this.preloadAssets();
        
        // Старт игрового цикла
        requestAnimationFrame((timestamp) => this.gameLoop(timestamp));
        
        // Обработчик изменения размера окна
        window.addEventListener('resize', () => this.handleResize());
    }

    async preloadAssets() {
        const loadSprite = (sprite) => {
            const states = ['idle', 'walkforward', 'walkback', 'punch', 'kick'];
            return Promise.all(states.map(state => {
                return new Promise(resolve => {
                    const img = new Image();
                    img.src = `${sprite.config.basePath}/${state}.gif`;
                    img.onload = () => resolve();
                });
            }));
        };

        await Promise.all([
            loadSprite(this.characters.scorpion),
            loadSprite(this.characters.subzero)
        ]);
    }

    handleResize() {
        Object.values(this.characters).forEach(character => {
            const minX = window.innerWidth * CONFIG.BOUNDARY_OFFSET + character.width/2;
            const maxX = window.innerWidth * (1 - CONFIG.BOUNDARY_OFFSET) - character.width/2;
            character.x = Math.max(minX, Math.min(character.x, maxX));
            character.updatePosition();
        });
    }

    updateCharacters() {
        this.updateCharacter('scorpion', this.characters.subzero.x);
        this.updateCharacter('subzero', this.characters.scorpion.x);
    }

    updateCharacter(characterId, opponentX) {
        const character = this.characters[characterId];
        const controls = CONFIG.CONTROLS[characterId];
        
        if (!character.canStartNewAction()) {
            return;
        }

        // Проверка на удары
        const shouldFaceLeft = character.x > opponentX;
        const attackType = this.input.getAttackType(characterId, shouldFaceLeft);
        
        if (attackType) {
            character.setAnimation('idle', attackType);
            return;
        }

        // Движение
        if (this.input.keys[controls.left]) {
            character.x -= CONFIG.MOVEMENT_SPEED;
            character.setAnimation('walkback');
        }
        else if (this.input.keys[controls.right]) {
            character.x += CONFIG.MOVEMENT_SPEED;
            character.setAnimation('walkforward');
        }
        else {
            character.setAnimation('idle');
        }

        // Разворот персонажа
        character.updateDirection(shouldFaceLeft ? -1 : 1);

        // Обновление позиции с учётом границ
        const minX = window.innerWidth * CONFIG.BOUNDARY_OFFSET + character.width/2;
        const maxX = window.innerWidth * (1 - CONFIG.BOUNDARY_OFFSET) - character.width/2;
        character.x = Math.max(minX, Math.min(character.x, maxX));
        character.updatePosition();
    }

    gameLoop(timestamp) {
        const deltaTime = timestamp - this.lastTime;
        
        if (deltaTime > 16) { // ~60 FPS
            this.updateCharacters();
            this.lastTime = timestamp;
        }

        requestAnimationFrame((newTimestamp) => this.gameLoop(newTimestamp));
    }
}

// Запуск игры
new Game();