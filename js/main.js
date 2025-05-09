import { Sprite } from './core/Sprite.js';
import { InputHandler } from './core/InputHandler.js';
import { SoundManager } from './core/SoundManager.js';
import { BloodEffect } from './core/BloodEffect.js';

// Тут настройки игры
const CONFIG = {
    BOUNDARY_OFFSET: 0.1,
    VERTICAL_POSITION: 15,
    MOVEMENT_SPEED: 4,
    MAX_HEALTH: 100,
    ATTACK_RANGE: 125,
    DAMAGE: {
        punch: 5,
        kick: 8,
        kickback: 10,
        uppercut: 13
    },
    FIGHT_RESET_DELAY: 5000,
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
        // Тут создаю персонажей
        this.characters.scorpion = new Sprite('#scorpion', {
            basePath: 'assets/characters/scorpion',
            startX: 800 * 0.35,
            health: CONFIG.MAX_HEALTH,
            characterId: 'scorpion'
        });

        this.characters.subzero = new Sprite('#subzero', {
            basePath: 'assets/characters/subzero',
            startX: 800 * 0.65,
            health: CONFIG.MAX_HEALTH,
            characterId: 'subzero'
        });

        this.updateHealthBars();

        // Тут жду пока всё загрузится
        await Promise.all([
            this.preloadAssets(),
            this.soundManager.preloadSounds()
        ]);
        
        this.showFightAnimation();
        requestAnimationFrame((timestamp) => this.gameLoop(timestamp));
        window.addEventListener('resize', () => this.handleResize());
    }

    async preloadAssets() {
        // Тут просто загружаю все гифки
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
        // Показываю гифку "FIGHT!" и звук
        this.fightAnimation.classList.add('show');
        this.soundManager.playFightSound();
        setTimeout(() => {
            this.fightAnimation.classList.remove('show');
        }, 1000);
    }

    updateHealthBars() {
        // Просто обновляю полоски HP
        Object.entries(this.characters).forEach(([id, character]) => {
            const healthPercent = (character.health / CONFIG.MAX_HEALTH) * 100;
            const healthBars = this.healthBars[id];
            healthBars.main.style.width = `${healthPercent}%`;
            setTimeout(() => {
                healthBars.damage.style.width = `${healthPercent}%`;
            }, 300);
        });
    }

    handleResize() {
        // Тут просто обновляю позицию DOM, не трогаю координаты
        Object.values(this.characters).forEach(character => {
            character.updatePosition();
        });
    }

    updateCharacters() {
        this.updateCharacter('scorpion', this.characters.subzero.x);
        this.updateCharacter('subzero', this.characters.scorpion.x);
    }

    checkHit(attacker, defender, attackType) {
        // Тут вся логика попадания и промаха
        const distance = Math.abs(attacker.x - defender.x);
        if (distance <= CONFIG.ATTACK_RANGE && attacker.isAttacking) {
            const isAttackerFacingRight = attacker.direction === 1;
            const isDefenderOnRight = attacker.x < defender.x;
            if (isAttackerFacingRight === isDefenderOnRight) {
                if (defender.isBlocking) {
                    this.soundManager.playBattleCry();
                    this.soundManager.playMissSound();
                } else {
                    this.soundManager.playBattleCry();
                    this.soundManager.playHitSound();
                    this.soundManager.playHitScream();
                    // Тут кровь если попал
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
                }
            } else {
                this.soundManager.playBattleCry();
                this.soundManager.playMissSound();
            }
        } else if (attacker.isAttacking) {
            this.soundManager.playBattleCry();
            this.soundManager.playMissSound();
        }
    }

    endFight(winner, loser) {
        this.gameOver = true;
        winner.win();
        loser.die();
        this.soundManager.playVictorySound(winner === this.characters.scorpion ? 'scorpion' : 'subzero');
        setTimeout(() => this.resetFight(), CONFIG.FIGHT_RESET_DELAY);
    }

    resetFight() {
        this.gameOver = false;
        Object.values(this.characters).forEach(character => {
            character.reset();
        });
        this.updateHealthBars();
        Object.values(this.characters).forEach(character => {
            character.updatePosition();
        });
        this.showFightAnimation();
    }

    updateCharacter(characterId, opponentX) {
        // Тут вся логика движения и ударов
        const character = this.characters[characterId];
        const opponent = characterId === 'scorpion' ? this.characters.subzero : this.characters.scorpion;
        const controls = CONFIG.CONTROLS[characterId];
        if (!character.canStartNewAction()) {
            return;
        }
        const shouldFaceLeft = character.x > opponentX;
        const attackType = this.input.getAttackType(characterId, shouldFaceLeft);
        if (attackType && !character.isBlocking && !character.isDucking) {
            character.setAnimation('idle', attackType);
            this.checkHit(character, opponent, attackType);
            return;
        }
        const moveType = this.input.getMoveType(characterId);
        if (this.input.isJumpKeyReleased(characterId)) {
            character.endJump();
        }
        if (this.input.isDuckKeyReleased(characterId)) {
            character.endDuck();
        }
        if (this.input.isBlockKeyReleased(characterId)) {
            character.endBlock();
            if (this.input.keys[controls.duck]) {
                character.setAnimation('ducking');
            }
        }
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
        character.updateDirection(shouldFaceLeft ? -1 : 1);
        // Тут ограничиваю движение по краям
        const minX = 800 * 0.05 + character.width / 2;
        const maxX = 800 * 0.95 - character.width / 2;
        character.x = Math.max(minX, Math.min(character.x, maxX));
        character.updatePosition();
    }

    gameLoop(timestamp) {
        // Тут основной цикл игры
        const deltaTime = timestamp - this.lastTime;
        if (deltaTime > 16) {
            this.updateCharacters();
            this.lastTime = timestamp;
        }
        requestAnimationFrame((newTimestamp) => this.gameLoop(newTimestamp));
    }

    checkGameOver() {
        // Тут просто проверяю, кто победил
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

// Всё что ниже — это меню и запуск игры, тут ничего сложного
window.addEventListener('DOMContentLoaded', () => {
    const menu = document.getElementById('start-menu');
    const btnPlay = document.getElementById('btn-play');
    const btnControls = document.getElementById('btn-controls');
    const btnAbout = document.getElementById('btn-about');
    const fightAnimation = document.getElementById('fight-animation');
    if (fightAnimation) fightAnimation.classList.remove('show');
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
    window.startMortalKombatGame = function() {
        if (!window._gameStarted) {
            window._gameStarted = true;
            new Game();
        }
    };
    if (window._gameStarted) menu.style.display = 'none';
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
    openByHash();
});