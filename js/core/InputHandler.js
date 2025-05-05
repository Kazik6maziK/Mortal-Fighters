export class InputHandler {
    constructor() {
        this.keys = {};
        this.numpadKeys = new Set(['Numpad4', 'Numpad5', 'Numpad6', 'Numpad8']);
        
        window.addEventListener('keydown', e => {
            // Для клавиш numpad преобразуем их в числа
            if (this.numpadKeys.has(e.code)) {
                this.keys[e.code.replace('Numpad', '')] = true;
            } else {
                this.keys[e.key.toLowerCase()] = true;
            }
        });
        
        window.addEventListener('keyup', e => {
            if (this.numpadKeys.has(e.code)) {
                this.keys[e.code.replace('Numpad', '')] = false;
            } else {
                this.keys[e.key.toLowerCase()] = false;
            }
        });
    }

    isAttackKeyPressed(character) {
        if (character === 'scorpion') {
            return this.keys['k'] || (this.keys['j'] || this.keys['l']);
        } else if (character === 'subzero') {
            return this.keys['5'] || (this.keys['4'] || this.keys['6']);
        }
        return false;
    }

    getAttackType(character, facingLeft) {
        if (character === 'scorpion') {
            if (this.keys['k']) return 'kick';
            if (facingLeft && this.keys['j']) return 'punch';
            if (!facingLeft && this.keys['l']) return 'punch';
        } else if (character === 'subzero') {
            if (this.keys['5']) return 'kick';
            if (facingLeft && this.keys['4']) return 'punch';
            if (!facingLeft && this.keys['6']) return 'punch';
        }
        return null;
    }
}