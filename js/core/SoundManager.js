export class SoundManager {
    constructor() {
        this.sounds = {
            hitSounds: [
                'assets/sounds/hitsound/mk1-00048.mp3',
                'assets/sounds/hitsound/mk1-00049.mp3',
                'assets/sounds/hitsound/mk1-00050.mp3',
                'assets/sounds/hitsound/mk1-00051.mp3',
                'assets/sounds/hitsound/mk1-00052.mp3',
                'assets/sounds/hitsound/mk1-00053.mp3',
                'assets/sounds/hitsound/mk1-00054.mp3',
                'assets/sounds/hitsound/mk1-00055.mp3',
                'assets/sounds/hitsound/mk1-00056.mp3',
                'assets/sounds/hitsound/mk1-00057.mp3',
                'assets/sounds/hitsound/mk1-00058.mp3',
                'assets/sounds/hitsound/mk1-00059.mp3',
                'assets/sounds/hitsound/mk1-00060.mp3',
                'assets/sounds/hitsound/mk1-00061.mp3',
                'assets/sounds/hitsound/mk1-00062.mp3',
                'assets/sounds/hitsound/mk1-00063.mp3',
                'assets/sounds/hitsound/mk1-00079.mp3'
            ],
            hitScreams: [
                'assets/sounds/screams/Short/mk1-00195.mp3',
                'assets/sounds/screams/Short/mk1-00196.mp3',
                'assets/sounds/screams/Short/mk1-00197.mp3',
                'assets/sounds/screams/Short/mk1-00198.mp3',
                'assets/sounds/screams/Short/mk1-00199.mp3',
                'assets/sounds/screams/Short/mk1-00200.mp3'
            ],
            battleCries: [
                'assets/sounds/screams/battle/mk1-00192.mp3',
                'assets/sounds/screams/battle/mk1-00193.mp3',
                'assets/sounds/screams/battle/mk1-00208.mp3',
                'assets/sounds/screams/battle/mk1-00209.mp3',
                'assets/sounds/screams/battle/mk1-00213.mp3',
                'assets/sounds/screams/battle/mk1-00214.mp3'
            ],
            missSound: 'assets/sounds/hitsound/miss.mp3',
            fightSound: 'assets/sounds/announcer/fight.mp3',
            victorySounds: {
                scorpion: 'assets/sounds/announcer/scorpionw.mp3',
                subzero: 'assets/sounds/announcer/sabzerow.mp3'
            }
        };

        // Отслеживание последнего проигранного звука для каждого типа
        this.lastPlayedSounds = {
            hitSounds: null,
            hitScreams: null,
            battleCries: null
        };
    }

    playRandomSound(soundType) {
        const sounds = this.sounds[soundType];
        if (!sounds || sounds.length === 0) return;

        let randomIndex;
        do {
            randomIndex = Math.floor(Math.random() * sounds.length);
        } while (sounds[randomIndex] === this.lastPlayedSounds[soundType] && sounds.length > 1);

        this.lastPlayedSounds[soundType] = sounds[randomIndex];
        const audio = new Audio(sounds[randomIndex]);
        audio.volume = 0.5;
        audio.play().catch(error => console.log('Error playing sound:', error));
    }

    playHitSound() {
        this.playRandomSound('hitSounds');
    }

    playHitScream() {
        this.playRandomSound('hitScreams');
    }

    playBattleCry() {
        const sounds = this.sounds.battleCries;
        if (!sounds || sounds.length === 0) return;

        let randomIndex;
        do {
            randomIndex = Math.floor(Math.random() * sounds.length);
        } while (sounds[randomIndex] === this.lastPlayedSounds.battleCries && sounds.length > 1);

        this.lastPlayedSounds.battleCries = sounds[randomIndex];
        const audio = new Audio(sounds[randomIndex]);
        audio.volume = 0.25;
        audio.play().catch(error => console.log('Error playing battle cry:', error));
    }

    playMissSound() {
        const audio = new Audio(this.sounds.missSound);
        audio.volume = 0.5;
        audio.play().catch(error => console.log('Error playing miss sound:', error));
    }

    playFightSound() {
        const audio = new Audio(this.sounds.fightSound);
        audio.volume = 0.5;
        audio.play().catch(error => console.log('Error playing fight sound:', error));
    }

    playVictorySound(winner) {
        const soundPath = this.sounds.victorySounds[winner.toLowerCase()];
        if (soundPath) {
            const audio = new Audio(soundPath);
            audio.volume = 0.5;
            audio.play().catch(error => console.log('Error playing victory sound:', error));
        }
    }
} 