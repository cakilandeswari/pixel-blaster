// level.js — Level definitions, wave system, progression
var Levels = {
    current: 0,
    waveIndex: 0,
    waveTimer: 0,
    waveDelay: 2.0, // seconds between waves
    betweenWaves: false,
    allWavesSpawned: false,

    definitions: [
        // Level 1: Intro - just a few grunts
        {
            waves: [
                { grunt: 3 },
                { grunt: 4 }
            ],
            speedMult: 1.0, shootMult: 1.0
        },
        // Level 2: More grunts
        {
            waves: [
                { grunt: 4 },
                { grunt: 5 },
                { grunt: 4 }
            ],
            speedMult: 1.0, shootMult: 1.0
        },
        // Level 3: Introduce rushers
        {
            waves: [
                { grunt: 3, rusher: 2 },
                { grunt: 4, rusher: 2 },
                { rusher: 5 }
            ],
            speedMult: 1.0, shootMult: 1.0
        },
        // Level 4: Rushers + grunts mix
        {
            waves: [
                { grunt: 4, rusher: 3 },
                { grunt: 3, rusher: 4 },
                { grunt: 5, rusher: 2 },
                { rusher: 6 }
            ],
            speedMult: 1.0, shootMult: 1.0
        },
        // Level 5: Introduce tanks
        {
            waves: [
                { grunt: 3, tank: 1 },
                { grunt: 4, rusher: 2, tank: 1 },
                { tank: 2, rusher: 3 }
            ],
            speedMult: 1.0, shootMult: 1.0
        },
        // Level 6: Tanks + mixed
        {
            waves: [
                { grunt: 4, tank: 2 },
                { rusher: 4, tank: 1 },
                { grunt: 3, rusher: 3, tank: 2 },
                { tank: 3 }
            ],
            speedMult: 1.1, shootMult: 1.1
        },
        // Level 7: Introduce snipers + all types
        {
            waves: [
                { grunt: 3, sniper: 2 },
                { grunt: 4, rusher: 3, sniper: 1 },
                { tank: 2, sniper: 2, rusher: 2 },
                { grunt: 3, rusher: 2, tank: 1, sniper: 2 }
            ],
            speedMult: 1.1, shootMult: 1.2
        },
        // Level 8: Heavy assault
        {
            waves: [
                { grunt: 5, rusher: 3 },
                { tank: 2, sniper: 3 },
                { grunt: 4, rusher: 4, tank: 1, sniper: 1 },
                { rusher: 6, tank: 2 },
                { grunt: 3, rusher: 2, tank: 2, sniper: 2 }
            ],
            speedMult: 1.2, shootMult: 1.3
        },
        // Level 9: Gauntlet
        {
            waves: [
                { grunt: 5, rusher: 4, tank: 2 },
                { sniper: 4, rusher: 5 },
                { grunt: 6, tank: 3, sniper: 2 },
                { rusher: 8, tank: 1 },
                { grunt: 4, rusher: 4, tank: 2, sniper: 3 }
            ],
            speedMult: 1.3, shootMult: 1.4
        },
        // Level 10: Final stand
        {
            waves: [
                { grunt: 6, rusher: 4, tank: 2, sniper: 2 },
                { tank: 4, sniper: 4 },
                { rusher: 10 },
                { grunt: 5, rusher: 5, tank: 3, sniper: 3 },
                { grunt: 8, rusher: 6, tank: 4, sniper: 4 }
            ],
            speedMult: 1.5, shootMult: 1.5
        }
    ],

    startLevel: function(index) {
        this.current = index;
        this.waveIndex = 0;
        this.waveTimer = 1.5; // Initial delay before first wave
        this.betweenWaves = true;
        this.allWavesSpawned = false;
        Game.enemies = [];
        Game.bullets = [];
        Player.reset();
    },

    update: function(dt) {
        var def = this.definitions[this.current];
        if (!def) return;

        // Between waves countdown
        if (this.betweenWaves) {
            this.waveTimer -= dt;
            if (this.waveTimer <= 0) {
                this.betweenWaves = false;
                this.spawnWave();
            }
            return;
        }

        // Check if all enemies are dead (wave complete)
        var allDead = true;
        for (var i = 0; i < Game.enemies.length; i++) {
            if (Game.enemies[i].active) { allDead = false; break; }
        }

        if (allDead) {
            if (this.waveIndex >= def.waves.length) {
                // Level complete
                this.allWavesSpawned = true;
                if (this.current >= this.definitions.length - 1) {
                    // Victory!
                    Game.setState('VICTORY');
                } else {
                    // Bonus for no damage
                    if (Player.noDamageThisLevel) {
                        Player.score += 500;
                    }
                    Game.setState('LEVEL_TRANSITION');
                }
            } else {
                // Next wave
                this.betweenWaves = true;
                this.waveTimer = this.waveDelay;
            }
        }
    },

    spawnWave: function() {
        var def = this.definitions[this.current];
        if (this.waveIndex >= def.waves.length) return;

        var wave = def.waves[this.waveIndex];
        var types = Object.keys(wave);
        for (var t = 0; t < types.length; t++) {
            var type = types[t];
            var count = wave[type];
            for (var i = 0; i < count; i++) {
                // Stagger spawns slightly
                (function(type, delay, speedMult, shootMult) {
                    setTimeout(function() {
                        if (Game.state === 'PLAYING') {
                            Spawner.spawnEnemy(type, speedMult, shootMult);
                        }
                    }, delay);
                })(type, i * 200, def.speedMult, def.shootMult);
            }
        }
        this.waveIndex++;
    },

    getWaveInfo: function() {
        var def = this.definitions[this.current];
        return {
            level: this.current + 1,
            wave: this.waveIndex,
            totalWaves: def ? def.waves.length : 0
        };
    }
};
