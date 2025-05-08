import { Sprite } from './core/Sprite.js';
import { InputHandler } from './core/InputHandler.js';
import { SoundManager } from './core/SoundManager.js';

// Конфигурация игры
const CONFIG = {
    BOUNDARY_OFFSET: 0.1, // 10% отступ от краёв
    VERTICAL_POSITION: 15, // % от нижнего края
    MOVEMENT_SPEED: 4,
    MAX_HEALTH: 100,
    ATTACK_RANGE: 100, // Дистанция для попадания
    DAMAGE: {
        punch: 5,
        kick: 8,
        kickback: 10,
        uppercut: 13
    },
    FIGHT_RESET_DELAY: 5000, // 5 секунд до перезапуска боя
    CONTROLS: {
        scorpion: {
            left: 'a',
            right: 'd',
            duck: 's'
        },
        subzero: {
            left: 'arrowleft',
            right: 'arrowright',
            duck: 'arrowdown'
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
        this.damageBars = {
            scorpion: document.getElementById('scorpion-damage'),
            subzero: document.getElementById('subzero-damage')
        };
        this.gameOver = false;
        this.soundManager = new SoundManager();
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
        
        // Проигрываем звук "Fight!" при старте игры
        this.soundManager.playFightSound();
        
        // Старт игрового цикла
        requestAnimationFrame((timestamp) => this.gameLoop(timestamp));
        
        // Обработчик изменения размера окна
        window.addEventListener('resize', () => this.handleResize());
    }

    async preloadAssets() {
        const loadSprite = (sprite) => {
            const states = [
                'idle', 'walkforward', 'walkback', 
                'punch', 'kick', 'kickback', 'uppercut',
                'hit1', 'hit2', 'hit3',
                'death1', 'fall', 'win',
                'jumping', 'jumping1',
                'ducking', 'ducking1'
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
        // Зеленый бар (текущее HP)
        this.healthBars.scorpion.style.width = `${this.characters.scorpion.health}%`;
        this.healthBars.subzero.style.width = `${this.characters.subzero.health}%`;
        // Красный бар (анимированное "отнятие" HP)
        this.animateDamageBar('scorpion');
        this.animateDamageBar('subzero');
    }

    animateDamageBar(character) {
        const hp = this.characters[character].health;
        const damageBar = this.damageBars[character];
        // Если красный бар уже меньше или равен HP, просто выставляем равным HP
        const currentWidth = parseFloat(damageBar.style.width) || 0;
        if (currentWidth <= hp) {
            damageBar.style.width = hp + '%';
        } else {
            // Анимированное уменьшение до нового HP
            setTimeout(() => {
                damageBar.style.width = hp + '%';
            }, 50);
        }
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
        if (distance <= CONFIG.ATTACK_RANGE && attacker.isAttacking) {
            // Проверяем, что атакующий смотрит в сторону противника
            const isAttackerFacingRight = attacker.direction === 1;
            const isDefenderOnRight = attacker.x < defender.x;
            
            if (isAttackerFacingRight === isDefenderOnRight) {
                // Проигрываем звуки при попадании
                this.soundManager.playBattleCry(); // Звук атакующего
                this.soundManager.playHitSound(); // Звук удара
                this.soundManager.playHitScream(); // Звук получающего урон

                const damage = CONFIG.DAMAGE[attackType];
                const isDefeated = defender.takeHit(damage);
                this.updateHealthBars();
                
                if (isDefeated && !this.gameOver) {
                    this.endFight(attacker, defender);
                }
            } else {
                // Проигрываем звуки при промахе (неправильное направление)
                this.soundManager.playBattleCry(); // Звук атакующего
                this.soundManager.playMissSound(); // Звук промаха
            }
        } else if (attacker.isAttacking) {
            // Проигрываем звуки при промахе (вне зоны досягаемости)
            this.soundManager.playBattleCry(); // Звук атакующего
            this.soundManager.playMissSound(); // Звук промаха
        }
    }

    endFight(winner, loser) {
        this.gameOver = true;
        
        // Запускаем анимации победы/поражения
        winner.win();
        loser.die();

        // Проигрываем звук победы
        const winnerId = winner === this.characters.scorpion ? 'scorpion' : 'subzero';
        this.soundManager.playVictorySound(winnerId);

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

        // Проигрываем звук "Fight!" при перезапуске боя
        this.soundManager.playFightSound();
    }

    updateCharacter(characterId, opponentX) {
        const character = this.characters[characterId];
        const opponent = characterId === 'scorpion' ? this.characters.subzero : this.characters.scorpion;
        const controls = CONFIG.CONTROLS[characterId];
        
        if (!character.canStartNewAction()) {
            return;
        }

        // Проверка на удары (нельзя атаковать во время блока и в приседе)
        const shouldFaceLeft = character.x > opponentX;
        const attackType = this.input.getAttackType(characterId, shouldFaceLeft);
        
        if (attackType && !character.isBlocking && !character.isDucking) {
            character.setAnimation('idle', attackType);
            this.checkHit(character, opponent, attackType);
            return;
        }

        // Проверка на прыжок, приседание и блок
        const moveType = this.input.getMoveType(characterId);
        
        // Проверяем отпускание клавиш
        if (this.input.isJumpKeyReleased(characterId)) {
            character.endJump();
        }
        if (this.input.isDuckKeyReleased(characterId)) {
            character.endDuck();
        }
        if (this.input.isBlockKeyReleased(characterId)) {
            character.endBlock();
            // Если после отпускания блока все еще нажат присед, возвращаемся в присед
            if (this.input.keys[controls.duck]) {
                character.setAnimation('ducking');
            }
        }

        // Обработка приседания и блока
        if (moveType.type === 'blockingduck') {
            character.setAnimation('blockingduck');
            return;
        }
        else if (moveType.type === 'blockingidle') {
            character.setAnimation('blockingidle');
            return;
        }
        else if (moveType.type === 'ducking') {
            character.setAnimation('ducking');
            return;
        }
        else if (moveType.type === 'jumping') {
            character.setAnimation('jumping');
        }

        // Движение (работает только если не в приседе и не в блоке)
        if (!character.isDucking && !character.isBlocking) {
            if (this.input.keys[controls.left]) {
                character.x -= CONFIG.MOVEMENT_SPEED;
                if (!character.isJumping) {
                    character.setAnimation('walkback');
                }
            }
            else if (this.input.keys[controls.right]) {
                character.x += CONFIG.MOVEMENT_SPEED;
                if (!character.isJumping) {
                    character.setAnimation('walkforward');
                }
            }
            else if (!character.isJumping) {
                character.setAnimation('idle');
            }
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

    checkGameOver() {
        if (this.characters.scorpion.health <= 0) {
            this.gameOver = true;
            this.winner = 'subzero';
            this.soundManager.playVictorySound('subzero');
        } else if (this.characters.subzero.health <= 0) {
            this.gameOver = true;
            this.winner = 'scorpion';
            this.soundManager.playVictorySound('scorpion');
        }
    }

    // Показать гифку FIGHT! на 1 секунду
    showFightGif() {
        const fightGif = document.getElementById('fight-gif');
        if (!fightGif) return;
        fightGif.style.display = 'block';
        setTimeout(() => {
            fightGif.style.display = 'none';
        }, 1000);
    }
}

// Переопределим playFightSound чтобы показывать гифку
const origPlayFightSound = SoundManager.prototype.playFightSound;
SoundManager.prototype.playFightSound = function() {
    origPlayFightSound.call(this);
    if (window.gameInstance && typeof window.gameInstance.showFightGif === 'function') {
        window.gameInstance.showFightGif();
    }
};

// Создаем игру и сохраняем ссылку для FIGHT! гифки
window.gameInstance = new Game();