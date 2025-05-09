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
        this.isJumping = false;
        this.isDucking = false;
        this.isInJumpingState = false;
        this.isInDuckingState = false;
        this.isBlocking = false;
        this.isInBlockingState = false;
        this.health = config.health || 100;
        this.characterId = config.characterId;
        this.lastJumpTime = 0;
        this.lastAttackTime = 0;
        this.jumpCooldown = 1500; // 1.5 секунды перезарядки
        this.attackCooldown = 1000; // 1 секунда перезарядки атаки
        
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

    setAnimation(state, attackType = null, isHeld = false) {
        if (this.isDead || this.isWinner) return;
        let newState = state;

        if (this.isHurt) return;

        // Проверка перезарядки атаки
        if (attackType) {
            const currentTime = Date.now();
            if (currentTime - this.lastAttackTime < this.attackCooldown) {
                return;
            }
            this.lastAttackTime = currentTime;
        }

        // Обработка блокирования
        if (state === 'blockingidle' && !this.isInBlockingState) {
            this.isBlocking = true;
            this.isInBlockingState = true;
            this.state = 'blockingidle';
            this.element.src = `${this.config.basePath}/blockingidle.gif`;
            
            setTimeout(() => {
                if (this.isBlocking) {
                    this.state = 'blockingidle1';
                    this.element.src = `${this.config.basePath}/blockingidle1.gif`;
                }
            }, 150);
        }
        // Обработка блока в приседе
        else if (state === 'blockingduck' && !this.isInBlockingState) {
            this.isBlocking = true;
            this.isInBlockingState = true;
            this.state = 'blockingduck';
            this.element.src = `${this.config.basePath}/blockingduck.gif`;
            
            setTimeout(() => {
                if (this.isBlocking) {
                    this.state = 'blockingduck1';
                    this.element.src = `${this.config.basePath}/blockingduck1.gif`;
                }
            }, 150);
        }
        // Обработка прыжка и приседания
        else if (state === 'jumping' && !this.isInJumpingState) {
            const currentTime = Date.now();
            if (currentTime - this.lastJumpTime < this.jumpCooldown) {
                return;
            }
            
            this.isJumping = true;
            this.isInJumpingState = true;
            this.state = 'jumping';
            this.element.src = `${this.config.basePath}/jumping.gif`;
            
            setTimeout(() => {
                if (this.isJumping) {
                    this.state = 'jumping1';
                    this.element.src = `${this.config.basePath}/jumping1.gif`;
                    
                    setTimeout(() => {
                        if (this.isJumping) {
                            this.isJumping = false;
                            this.isInJumpingState = false;
                            this.lastJumpTime = Date.now();
                            this.setAnimation('idle');
                        }
                    }, 250);
                }
            }, 150);
        }
        else if (state === 'ducking' && !this.isInDuckingState) {
            this.isDucking = true;
            this.isInDuckingState = true;
            this.state = 'ducking';
            this.element.src = `${this.config.basePath}/ducking.gif`;
            
            setTimeout(() => {
                if (this.isDucking) {
                    this.state = 'ducking1';
                    this.element.src = `${this.config.basePath}/ducking1.gif`;
                }
            }, 150);
        }
        else if (attackType) {
            newState = attackType;
            this.isAttacking = true;
            
            setTimeout(() => {
                this.isAttacking = false;
                if (this.state === attackType) {
                    this.setAnimation('idle');
                }
            }, 625);
        }

        // Корректируем анимацию ходьбы для Саб-Зиро
        if (this.characterId === 'subzero' && (state === 'walkforward' || state === 'walkback')) {
            newState = state === 'walkforward' ? 'walkback' : 'walkforward';
        }

        if (this.state !== newState && !this.isInJumpingState && !this.isInDuckingState && !this.isInBlockingState) {
            this.state = newState;
            this.element.src = `${this.config.basePath}/${newState}.gif`;
            this.element.onload = () => {
                this.updateSize();
                this.updatePosition();
            };
        }
    }

    endJump() {
        if (this.isInJumpingState) {
            this.isJumping = false;
            this.isInJumpingState = false;
            this.setAnimation('idle');
        }
    }

    endDuck() {
        if (this.isInDuckingState) {
            this.isDucking = false;
            this.isInDuckingState = false;
            this.setAnimation('idle');
        }
    }

    endBlock() {
        if (this.isInBlockingState) {
            this.isBlocking = false;
            this.isInBlockingState = false;
            this.setAnimation('idle');
        }
    }

    updateDirection(newDirection) {
        if (this.direction !== newDirection) {
            this.direction = newDirection;
            this.element.style.transform = `scale(1.25) scaleX(${newDirection})`;
        }
    }

    updatePosition() {
        // Границы с учётом индивидуальных размеров
        const minX = window.innerWidth * 0.1 + this.width/2;
        const maxX = window.innerWidth * 0.9 - this.width/2;
        this.x = Math.max(minX, Math.min(this.x, maxX));
        
        // Добавляем эффект прыжка через CSS transform
        let transform = `scale(1.25) scaleX(${this.direction})`;
        if (this.isJumping) {
            // Разная высота для разных фаз прыжка
            const jumpHeight = this.state === 'jumping' ? -30 : -60;
            transform += ` translateY(${jumpHeight}px)`;
        }
        
        this.element.style.transform = transform;
        this.wrapper.style.left = `${this.x}px`;
        
        // Добавляем плавность анимации
        this.element.style.transition = 'transform 0.15s cubic-bezier(0.4, 0, 0.2, 1)';
    }

    takeHit(damage) {
        if (this.isHurt) return; // Предотвращаем получение урона во время анимации получения урона
        if (this.isBlocking) return; // Не получаем урон во время блока

        this.health = Math.max(0, this.health - damage);
        this.isHurt = true;

        // Выбираем случайную анимацию получения урона
        const hitAnimation = `hit${Math.floor(Math.random() * 3) + 1}`;
        this.state = hitAnimation;
        this.element.src = `${this.config.basePath}/${hitAnimation}.gif`;

        // Добавляем откидывание назад
        const knockbackDistance = 5; // Расстояние откидывания в пикселях
        const knockbackDirection = this.direction * -1; // Направление откидывания (противоположное направлению персонажа)
        this.x += knockbackDistance * knockbackDirection;

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
        this.isJumping = false;
        this.isDucking = false;
        this.isInJumpingState = false;
        this.isInDuckingState = false;
        this.isBlocking = false;
        this.isInBlockingState = false;
        this.state = 'idle';
        this.element.src = `${this.config.basePath}/${this.state}.gif`;
    }

    canStartNewAction() {
        const currentTime = Date.now();
        return !this.isAttacking && !this.isHurt && !this.isDead && !this.isWinner && 
               (currentTime - this.lastAttackTime >= this.attackCooldown);
    }
}