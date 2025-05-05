export class Sprite {
    constructor(selector, config) {
        this.element = document.querySelector(selector);
        this.wrapper = this.element.parentElement;
        this.config = config;
        this.x = config.startX || 0;
        this.direction = 1;
        this.speed = 3;
        this.state = 'idle';
        this.isAttacking = false;
        this.isHurt = false;
        this.isDead = false;
        this.isWinner = false;
        this.health = config.health || 100;
        this.characterId = config.characterId;
        
        // Инициализация размеров
        this.element.src = `${this.config.basePath}/${this.state}.gif`;
        this.element.onload = () => this.updateSize();
    }

    updateSize() {
        this.width = this.element.naturalWidth;
        this.height = this.element.naturalHeight;
        this.element.style.width = `${this.width}px`;
        this.element.style.height = `${this.height}px`;
    }

    setAnimation(state, attackType = null) {
        if (this.isDead || this.isWinner) return; // Не менять анимацию если персонаж мертв или победил
        let newState = state;

        if (this.isHurt) return;

        if (attackType) {
            newState = attackType;
            this.isAttacking = true;
            
            setTimeout(() => {
                this.isAttacking = false;
                if (this.state === attackType) {
                    this.setAnimation('idle');
                }
            }, 500);
        }

        // Корректируем анимацию ходьбы для Саб-Зиро
        if (this.characterId === 'subzero' && (state === 'walkforward' || state === 'walkback')) {
            newState = state === 'walkforward' ? 'walkback' : 'walkforward';
        }

        if (this.state !== newState) {
            this.state = newState;
            this.element.src = `${this.config.basePath}/${newState}.gif`;
            this.element.onload = () => {
                this.updateSize();
                this.updatePosition();
            };
        }
    }

    updateDirection(newDirection) {
        if (this.direction !== newDirection) {
            this.direction = newDirection;
            this.element.style.transform = `scaleX(${newDirection})`;
        }
    }

    updatePosition() {
        // Границы с учётом индивидуальных размеров
        const minX = window.innerWidth * 0.1 + this.width/2;
        const maxX = window.innerWidth * 0.9 - this.width/2;
        this.x = Math.max(minX, Math.min(this.x, maxX));
        
        this.wrapper.style.left = `${this.x}px`;
    }

    takeHit(damage) {
        if (this.isHurt) return; // Предотвращаем получение урона во время анимации получения урона

        this.health = Math.max(0, this.health - damage);
        this.isHurt = true;

        // Выбираем случайную анимацию получения урона
        const hitAnimation = `hit${Math.floor(Math.random() * 3) + 1}`;
        this.state = hitAnimation;
        this.element.src = `${this.config.basePath}/${hitAnimation}.gif`;

        // Возвращаемся в исходное состояние после анимации
        setTimeout(() => {
            this.isHurt = false;
            if (this.state === hitAnimation) {
                this.setAnimation('idle');
            }
        }, 400); // Длительность анимации получения урона

        return this.health <= 0; // Возвращаем true если персонаж побежден
    }

    die() {
        this.isDead = true;
        this.state = 'death1';
        this.element.src = `${this.config.basePath}/death1.gif`;
        
        setTimeout(() => {
            if (this.isDead) {
                this.state = 'fall';
                this.element.src = `${this.config.basePath}/fall.gif`;
            }
        }, 5000);
    }

    win() {
        this.isWinner = true;
        this.state = 'win';
        this.element.src = `${this.config.basePath}/win.gif`;
    }

    reset() {
        this.health = this.config.health || 100;
        this.isDead = false;
        this.isWinner = false;
        this.isHurt = false;
        this.isAttacking = false;
        this.state = 'idle';
        this.element.src = `${this.config.basePath}/${this.state}.gif`;
    }

    canStartNewAction() {
        return !this.isAttacking && !this.isHurt && !this.isDead && !this.isWinner;
    }
}