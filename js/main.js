// main.js — Game loop, state machine, shared state
var Game = {
    canvas: null,
    ctx: null,
    state: 'MENU', // MENU, PLAYING, LEVEL_TRANSITION, GAME_OVER, VICTORY
    bullets: [],
    enemies: [],
    particles: [],
    lastTime: 0,
    debug: false,
    fps: 0,
    fpsCounter: 0,
    fpsTimer: 0,

    init: function() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.style.cursor = 'none';

        Input.init(this.canvas);
        Audio.init();

        // Click handler for menu / game over / victory
        var self = this;
        this.canvas.addEventListener('click', function() {
            Audio.resume();
            if (self.state === 'MENU') {
                self.startGame();
            } else if (self.state === 'GAME_OVER') {
                self.setState('MENU');
            } else if (self.state === 'VICTORY') {
                self.setState('MENU');
            }
        });

        // Debug toggle
        window.addEventListener('keydown', function(e) {
            if (e.key === '`') self.debug = !self.debug;
        });

        // Skip level (debug)
        window.skipLevel = function() { self.skipLevel(); };
        // Also accessible as Game.skipLevel()

        this.lastTime = performance.now();
        this.loop();
    },

    startGame: function() {
        this.bullets = [];
        this.enemies = [];
        this.particles = [];
        Player.init();
        Levels.startLevel(0);
        this.setState('PLAYING');
        Audio.play('select');
    },

    setState: function(newState) {
        var oldState = this.state;
        this.state = newState;

        if (newState === 'LEVEL_TRANSITION') {
            Screens.startTransition();
            Audio.play('levelUp');
        } else if (newState === 'GAME_OVER') {
            Audio.play('gameOver');
        } else if (newState === 'VICTORY') {
            Audio.play('levelUp');
        }
    },

    skipLevel: function() {
        if (this.state !== 'PLAYING') return;
        // Kill all enemies
        for (var i = 0; i < this.enemies.length; i++) {
            this.enemies[i].active = false;
        }
        this.bullets = [];
    },

    loop: function() {
        var now = performance.now();
        var dt = (now - this.lastTime) / 1000;
        this.lastTime = now;

        // Cap delta time
        if (dt > 0.05) dt = 0.05;

        // FPS counter
        this.fpsCounter++;
        this.fpsTimer += dt;
        if (this.fpsTimer >= 1) {
            this.fps = this.fpsCounter;
            this.fpsCounter = 0;
            this.fpsTimer = 0;
        }

        this.update(dt);
        this.draw();

        var self = this;
        requestAnimationFrame(function() { self.loop(); });
    },

    update: function(dt) {
        switch(this.state) {
            case 'MENU':
                break;

            case 'PLAYING':
                Camera.update(dt);
                Player.update(dt);

                // Update enemies
                for (var i = 0; i < this.enemies.length; i++) {
                    if (this.enemies[i].active) this.enemies[i].update(dt);
                }

                // Update bullets
                for (var i = 0; i < this.bullets.length; i++) {
                    if (this.bullets[i].active) this.bullets[i].update(dt);
                }

                // Update particles
                for (var i = 0; i < this.particles.length; i++) {
                    if (this.particles[i].active) this.particles[i].update(dt);
                }

                // Collision detection
                this.checkCollisions();

                // Clean up inactive entities
                this.cleanup();

                // Level system
                Levels.update(dt);

                // Check player death
                if (!Player.alive && this.state === 'PLAYING') {
                    this.setState('GAME_OVER');
                }
                break;

            case 'LEVEL_TRANSITION':
                Screens.updateTransition(dt);
                // Still update particles for visual
                for (var i = 0; i < this.particles.length; i++) {
                    if (this.particles[i].active) this.particles[i].update(dt);
                }
                break;

            case 'GAME_OVER':
                // Still update particles
                for (var i = 0; i < this.particles.length; i++) {
                    if (this.particles[i].active) this.particles[i].update(dt);
                }
                break;

            case 'VICTORY':
                break;
        }
    },

    checkCollisions: function() {
        // Player bullets vs enemies
        for (var i = 0; i < this.bullets.length; i++) {
            var b = this.bullets[i];
            if (!b.active || !b.isPlayer) continue;

            for (var j = 0; j < this.enemies.length; j++) {
                var e = this.enemies[j];
                if (!e.active) continue;

                if (Collision.bulletHitsEntity(b, e)) {
                    b.active = false;
                    e.takeDamage(b.damage);
                    Particles.sparks(b.x, b.y);
                    break;
                }
            }
        }

        // Enemy bullets vs player
        if (Player.alive) {
            for (var i = 0; i < this.bullets.length; i++) {
                var b = this.bullets[i];
                if (!b.active || b.isPlayer) continue;

                if (Collision.bulletHitsEntity(b, Player)) {
                    b.active = false;
                    Player.takeDamage(b.damage);
                    break;
                }
            }
        }
    },

    cleanup: function() {
        // Remove inactive bullets (keep array compact)
        if (this.bullets.length > 100) {
            this.bullets = this.bullets.filter(function(b) { return b.active; });
        }
        if (this.particles.length > 200) {
            this.particles = this.particles.filter(function(p) { return p.active; });
        }
    },

    draw: function() {
        var ctx = this.ctx;

        ctx.save();

        switch(this.state) {
            case 'MENU':
                Screens.drawMenu(ctx);
                break;

            case 'PLAYING':
                Camera.apply(ctx);
                Renderer.drawBackground(ctx);

                // Draw entities
                Player.draw(ctx);

                for (var i = 0; i < this.enemies.length; i++) {
                    if (this.enemies[i].active) this.enemies[i].draw(ctx);
                }

                for (var i = 0; i < this.bullets.length; i++) {
                    if (this.bullets[i].active) this.bullets[i].draw(ctx);
                }

                for (var i = 0; i < this.particles.length; i++) {
                    if (this.particles[i].active) this.particles[i].draw(ctx);
                }

                Renderer.drawCrosshair(ctx);
                Renderer.drawHUD(ctx);
                break;

            case 'LEVEL_TRANSITION':
                Renderer.drawBackground(ctx);
                Player.draw(ctx);
                for (var i = 0; i < this.particles.length; i++) {
                    if (this.particles[i].active) this.particles[i].draw(ctx);
                }
                Screens.drawTransition(ctx);
                break;

            case 'GAME_OVER':
                Renderer.drawBackground(ctx);
                for (var i = 0; i < this.enemies.length; i++) {
                    if (this.enemies[i].active) this.enemies[i].draw(ctx);
                }
                for (var i = 0; i < this.particles.length; i++) {
                    if (this.particles[i].active) this.particles[i].draw(ctx);
                }
                Screens.drawGameOver(ctx);
                break;

            case 'VICTORY':
                Screens.drawVictory(ctx);
                break;
        }

        ctx.restore();
    }
};

// Start game when page loads
window.addEventListener('load', function() {
    Game.init();
});
