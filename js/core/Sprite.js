class Sprite {
    constructor({
        imageSrc,
        frameRate = 1,
        frameWidth, // Новая обязательная опция: ширина одного кадра
        gap = 0,    // Расстояние между кадрами
        frameBuffer = 6,
        loop = true
    }) {
        this.image = new Image();
        this.image.src = imageSrc;
        this.frameRate = frameRate;
        this.frameWidth = frameWidth;
        this.gap = gap;
        this.frameBuffer = frameBuffer;
        this.currentFrame = 0;
        this.elapsedFrames = 0;
        this.loop = loop;
        this.isLoaded = false;

        this.image.onload = () => {
            this.isLoaded = true;
            this.frameHeight = this.image.height;
            // Проверка корректности размеров
            const totalWidth = (frameWidth * frameRate) + (gap * (frameRate - 1));
            if (totalWidth > this.image.width) {
                console.error('Sprite sheet width mismatch!');
            }
        };
    }

    update() {
        if (!this.isLoaded) return;
        
        this.elapsedFrames++;
        if (this.elapsedFrames % this.frameBuffer === 0) {
            if (this.currentFrame < this.frameRate - 1) {
                this.currentFrame++;
            } else if (this.loop) {
                this.currentFrame = 0;
            }
        }
    }

    draw(ctx, x, y, flip = false) {
        if (!this.isLoaded) return;

        const sourceX = this.currentFrame * (this.frameWidth + this.gap);
        
        ctx.save();
        if (flip) {
            ctx.scale(-1, 1);
            ctx.drawImage(
                this.image,
                sourceX,
                0,
                this.frameWidth,
                this.frameHeight,
                -x - this.frameWidth,
                y,
                this.frameWidth,
                this.frameHeight
            );
        } else {
            ctx.drawImage(
                this.image,
                sourceX,
                0,
                this.frameWidth,
                this.frameHeight,
                x,
                y,
                this.frameWidth,
                this.frameHeight
            );
        }
        ctx.restore();
    }
}