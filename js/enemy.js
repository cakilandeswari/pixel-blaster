// enemy.js — Enemy types + spawner

// Enemy constructor
function Enemy(type, x, y, speedMult, shootMult) {
    this.type = type;
    this.x = x;
    this.y = y;
    this.active = true;
    this.shootTimer = Math.random() * 2; // Stagger initial shots
    this.speedMult = speedMult || 1;
    this.shootMult = shootMult || 1;

    var def = Enemy.types[type];
    this.hp = def.hp;
    this.maxHp = def.hp;
    this.speed = def.speed * this.speedMult;
    this.shootRate = def.shootRate;
    this.bulletSpeed = def.bulletSpeed || 200;
    this.color = def.color;
    this.size = def.size;
    this.w = def.size;
    this.h = def.size;
    this.contactDamage = def.contactDamage || false;
    this.score = def.score;
    this.hitFlash = 0;
}

Enemy.types = {
    grunt: {
        hp: 1, speed: 60, size: 18, color: '#cc3333',
        shootRate: 2.0, bulletSpeed: 180, contactDamage: false,
        score: 100
    },
    rusher: {
        hp: 1, speed: 140, size: 16, color: '#ff8800',
        shootRate: 0, bulletSpeed: 0, contactDamage: true,
        score: 150
    },
    tank: {
        hp: 3, speed: 40, size: 24, color: '#8833cc',
        shootRate: 1.5, bulletSpeed: 160, contactDamage: false,
        score: 250
    },
    sniper: {
        hp: 1, speed: 0, size: 16, color: '#cccc00',
        shootRate: 3.0, bulletSpeed: 350, contactDamage: false,
        score: 200
    }
};

Enemy.prototype.update = function(dt) {
    if (!this.active) return;

    var pcx = Player.x + Player.w / 2;
    var pcy = Player.y + Player.h / 2;
    var ecx = this.x + this.size / 2;
    var ecy = this.y + this.size / 2;
    var dx = pcx - ecx;
    var dy = pcy - ecy;
    var dist = Math.sqrt(dx * dx + dy * dy);

    // Movement
    if (this.speed > 0 && dist > 0) {
        var nx = dx / dist;
        var ny = dy / dist;

        if (this.type === 'grunt' || this.type === 'tank') {
            // Stop approaching at a distance
            var minDist = this.type === 'tank' ? 100 : 150;
            if (dist > minDist) {
                this.x += nx * this.speed * dt;
                this.y += ny * this.speed * dt;
            }
        } else if (this.type === 'rusher') {
            this.x += nx * this.speed * dt;
            this.y += ny * this.speed * dt;
        }
    }

    // Clamp to canvas
    this.x = Math.max(0, Math.min(800 - this.size, this.x));
    this.y = Math.max(0, Math.min(600 - this.size, this.y));

    // Shooting
    if (this.shootRate > 0 && Player.alive) {
        this.shootTimer += dt;
        var effectiveRate = this.shootRate / this.shootMult;
        if (this.shootTimer >= effectiveRate) {
            this.shootTimer = 0;
            var angle = Math.atan2(dy, dx);
            var bx = ecx + Math.cos(angle) * (this.size / 2 + 4);
            var by = ecy + Math.sin(angle) * (this.size / 2 + 4);
            var b = new Bullet(bx, by, angle, this.bulletSpeed, 1, false, '#ff4444');
            Game.bullets.push(b);
            Audio.play('enemyShoot');
        }
    }

    // Contact damage (rushers)
    if (this.contactDamage && Player.alive) {
        if (Collision.aabb(
            { x: this.x, y: this.y, w: this.size, h: this.size },
            { x: Player.x, y: Player.y, w: Player.w, h: Player.h }
        )) {
            Player.takeDamage(1);
            this.active = false;
            Particles.explosion(ecx, ecy, this.color);
            Audio.play('kill');
        }
    }

    // Hit flash
    if (this.hitFlash > 0) this.hitFlash -= dt;
};

Enemy.prototype.takeDamage = function(dmg) {
    this.hp -= dmg;
    this.hitFlash = 0.1;
    if (this.hp <= 0) {
        this.active = false;
        Player.score += this.score;
        var ecx = this.x + this.size / 2;
        var ecy = this.y + this.size / 2;
        Particles.explosion(ecx, ecy, this.color);
        Audio.play('kill');
    } else {
        var ecx = this.x + this.size / 2;
        var ecy = this.y + this.size / 2;
        Particles.hit(ecx, ecy, this.color);
        Audio.play('hit');
    }
};

