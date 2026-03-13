// player.js — Player entity
var Player = {
    x: 0, y: 0,
    w: 20, h: 20,
    speed: 180,
    hp: 5,
    maxHp: 5,
    angle: 0,
    shootCooldown: 0,
    shootRate: 0.18,
    bulletSpeed: 400,
    invincibleTime: 0,
    invincibleDuration: 1.0,
    blinkTimer: 0,
    alive: true,
    score: 0,
    noDamageThisLevel: true,

    init: function() {
        this.x = 400 - this.w / 2;
        this.y = 300 - this.h / 2;
        this.hp = this.maxHp;
        this.alive = true;
        this.score = 0;
        this.invincibleTime = 0;
        this.shootCooldown = 0;
        this.noDamageThisLevel = true;
    },

    reset: function() {
        this.x = 400 - this.w / 2;
        this.y = 300 - this.h / 2;
        this.invincibleTime = 0;
        this.shootCooldown = 0;
        this.noDamageThisLevel = true;
    },

    update: function(dt) {
        if (!this.alive) return;

        // Movement
        var dx = 0, dy = 0;
        if (Input.left()) dx -= 1;
        if (Input.right()) dx += 1;
        if (Input.up()) dy -= 1;
        if (Input.down()) dy += 1;

        // Normalize diagonal
        if (dx !== 0 && dy !== 0) {
            var inv = 1 / Math.sqrt(2);
            dx *= inv;
            dy *= inv;
        }

        this.x += dx * this.speed * dt;
        this.y += dy * this.speed * dt;

        // Clamp to canvas
        this.x = Math.max(0, Math.min(800 - this.w, this.x));
        this.y = Math.max(0, Math.min(600 - this.h, this.y));

        // Aim at mouse
        var cx = this.x + this.w / 2;
        var cy = this.y + this.h / 2;
        this.angle = Math.atan2(Input.mouse.y - cy, Input.mouse.x - cx);

        // Shoot
        this.shootCooldown -= dt;
        if (Input.mouse.down && this.shootCooldown <= 0) {
            this.shoot();
            this.shootCooldown = this.shootRate;
        }

        // Invincibility
        if (this.invincibleTime > 0) {
            this.invincibleTime -= dt;
            this.blinkTimer += dt;
        }
    },

    shoot: function() {
        var cx = this.x + this.w / 2;
        var cy = this.y + this.h / 2;
        var muzzleX = cx + Math.cos(this.angle) * 14;
        var muzzleY = cy + Math.sin(this.angle) * 14;
        var b = new Bullet(muzzleX, muzzleY, this.angle, this.bulletSpeed, 1, true);
        Game.bullets.push(b);
        Particles.muzzleFlash(muzzleX, muzzleY, this.angle);
        Audio.play('shoot');
    },

    takeDamage: function(dmg) {
        if (this.invincibleTime > 0) return;
        this.hp -= dmg;
        this.noDamageThisLevel = false;
        this.invincibleTime = this.invincibleDuration;
        this.blinkTimer = 0;
        Camera.shake(6, 0.2);
        Audio.play('playerHit');
        Particles.hit(this.x + this.w/2, this.y + this.h/2, '#00ff88');
        if (this.hp <= 0) {
            this.hp = 0;
            this.alive = false;
            Particles.explosion(this.x + this.w/2, this.y + this.h/2, '#00ffaa');
        }
    },

    draw: function(ctx) {
        if (!this.alive) return;

        // Blink when invincible
        if (this.invincibleTime > 0 && Math.floor(this.blinkTimer * 10) % 2 === 0) {
            return;
        }

        var cx = this.x + this.w / 2;
        var cy = this.y + this.h / 2;

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(this.angle);

        // Body
        ctx.fillStyle = '#00cc88';
        ctx.fillRect(-10, -10, 20, 20);

        // Body highlight
        ctx.fillStyle = '#00ffaa';
        ctx.fillRect(-8, -8, 12, 12);

        // Body shadow
        ctx.fillStyle = '#009966';
        ctx.fillRect(-10, 2, 20, 8);

        // Gun barrel
        ctx.fillStyle = '#444444';
        ctx.fillRect(4, -3, 14, 6);
        ctx.fillStyle = '#666666';
        ctx.fillRect(4, -3, 14, 3);

        // Muzzle tip
        ctx.fillStyle = '#888888';
        ctx.fillRect(16, -2, 2, 4);

        ctx.restore();

        // Debug hitbox
        if (Game.debug) {
            ctx.strokeStyle = '#00ff00';
            ctx.strokeRect(this.x, this.y, this.w, this.h);
        }
    }
};
