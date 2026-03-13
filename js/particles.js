// particles.js — Particle system (explosions, sparks, muzzle flash)
function Particle(x, y, vx, vy, life, color, size) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.life = life;
    this.maxLife = life;
    this.color = color;
    this.size = size || 3;
    this.active = true;
}

Particle.prototype.update = function(dt) {
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.life -= dt;
    if (this.life <= 0) this.active = false;
};

Particle.prototype.draw = function(ctx) {
    var alpha = this.life / this.maxLife;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = this.color;
    var s = this.size * (0.5 + 0.5 * alpha);
    ctx.fillRect(this.x - s/2, this.y - s/2, s, s);
    ctx.globalAlpha = 1;
};

var Particles = {
    spawn: function(x, y, count, color, speed, life, size) {
        for (var i = 0; i < count; i++) {
            var angle = Math.random() * Math.PI * 2;
            var spd = speed * (0.3 + Math.random() * 0.7);
            var p = new Particle(
                x, y,
                Math.cos(angle) * spd,
                Math.sin(angle) * spd,
                life * (0.5 + Math.random() * 0.5),
                color,
                size || 3
            );
            Game.particles.push(p);
        }
    },

    explosion: function(x, y, color) {
        this.spawn(x, y, 12, color || '#ff4444', 120, 0.4, 4);
        this.spawn(x, y, 6, '#ffaa00', 80, 0.3, 3);
        this.spawn(x, y, 4, '#ffffff', 60, 0.2, 2);
    },

    hit: function(x, y, color) {
        this.spawn(x, y, 5, color || '#ffffff', 80, 0.2, 2);
    },

    muzzleFlash: function(x, y, angle) {
        var fx = x + Math.cos(angle) * 5;
        var fy = y + Math.sin(angle) * 5;
        this.spawn(fx, fy, 3, '#ffff00', 60, 0.1, 3);
        this.spawn(fx, fy, 2, '#ffffff', 40, 0.08, 2);
    },

    sparks: function(x, y) {
        this.spawn(x, y, 3, '#ffaa00', 100, 0.15, 2);
    }
};
