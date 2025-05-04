export class Fighter {
    constructor(selector, keys, opponent) {
        this.sprite = new Sprite(selector);
        this.keys = keys;
        this.opponent = opponent;
        this.x = 0;
        this.speed = 3;
        this.direction = 1;
    }

    update(keysPressed) {
        // Движение
        if (keysPressed[this.keys.left]) {
            this.x -= this.speed;
            this.sprite.setAnimation('walk_backward');
        } else if (keysPressed[this.keys.right]) {
            this.x += this.speed;
            this.sprite.setAnimation('walk_forward');
        } else {
            this.sprite.setAnimation('idle');
        }

        // Определение направления
        const shouldFaceLeft = this.x > this.opponent.x;
        this.sprite.flip(shouldFaceLeft);
        this.direction = shouldFaceLeft ? -1 : 1;

        // Обновление позиции
        this.sprite.element.style.left = `${this.x}px`;
    }
}