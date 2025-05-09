export class BloodEffect {
    constructor(x, y) {
        this.x = x;
        this.y = y - 30; // Поднимаем начальную позицию эффекта выше
        this.state = 'initial'; // initial, splatter, finished
        this.element = document.createElement('div');
        this.element.style.position = 'fixed';
        this.element.style.left = `${x}px`;
        this.element.style.top = `${this.y}px`;
        this.element.style.zIndex = '1000';
        this.element.style.transform = 'translate(-50%, -50%)'; // Центрируем элемент
        document.getElementById('game-container').appendChild(this.element);
        
        this.startAnimation();
    }

    startAnimation() {
        // Начинаем с анимации брызг крови
        this.element.innerHTML = `<img src="assets/backgrounds/Blood/blood.gif" alt="blood" style="transform: scale(1.9);">`;
        
        // После окончания GIF анимации переходим к разбрызгиванию
        setTimeout(() => {
            this.createBloodSplatter();
        }, 500); // Примерное время анимации blood.gif
    }

    createBloodSplatter() {
        this.state = 'splatter';
        this.element.innerHTML = ''; // Очищаем предыдущую анимацию
        
        // Все возможные направления и типы крови
        const bloodTypes = [
            { image: 'leftlight.png', x: -20, y: -20 }, // Начинаем выше и ближе к центру
            { image: 'leftmid.png', x: -40, y: -20 },
            { image: 'left.png', x: -60, y: -20 },
            { image: 'rightlight.png', x: 20, y: -20 },
            { image: 'rightmid.png', x: 40, y: -20 },
            { image: 'right.png', x: 60, y: -20 },
            { image: 'under.png', x: 0, y: -20 }
        ];

        // Выбираем случайные 3-4 капли крови (без повторов)
        const shuffled = bloodTypes.sort(() => 0.5 - Math.random());
        const numDrops = Math.floor(Math.random() * 2) + 3; // 3 или 4
        const selectedDrops = shuffled.slice(0, numDrops);

        // Массив для отслеживания позиций лужиц
        const bloodPools = [];

        selectedDrops.forEach(dir => {
            const drop = document.createElement('div');
            drop.style.position = 'absolute';
            drop.style.left = `${dir.x}px`;
            drop.style.top = `${dir.y}px`;
            drop.innerHTML = `<img src="assets/backgrounds/Blood/${dir.image}" alt="blood drop">`;
            this.element.appendChild(drop);

            // Добавляем анимацию падения с случайной скоростью
            const fallDuration = 0.3 + Math.random() * 0.4; // от 0.3 до 0.7 секунд
            const fallDistance = 80 + Math.random() * 30; // от 80 до 110 пикселей
            drop.style.transition = `top ${fallDuration}s ease-in`;
            
            setTimeout(() => {
                drop.style.top = `${fallDistance}px`; // Падаем вниз
                
                // Создаем лужицу крови под каплей после падения
                setTimeout(() => {
                    // Удаляем каплю
                    drop.remove();
                    
                    // Проверяем, есть ли уже лужица в этой позиции
                    const poolPosition = { x: dir.x, y: fallDistance + 10 };
                    const isOverlapping = bloodPools.some(pool => 
                        Math.abs(pool.x - poolPosition.x) < 15 && 
                        Math.abs(pool.y - poolPosition.y) < 15
                    );

                    if (!isOverlapping) {
                        // Создаем лужицу только если нет перекрытия
                        const pool = document.createElement('div');
                        pool.style.position = 'absolute';
                        pool.style.left = `${poolPosition.x}px`;
                        pool.style.top = `${poolPosition.y}px`;
                        pool.innerHTML = `<img src="assets/backgrounds/Blood/lugha.png" alt="blood pool" style="transform: scale(0.88);">`;
                        this.element.appendChild(pool);
                        
                        // Добавляем позицию лужицы в массив
                        bloodPools.push(poolPosition);
                        
                        // Удаляем лужицу через секунду
                        setTimeout(() => {
                            pool.remove();
                            // Удаляем позицию из массива
                            const index = bloodPools.indexOf(poolPosition);
                            if (index > -1) {
                                bloodPools.splice(index, 1);
                            }
                        }, 1000);
                    }
                }, fallDuration * 1000); // Ждем окончания анимации падения
            }, 50);
        });

        // Удаляем весь эффект через 2 секунды
        setTimeout(() => {
            this.element.remove();
        }, 2000);
    }
} 