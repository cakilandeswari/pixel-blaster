// bullet.js — Bullet entity (shared by player and enemies)
function Bullet(x, y, angle, speed, damage, isPlayer, color) {
    this.x = x;
    this.y = y;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.speed = speed;
    this.damage = damage || 1;
    this.isPlayer = isPlayer;
    this.color = color || (isPlayer ? '#00ffaa' : '#ff4444');
    this.radius = isPlayer ? 3 : 3;
    this.active = true;
}

Bullet.prototype.update = function(dt) {
    this.x += this.vx * dt;
    this.y += this.vy * dt;

    // Deactivate if off screen
    if (this.x < -10 || this.x > 810 || this.y < -10 || this.y > 610) {
        this.active = false;
    }
};

Bullet.prototype.draw = function(ctx) {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();

    // Glow effect
    ctx.globalAlpha = 0.3;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius * 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
};
