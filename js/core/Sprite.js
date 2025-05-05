export class Sprite {
    constructor(selector, config) {
        this.element = document.querySelector(selector);
        this.wrapper = this.element.parentElement;
        this.config = config;
        this.x = 0;
        this.direction = 1;
        this.speed = 3;
        this.state = 'idle';
        this.isAttacking = false;
        
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
        let newState = state;
        if (attackType) {
            newState = attackType;
            this.isAttacking = true;
            
            // Автоматически вернуться в состояние idle после завершения анимации
            setTimeout(() => {
                this.isAttacking = false;
                if (this.state === attackType) {
                    this.setAnimation('idle');
                }
            }, 500); // Предполагаемая длительность анимации удара
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

    canStartNewAction() {
        return !this.isAttacking;
    }
}