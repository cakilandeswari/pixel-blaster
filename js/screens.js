// screens.js — Menu, game-over, victory, level-transition screens
var Screens = {
    transitionTimer: 0,
    transitionDuration: 3.0,

    drawMenu: function(ctx) {
        // Background
        ctx.fillStyle = '#0a0a1a';
        ctx.fillRect(0, 0, 800, 600);

        // Animated grid
        var t = Date.now() / 1000;
        ctx.strokeStyle = 'rgba(0, 255, 170, 0.05)';
        for (var x = 0; x < 800; x += 40) {
            var offset = Math.sin(t + x * 0.01) * 5;
            ctx.beginPath();
            ctx.moveTo(x, 0 + offset);
            ctx.lineTo(x, 600 + offset);
            ctx.stroke();
        }

        // Title
        ctx.fillStyle = '#00ffaa';
        ctx.font = '36px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('PIXEL', 400, 180);
        ctx.fillStyle = '#ff4444';
        ctx.fillText('BLASTER', 400, 230);

        // Subtitle
        ctx.fillStyle = '#888888';
        ctx.font = '10px "Press Start 2P", monospace';
        ctx.fillText('A RETRO TOP-DOWN SHOOTER', 400, 270);

        // Instructions
        ctx.fillStyle = '#cccccc';
        ctx.font = '12px "Press Start 2P", monospace';
        ctx.fillText('CLICK TO START', 400, 360);

        ctx.font = '10px "Press Start 2P", monospace';
        ctx.fillStyle = '#888888';
        ctx.fillText('WASD / ARROWS = MOVE', 400, 420);
        ctx.fillText('MOUSE = AIM & SHOOT', 400, 445);
        ctx.fillText('SURVIVE 10 LEVELS', 400, 470);

        // Blinking effect
        if (Math.floor(t * 2) % 2 === 0) {
            ctx.fillStyle = '#00ffaa';
            ctx.font = '12px "Press Start 2P", monospace';
            ctx.fillText('CLICK TO START', 400, 360);
        }

        ctx.textAlign = 'left';
    },

    drawGameOver: function(ctx) {
        // Dim overlay
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(0, 0, 800, 600);

        ctx.textAlign = 'center';

        // Title
        ctx.fillStyle = '#ff4444';
        ctx.font = '30px "Press Start 2P", monospace';
        ctx.fillText('GAME OVER', 400, 220);

        // Score
        ctx.fillStyle = '#ffcc00';
        ctx.font = '14px "Press Start 2P", monospace';
        ctx.fillText('SCORE: ' + Player.score, 400, 290);

        // Level reached
        ctx.fillStyle = '#aaaaaa';
        ctx.font = '10px "Press Start 2P", monospace';
        ctx.fillText('REACHED LEVEL ' + (Levels.current + 1), 400, 330);

        // Restart
        ctx.fillStyle = '#cccccc';
        ctx.font = '12px "Press Start 2P", monospace';
        var t = Date.now() / 1000;
        if (Math.floor(t * 2) % 2 === 0) {
            ctx.fillText('CLICK TO RETRY', 400, 400);
        }

        ctx.textAlign = 'left';
    },

    drawVictory: function(ctx) {
        // Background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(0, 0, 800, 600);

        ctx.textAlign = 'center';

        // Title
        ctx.fillStyle = '#00ffaa';
        ctx.font = '28px "Press Start 2P", monospace';
        ctx.fillText('VICTORY!', 400, 180);

        // Subtitle
        ctx.fillStyle = '#ffcc00';
        ctx.font = '12px "Press Start 2P", monospace';
        ctx.fillText('ALL LEVELS CLEARED!', 400, 230);

        // Score
        ctx.fillStyle = '#ffffff';
        ctx.font = '16px "Press Start 2P", monospace';
        ctx.fillText('FINAL SCORE', 400, 300);
        ctx.fillStyle = '#ffcc00';
        ctx.font = '24px "Press Start 2P", monospace';
        ctx.fillText('' + Player.score, 400, 340);

        // Stars (particles)
        var t = Date.now() / 1000;
        ctx.fillStyle = '#ffcc00';
        for (var i = 0; i < 20; i++) {
            var sx = 200 + Math.sin(t * 2 + i * 1.3) * 200;
            var sy = 100 + Math.cos(t * 1.5 + i * 0.9) * 150 + 150;
            var ss = 2 + Math.sin(t * 3 + i) * 1;
            ctx.fillRect(sx, sy, ss, ss);
        }

        // Restart
        ctx.fillStyle = '#cccccc';
        ctx.font = '12px "Press Start 2P", monospace';
        if (Math.floor(t * 2) % 2 === 0) {
            ctx.fillText('CLICK FOR MENU', 400, 440);
        }

        ctx.textAlign = 'left';
    },

    startTransition: function() {
        this.transitionTimer = this.transitionDuration;
    },

    updateTransition: function(dt) {
        this.transitionTimer -= dt;
        if (this.transitionTimer <= 0) {
            // Advance to next level
            Levels.startLevel(Levels.current + 1);
            Player.hp = Player.maxHp; // Restore health between levels
            Game.setState('PLAYING');
        }
    },

    drawTransition: function(ctx) {
        // Dim overlay
        ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
        ctx.fillRect(0, 0, 800, 600);

        ctx.textAlign = 'center';

        // Level complete
        ctx.fillStyle = '#00ffaa';
        ctx.font = '22px "Press Start 2P", monospace';
        ctx.fillText('LEVEL ' + (Levels.current + 1) + ' CLEAR!', 400, 230);

        // Score
        ctx.fillStyle = '#ffcc00';
        ctx.font = '12px "Press Start 2P", monospace';
        ctx.fillText('SCORE: ' + Player.score, 400, 280);

        // No damage bonus
        if (Player.noDamageThisLevel) {
            ctx.fillStyle = '#ff44ff';
            ctx.font = '10px "Press Start 2P", monospace';
            ctx.fillText('NO DAMAGE BONUS: +500', 400, 310);
        }

        // Health restored
        ctx.fillStyle = '#00cc44';
        ctx.font = '10px "Press Start 2P", monospace';
        ctx.fillText('HEALTH RESTORED', 400, 340);

        // Next level
        ctx.fillStyle = '#aaaaaa';
        ctx.font = '12px "Press Start 2P", monospace';
        var nextLevel = Levels.current + 2;
        ctx.fillText('NEXT: LEVEL ' + nextLevel, 400, 390);

        // Countdown
        var secs = Math.ceil(this.transitionTimer);
        ctx.fillStyle = '#ffffff';
        ctx.font = '14px "Press Start 2P", monospace';
        ctx.fillText('' + secs, 400, 440);

        ctx.textAlign = 'left';
    }
};
