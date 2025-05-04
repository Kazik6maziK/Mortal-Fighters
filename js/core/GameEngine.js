export class GameEngine { // Добавьте ключевое слово export
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.sprites = [];
        
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    addSprite(sprite) {
        this.sprites.push(sprite);
    }

    start() {
        const animate = () => {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            
            this.sprites.forEach(sprite => {
                sprite.update();
                sprite.draw(this.ctx, this.canvas);
            });
            
            requestAnimationFrame(animate);
        };
        animate();
    }
}