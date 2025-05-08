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
            return this.keys['k'] || this.keys['j'] || this.keys['l'] || this.keys['i'];
        } else if (character === 'subzero') {
            return this.keys['5'] || this.keys['4'] || this.keys['6'] || this.keys['8'];
        }
        return false;
    }

    getAttackType(character, facingLeft) {
        if (character === 'scorpion') {
            if (this.keys['k']) return 'kick';
            if (this.keys['i']) return 'uppercut';
            if (facingLeft && this.keys['l']) return 'kickback';
            if (!facingLeft && this.keys['j']) return 'kickback';
            if (facingLeft && this.keys['j']) return 'punch';
            if (!facingLeft && this.keys['l']) return 'punch';
        } else if (character === 'subzero') {
            if (this.keys['5']) return 'kick';
            if (this.keys['8']) return 'uppercut';
            if (facingLeft && this.keys['6']) return 'kickback';
            if (!facingLeft && this.keys['4']) return 'kickback';
            if (facingLeft && this.keys['4']) return 'punch';
            if (!facingLeft && this.keys['6']) return 'punch';
        }
        return null;
    }

    getMoveType(characterId) {
        const isScorpion = characterId === 'scorpion';
        const duckKey = isScorpion ? 's' : 'arrowdown';
        const jumpKey = isScorpion ? 'w' : 'arrowup';
        const blockKey = isScorpion ? ' ' : '0';

        // Проверяем блок в приседе
        if (this.keys[duckKey] && this.keys[blockKey]) {
            return { type: 'blockingduck', isHeld: true };
        }
        // Проверяем обычный блок
        else if (this.keys[blockKey]) {
            return { type: 'blockingidle', isHeld: true };
        }
        // Проверяем присед
        else if (this.keys[duckKey]) {
            return { type: 'ducking', isHeld: true };
        }
        // Проверяем прыжок
        else if (this.keys[jumpKey]) {
            return { type: 'jumping', isHeld: true };
        }

        return { type: 'idle', isHeld: false };
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