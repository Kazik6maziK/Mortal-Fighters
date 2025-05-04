export class Sprite {
    constructor({ 
        imageSrc, 
        frameRate = 1,
        frameWidth,
        gap = 0,
        frameBuffer = 10
    }) {
        this.image = new Image();
        this.image.src = imageSrc;
        this.frameRate = frameRate;
        this.frameWidth = frameWidth;
        this.gap = gap;
        this.frameBuffer = frameBuffer;
        this.currentFrame = 0;
        this.elapsedFrames = 0;
        this.isLoaded = false;
        this.frameHeight = 0;

        this.image.onload = () => {
            this.isLoaded = true;
            this.frameHeight = this.image.height;
        };
    }

    update() {
        if (!this.isLoaded) return;
        
        this.elapsedFrames++;
        if (this.elapsedFrames % this.frameBuffer === 0) {
            this.currentFrame = (this.currentFrame + 1) % this.frameRate;
        }
    }

    draw(ctx, canvas) {
        if (!this.isLoaded) return;

        const sourceX = this.currentFrame * (this.frameWidth + this.gap);
        const x = (canvas.width - this.frameWidth) / 2;
        const y = (canvas.height - this.frameHeight) / 2;

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
}