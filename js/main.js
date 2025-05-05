import { Sprite } from './core/Sprite.js';
import { InputHandler } from './core/InputHandler.js';

// Конфигурация игры
const CONFIG = {
    BOUNDARY_OFFSET: 0.1, // 10% отступ от краёв
    VERTICAL_POSITION: 15, // % от нижнего края
    MOVEMENT_SPEED: 4,
    MAX_HEALTH: 100,
    ATTACK_RANGE: 100, // Дистанция для попадания
    DAMAGE: {
        punch: 10,
        kick: 15
    },
    FIGHT_RESET_DELAY: 5000, // 5 секунд до перезапуска боя
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
        this.healthBars = {
            scorpion: document.getElementById('scorpion-health'),
            subzero: document.getElementById('subzero-health')
        };
        this.gameOver = false;
        this.init();
    }

    async init() {
        // Инициализация персонажей
        this.characters.scorpion = new Sprite('#scorpion', {
            basePath: 'assets/characters/scorpion',
            startX: window.innerWidth * 0.35, // 15% левее центра
            health: CONFIG.MAX_HEALTH,
            characterId: 'scorpion'
        });

        this.characters.subzero = new Sprite('#subzero', {
            basePath: 'assets/characters/subzero',
            startX: window.innerWidth * 0.65, // 15% правее центра
            health: CONFIG.MAX_HEALTH,
            characterId: 'subzero'
        });

        // Установка начального здоровья
        this.updateHealthBars();

        // Предзагрузка всех анимаций
        await this.preloadAssets();
        
        // Старт игрового цикла
        requestAnimationFrame((timestamp) => this.gameLoop(timestamp));
        
        // Обработчик изменения размера окна
        window.addEventListener('resize', () => this.handleResize());
    }

    async preloadAssets() {
        const loadSprite = (sprite) => {
            const states = [
                'idle', 'walkforward', 'walkback', 
                'punch', 'kick', 
                'hit1', 'hit2', 'hit3',
                'death1', 'fall', 'win'
            ];
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

    updateHealthBars() {
        this.healthBars.scorpion.style.width = `${this.characters.scorpion.health}%`;
        this.healthBars.subzero.style.width = `${this.characters.subzero.health}%`;
    }

    handleResize() {
        // Обновляем позиции персонажей относительно центра
        const centerX = window.innerWidth / 2;
        const offset = window.innerWidth * 0.15; // 15% от ширины окна

        this.characters.scorpion.x = centerX - offset;
        this.characters.subzero.x = centerX + offset;

        Object.values(this.characters).forEach(character => {
            character.updatePosition();
        });
    }

    updateCharacters() {
        this.updateCharacter('scorpion', this.characters.subzero.x);
        this.updateCharacter('subzero', this.characters.scorpion.x);
    }

    checkHit(attacker, defender, attackType) {
        const distance = Math.abs(attacker.x - defender.x);
        if (distance <= CONFIG.ATTACK_RANGE) {
            // Проверяем, что атакующий смотрит в сторону противника
            const isAttackerFacingRight = attacker.direction === 1;
            const isDefenderOnRight = attacker.x < defender.x;
            
            if (isAttackerFacingRight === isDefenderOnRight) {
                const damage = CONFIG.DAMAGE[attackType];
                const isDefeated = defender.takeHit(damage);
                this.updateHealthBars();
                
                if (isDefeated && !this.gameOver) {
                    this.endFight(attacker, defender);
                }
            }
        }
    }

    endFight(winner, loser) {
        this.gameOver = true;
        
        // Запускаем анимации победы/поражения
        winner.win();
        loser.die();

        // Перезапускаем бой через 5 секунд
        setTimeout(() => this.resetFight(), CONFIG.FIGHT_RESET_DELAY);
    }

    resetFight() {
        this.gameOver = false;
        
        // Сбрасываем состояние персонажей
        Object.values(this.characters).forEach(character => {
            character.reset();
        });

        // Обновляем HP-бары
        this.updateHealthBars();

        // Возвращаем персонажей на исходные позиции
        const centerX = window.innerWidth / 2;
        const offset = window.innerWidth * 0.15;
        
        this.characters.scorpion.x = centerX - offset;
        this.characters.subzero.x = centerX + offset;
        
        Object.values(this.characters).forEach(character => {
            character.updatePosition();
        });
    }

    updateCharacter(characterId, opponentX) {
        const character = this.characters[characterId];
        const opponent = characterId === 'scorpion' ? this.characters.subzero : this.characters.scorpion;
        const controls = CONFIG.CONTROLS[characterId];
        
        if (!character.canStartNewAction()) {
            return;
        }

        // Проверка на удары
        const shouldFaceLeft = character.x > opponentX;
        const attackType = this.input.getAttackType(characterId, shouldFaceLeft);
        
        if (attackType) {
            character.setAnimation('idle', attackType);
            this.checkHit(character, opponent, attackType);
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