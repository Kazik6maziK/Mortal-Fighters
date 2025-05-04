export class Sprite {
    constructor(selector, config) {
        this.element = document.querySelector(selector);
        this.wrapper = this.element.parentElement;
        this.config = config;
        this.x = 0;
        this.direction = 1;
        this.speed = 3;
        this.state = 'idle';
        
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

    setAnimation(state) {
        if (this.state !== state) {
            this.state = state;
            this.element.src = `${this.config.basePath}/${state}.gif`;
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
}