Enemy.prototype.draw = function(ctx) {
    if (!this.active) return;
    var s = this.size;

    ctx.save();
    ctx.translate(this.x, this.y);

    // Main body
    ctx.fillStyle = this.hitFlash > 0 ? '#ffffff' : this.color;
    ctx.fillRect(0, 0, s, s);

    // Highlight
    ctx.fillStyle = this.hitFlash > 0 ? '#ffffff' : this._lighten(this.color);
    ctx.fillRect(2, 2, s * 0.6, s * 0.6);

    // Shadow
    ctx.fillStyle = this._darken(this.color);
    ctx.fillRect(0, s * 0.6, s, s * 0.4);

    // Eyes
    ctx.fillStyle = '#ffffff';
    if (this.type === 'grunt') {
        ctx.fillRect(3, 4, 4, 4);
        ctx.fillRect(s - 7, 4, 4, 4);
        ctx.fillStyle = '#000000';
        ctx.fillRect(5, 5, 2, 2);
        ctx.fillRect(s - 5, 5, 2, 2);
    } else if (this.type === 'rusher') {
        // Angry eyes
        ctx.fillRect(2, 3, 5, 3);
        ctx.fillRect(s - 7, 3, 5, 3);
        ctx.fillStyle = '#000000';
        ctx.fillRect(4, 4, 2, 2);
        ctx.fillRect(s - 5, 4, 2, 2);
    } else if (this.type === 'tank') {
        ctx.fillRect(4, 5, 6, 6);
        ctx.fillRect(s - 10, 5, 6, 6);
        ctx.fillStyle = '#000000';
        ctx.fillRect(7, 7, 3, 3);
        ctx.fillRect(s - 7, 7, 3, 3);
    } else if (this.type === 'sniper') {
        // Scope eye
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(s/2 - 3, 3, 6, 6);
        ctx.fillStyle = '#000000';
        ctx.fillRect(s/2 - 1, 5, 2, 2);
    }

    // Tank armor marks
    if (this.type === 'tank') {
        ctx.fillStyle = '#6622aa';
        ctx.fillRect(2, s - 6, s - 4, 3);
    }

    ctx.restore();

    // Health bar for tanks
    if (this.type === 'tank' && this.hp < this.maxHp) {
        var barW = this.size;
        var barH = 3;
        var barX = this.x;
        var barY = this.y - 6;
        ctx.fillStyle = '#333333';
        ctx.fillRect(barX, barY, barW, barH);
        ctx.fillStyle = '#00ff00';
        ctx.fillRect(barX, barY, barW * (this.hp / this.maxHp), barH);
    }

    // Debug hitbox
    if (Game.debug) {
        ctx.strokeStyle = '#ff0000';
        ctx.strokeRect(this.x, this.y, this.size, this.size);
    }
};

Enemy.prototype._lighten = function(hex) {
    var r = parseInt(hex.slice(1,3), 16);
    var g = parseInt(hex.slice(3,5), 16);
    var b = parseInt(hex.slice(5,7), 16);
    r = Math.min(255, r + 40);
    g = Math.min(255, g + 40);
    b = Math.min(255, b + 40);
    return '#' + ((1<<24)+(r<<16)+(g<<8)+b).toString(16).slice(1);
};

Enemy.prototype._darken = function(hex) {
    var r = parseInt(hex.slice(1,3), 16);
    var g = parseInt(hex.slice(3,5), 16);
    var b = parseInt(hex.slice(5,7), 16);
    r = Math.max(0, r - 50);
    g = Math.max(0, g - 50);
    b = Math.max(0, b - 50);
    return '#' + ((1<<24)+(r<<16)+(g<<8)+b).toString(16).slice(1);
};

// Spawner
var Spawner = {
    spawnEnemy: function(type, speedMult, shootMult) {
        var side = Math.floor(Math.random() * 4);
        var x, y;
        var size = Enemy.types[type].size;

        switch(side) {
            case 0: x = Math.random() * 800; y = -size; break;       // top
            case 1: x = 800; y = Math.random() * 600; break;         // right
            case 2: x = Math.random() * 800; y = 600; break;         // bottom
            case 3: x = -size; y = Math.random() * 600; break;       // left
        }

        // For snipers, place them at edges but inside the canvas
        if (type === 'sniper') {
            switch(side) {
                case 0: y = 20; break;
                case 1: x = 800 - size - 20; break;
                case 2: y = 600 - size - 20; break;
                case 3: x = 20; break;
            }
        }

        var enemy = new Enemy(type, x, y, speedMult, shootMult);
        Game.enemies.push(enemy);
    }
};
