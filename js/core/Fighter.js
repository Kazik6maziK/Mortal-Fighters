import { Sprite } from './Sprite.js';

export class Fighter {
    constructor({
        position,
        imageSrc,
        frameRate = 1,
        frameWidth,
        gap = 0,
        frameBuffer = 10,
        chromaKey,
        flip = false
    }) {
        this.position = position;
        this.sprite = new Sprite({
            imageSrc,
            frameRate,
            frameWidth,
            gap,
            frameBuffer,
            chromaKey
        });
        this.flip = flip;
    }

    update() {
        this.sprite.update();
    }

    draw(ctx) {
        this.sprite.draw(
            ctx,
            this.position.x,
            this.position.y,
            this.flip
        );
    }
}