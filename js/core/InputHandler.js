export class InputHandler {
    constructor() {
        this.keys = {};
        this.numpadKeys = new Set(['Numpad4', 'Numpad5', 'Numpad6', 'Numpad8', 'Numpad0']);
        this.jumpKeys = new Set(['w', 'arrowup']);
        this.duckKeys = new Set(['s', 'arrowdown']);
        this.blockKeys = new Set([' ', '0']);
        
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

    getMoveType(character) {
        if (character === 'scorpion') {
            if (this.keys['w']) return { type: 'jumping', isHeld: true };
            if (this.keys['s']) return { type: 'ducking', isHeld: true };
            if (this.keys[' ']) return { type: 'blockingidle', isHeld: true };
        } else if (character === 'subzero') {
            if (this.keys['arrowup']) return { type: 'jumping', isHeld: true };
            if (this.keys['arrowdown']) return { type: 'ducking', isHeld: true };
            if (this.keys['0']) return { type: 'blockingidle', isHeld: true };
        }
        return { type: null, isHeld: false };
    }

    isJumpKeyReleased(character) {
        return character === 'scorpion' ? !this.keys['w'] : !this.keys['arrowup'];
    }

    isDuckKeyReleased(character) {
        return character === 'scorpion' ? !this.keys['s'] : !this.keys['arrowdown'];
    }

    isBlockKeyReleased(character) {
        return character === 'scorpion' ? !this.keys[' '] : !this.keys['0'];
    }
}