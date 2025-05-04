export class Sprite {
    constructor({ 
        imageSrc, 
        frameRate = 1,
        frameWidth,
        gap = 0,
        frameBuffer = 10,
        chromaKey = { r: 165, g: 231, b: 255 },
        threshold = 40,
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
        this.processedImage = new Image();
        this.chromaKey = chromaKey;
        this.threshold = threshold;
        // Обработка изображения
        this.image.onload = () => {
            const tempCanvas = document.createElement('canvas');
            const tempCtx = tempCanvas.getContext('2d');
            
            tempCanvas.width = this.image.naturalWidth;
            tempCanvas.height = this.image.naturalHeight;
            
            tempCtx.drawImage(this.image, 0, 0);
            
            if(this.chromaKey) {
                const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
                const data = imageData.data;

                for(let i = 0; i < data.length; i += 4) {
                    const r = data[i];
                    const g = data[i+1];
                    const b = data[i+2];
                    
                    if(
                        Math.abs(r - this.chromaKey.r) < this.threshold &&
                        Math.abs(g - this.chromaKey.g) < this.threshold &&
                        Math.abs(b - this.chromaKey.b) < this.threshold
                    ) {
                        data[i+3] = 0;
                    }
                }
                tempCtx.putImageData(imageData, 0, 0);
            }
            
            this.processedImage.onload = () => {
                this.isLoaded = true;
                this.frameHeight = this.processedImage.height;
            };
            
            this.processedImage.src = tempCanvas.toDataURL();
        };
    }

    update() {
        if (!this.isLoaded) return;
        
        this.elapsedFrames++;
        if (this.elapsedFrames % this.frameBuffer === 0) {
            this.currentFrame = (this.currentFrame + 1) % this.frameRate;
        }
    }

    draw(ctx, x, y, flip = false) {
        if (!this.isLoaded) return;

        const sourceX = this.currentFrame * (this.frameWidth + this.gap);
        
        ctx.save();
        if (flip) {
            ctx.scale(-1, 1);
            ctx.drawImage(
                this.processedImage,
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
                this.processedImage,
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