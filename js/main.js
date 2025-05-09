import { Sprite } from './core/Sprite.js';
import { InputHandler } from './core/InputHandler.js';
import { SoundManager } from './core/SoundManager.js';
import { BloodEffect } from './core/BloodEffect.js';

// Конфигурация игры
const CONFIG = {
    BOUNDARY_OFFSET: 0.1, // 10% отступ от краёв
    VERTICAL_POSITION: 15, // % от нижнего края
    MOVEMENT_SPEED: 4,
    MAX_HEALTH: 100,
    ATTACK_RANGE: 125, // Дистанция для попадания
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
            scorpion: {
                main: document.getElementById('scorpion-health'),
                damage: document.getElementById('scorpion-health-damage')
            },
            subzero: {
                main: document.getElementById('subzero-health'),
                damage: document.getElementById('subzero-health-damage')
            }
        };
        this.fightAnimation = document.getElementById('fight-animation');
        this.gameOver = false;
        this.soundManager = new SoundManager();
        this.init();
    }

    async init() {
        // Инициализация персонажей
        this.characters.scorpion = new Sprite('#scorpion', {
            basePath: 'assets/characters/scorpion',
            startX: 800 * 0.35, // 35% от ширины окна
            health: CONFIG.MAX_HEALTH,
            characterId: 'scorpion'
        });

        this.characters.subzero = new Sprite('#subzero', {
            basePath: 'assets/characters/subzero',
            startX: 800 * 0.65, // 65% от ширины окна
            health: CONFIG.MAX_HEALTH,
            characterId: 'subzero'
        });

        // Установка начального здоровья
        this.updateHealthBars();

        // Предзагрузка всех анимаций и звуков
        await Promise.all([
            this.preloadAssets(),
            this.soundManager.preloadSounds()
        ]);
        
        // Показываем анимацию "Fight!" и проигрываем звук
        this.showFightAnimation();
        
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

    showFightAnimation() {
        this.fightAnimation.classList.add('show');
        this.soundManager.playFightSound();
        
        // Скрываем анимацию через 1 секунду
        setTimeout(() => {
            this.fightAnimation.classList.remove('show');
        }, 1000);
    }

    updateHealthBars() {
        Object.entries(this.characters).forEach(([id, character]) => {
            const healthPercent = (character.health / CONFIG.MAX_HEALTH) * 100;
            const healthBars = this.healthBars[id];
            
            // Обновляем основной индикатор здоровья
            healthBars.main.style.width = `${healthPercent}%`;
            
            // Обновляем индикатор урона с задержкой
            setTimeout(() => {
                healthBars.damage.style.width = `${healthPercent}%`;
            }, 300);
        });
    }

    handleResize() {
        // Обновляем позиции персонажей относительно центра
        const centerX = 800; // Фиксированная ширина окна
        const offset = 800 * 0.15; // 15% от ширины окна

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

                // Создаем эффект крови на персонаже
                const defenderElement = document.getElementById(defender.characterId);
                const defenderRect = defenderElement.getBoundingClientRect();
                const bloodX = defenderRect.left + defenderRect.width / 2;
                const bloodY = defenderRect.top + defenderRect.height / 2;
                new BloodEffect(bloodX, bloodY);

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
        const centerX = 800; // Фиксированная ширина окна
        const offset = 800 * 0.15; // 15% от ширины окна
        
        this.characters.scorpion.x = centerX - offset;
        this.characters.subzero.x = centerX + offset;
        
        Object.values(this.characters).forEach(character => {
            character.updatePosition();
        });

        // Показываем анимацию "Fight!" и проигрываем звук при перезапуске боя
        this.showFightAnimation();
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
        const minX = 800 * 0.05 + character.width / 2;
        const maxX = 800 * 0.95 - character.width / 2;
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
}

// Запуск игры
// new Game();

// --- Стартовое меню Mortal Kombat ---
window.addEventListener('DOMContentLoaded', () => {
    const menu = document.getElementById('start-menu');
    const btnPlay = document.getElementById('btn-play');
    const btnControls = document.getElementById('btn-controls');
    const btnAbout = document.getElementById('btn-about');
    const fightAnimation = document.getElementById('fight-animation');

    // Скрываем гифку FIGHT! при показе меню (или перезагрузке)
    if (fightAnimation) fightAnimation.classList.remove('show');

    // Модальные окна для информации
    let infoModal = null;
    function showModal(title, text, hash) {
        if (infoModal) infoModal.remove();
        infoModal = document.createElement('div');
        infoModal.className = 'mk-menu-overlay';
        infoModal.innerHTML = `
            <div class="mk-menu-box">
                <div class="mk-menu-title">${title}</div>
                <div style="color:#fff; font-size:1.1em; margin:18px 0 24px 0; text-align:left;">${text}</div>
            </div>
        `;
        document.body.appendChild(infoModal);
        if (hash) window.location.hash = hash;
    }

    btnPlay.onclick = () => {
        menu.style.display = 'none';
        setTimeout(() => {
            window.startMortalKombatGame && window.startMortalKombatGame();
            window.location.hash = '#Game';
        }, 100);
    };
    btnControls.onclick = () => {
        showModal('УПРАВЛЕНИЕ', `
            <b>Scorpion:</b><br>
            <b>A</b>, <b>D</b> — влево, вправо<br>
            <b>W</b>, <b>S</b> — прыгнуть, присесть<br>
            <b>Пробел</b> — блок<br>
            <b>J</b> — удар ногой с разворота<br>
            <b>K</b> — удар ногой<br>
            <b>L</b> — удар рукой<br>
            <b>I</b> — апперкот<br>
            <br>
            <b>Sub-Zero:</b><br>
            <b>←</b>, <b>→</b> — влево, вправо<br>
            <b>↑</b>, <b>↓</b> — прыгнуть, присесть<br>
            <b>NumPad 0</b> — блок<br>
            <b>NumPad 4</b> — удар рукой<br>
            <b>NumPad 8</b> — апперкот<br>
            <b>NumPad 5</b> — удар ногой<br>
            <b>NumPad 6</b> — удар ногой с разворота<br>
            <br>
            <i>Когда персонажи оказываются по разные стороны друг от друга,<br>
            кнопки <b>J</b> и <b>L</b> (у Scorpion), <b>4</b> и <b>6</b> (у Sub-Zero) меняются местами для ударов рукой и ногой с разворота.</i>
        `, '#Controls');
    };
    btnAbout.onclick = () => {
        showModal('ОБ ИГРЕ', `
            <b>Mortal Fighters</b> — браузерная фан-игра в стиле классического Mortal Kombat.<br><br>
            Два персонажа: Scorpion и Sub-Zero.<br>
            Классические удары, прыжки, блок, кровь.<br>
            Аутентичный ретро-дизайн и звуки.<br>
            Управление с клавиатуры.<br>
            <br>
            <b>Автор:</b> Dmitry
        `, '#About');
    };

    // Блокируем запуск игры до нажатия "Играть"
    window.startMortalKombatGame = function() {
        if (!window._gameStarted) {
            window._gameStarted = true;
            new Game();
        }
    };

    if (window._gameStarted) menu.style.display = 'none';

    // --- Реакция на hashchange и прямой переход по hash ---
    function openByHash() {
        if (infoModal) infoModal.remove();
        const hash = window.location.hash;
        if (hash === '#Controls') {
            btnControls.click();
        } else if (hash === '#About') {
            btnAbout.click();
        } else if (hash === '#Game') {
            menu.style.display = 'none';
            if (!window._gameStarted) {
                window._gameStarted = true;
                new Game();
            }
        } else if (hash === '#Main' || hash === '' || hash === '#') {
            if (window._gameStarted) {
                window.location.reload();
                return;
            }
            if (infoModal) infoModal.remove();
            menu.style.display = '';
        }
    }
    window.addEventListener('hashchange', openByHash);
    openByHash(); // при загрузке страницы
});