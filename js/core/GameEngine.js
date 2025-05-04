export class GameEngine {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.fighters = [];
        
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    addFighter(fighter) {
        this.fighters.push(fighter);
    }

    start() {
        const animate = () => {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            
            this.fighters.forEach(fighter => {
                fighter.update();
                fighter.draw(this.ctx);
            });
            
            requestAnimationFrame(animate);
        };
        animate();
    }
}