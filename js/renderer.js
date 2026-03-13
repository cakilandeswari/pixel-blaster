// renderer.js — Drawing helpers, HUD, background, crosshair
var Renderer = {
    tileSize: 40,

    drawBackground: function(ctx) {
        // Dark base
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(0, 0, 800, 600);

        // Subtle tile grid
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
        ctx.lineWidth = 1;
        for (var x = 0; x < 800; x += this.tileSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, 600);
            ctx.stroke();
        }
        for (var y = 0; y < 600; y += this.tileSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(800, y);
            ctx.stroke();
        }

        // Random dots for texture variety per level
        ctx.fillStyle = 'rgba(255, 255, 255, 0.02)';
        var seed = (Levels.current + 1) * 7;
        for (var i = 0; i < 30; i++) {
            var px = ((seed * (i + 1) * 37) % 800);
            var py = ((seed * (i + 1) * 53) % 600);
            ctx.fillRect(px, py, 2, 2);
        }
    },

    drawCrosshair: function(ctx) {
        var mx = Input.mouse.x;
        var my = Input.mouse.y;
        var size = 10;
        var gap = 4;

        ctx.strokeStyle = '#00ffaa';
        ctx.lineWidth = 2;

        // Top
        ctx.beginPath();
        ctx.moveTo(mx, my - size);
        ctx.lineTo(mx, my - gap);
        ctx.stroke();
        // Bottom
        ctx.beginPath();
        ctx.moveTo(mx, my + gap);
        ctx.lineTo(mx, my + size);
        ctx.stroke();
        // Left
        ctx.beginPath();
        ctx.moveTo(mx - size, my);
        ctx.lineTo(mx - gap, my);
        ctx.stroke();
        // Right
        ctx.beginPath();
        ctx.moveTo(mx + gap, my);
        ctx.lineTo(mx + size, my);
        ctx.stroke();

        // Center dot
        ctx.fillStyle = '#00ffaa';
        ctx.fillRect(mx - 1, my - 1, 2, 2);
    },

    drawHUD: function(ctx) {
        var info = Levels.getWaveInfo();

        // Health bar
        var barX = 10, barY = 10, barW = 120, barH = 14;
        ctx.fillStyle = '#333333';
        ctx.fillRect(barX, barY, barW, barH);
        var healthPct = Player.hp / Player.maxHp;
        var healthColor = healthPct > 0.5 ? '#00cc44' : (healthPct > 0.25 ? '#ccaa00' : '#cc2222');
        ctx.fillStyle = healthColor;
        ctx.fillRect(barX, barY, barW * healthPct, barH);
        ctx.strokeStyle = '#888888';
        ctx.strokeRect(barX, barY, barW, barH);

        // Health text
        ctx.fillStyle = '#ffffff';
        ctx.font = '10px "Press Start 2P", monospace';
        ctx.fillText('HP ' + Player.hp + '/' + Player.maxHp, barX + 4, barY + 11);

        // Score
        ctx.fillStyle = '#ffcc00';
        ctx.font = '10px "Press Start 2P", monospace';
        ctx.textAlign = 'right';
        ctx.fillText('SCORE: ' + Player.score, 790, 21);
        ctx.textAlign = 'left';

        // Level / Wave
        ctx.fillStyle = '#aaaaaa';
        ctx.font = '10px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('LEVEL ' + info.level + '  WAVE ' + info.wave + '/' + info.totalWaves, 400, 21);
        ctx.textAlign = 'left';

        // Wave incoming text
        if (Levels.betweenWaves && Levels.waveTimer > 0) {
            ctx.fillStyle = '#ffaa00';
            ctx.font = '14px "Press Start 2P", monospace';
            ctx.textAlign = 'center';
            if (Levels.waveIndex === 0) {
                ctx.fillText('LEVEL ' + info.level, 400, 280);
                ctx.font = '10px "Press Start 2P", monospace';
                ctx.fillText('GET READY!', 400, 310);
            } else {
                ctx.fillText('NEXT WAVE', 400, 300);
            }
            ctx.textAlign = 'left';
        }

        // FPS counter (debug)
        if (Game.debug) {
            ctx.fillStyle = '#00ff00';
            ctx.font = '10px monospace';
            ctx.fillText('FPS: ' + Game.fps, 10, 590);
            ctx.fillText('Enemies: ' + Game.enemies.filter(function(e) { return e.active; }).length, 10, 578);
            ctx.fillText('Bullets: ' + Game.bullets.filter(function(b) { return b.active; }).length, 10, 566);
            ctx.fillText('Particles: ' + Game.particles.filter(function(p) { return p.active; }).length, 10, 554);
        }
    }
};
