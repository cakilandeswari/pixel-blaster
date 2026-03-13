// collision.js — Collision detection helpers
var Collision = {
    // AABB vs AABB
    aabb: function(a, b) {
        return a.x < b.x + b.w &&
               a.x + a.w > b.x &&
               a.y < b.y + b.h &&
               a.y + a.h > b.y;
    },

    // Circle vs AABB
    circleAABB: function(cx, cy, cr, rect) {
        var closestX = Math.max(rect.x, Math.min(cx, rect.x + rect.w));
        var closestY = Math.max(rect.y, Math.min(cy, rect.y + rect.h));
        var dx = cx - closestX;
        var dy = cy - closestY;
        return (dx * dx + dy * dy) < (cr * cr);
    },

    // Point in rect
    pointInRect: function(px, py, rect) {
        return px >= rect.x && px <= rect.x + rect.w &&
               py >= rect.y && py <= rect.y + rect.h;
    },

    // Check bullet vs entity (bullet is small circle, entity is AABB)
    bulletHitsEntity: function(bullet, entity) {
        return this.circleAABB(
            bullet.x, bullet.y, bullet.radius || 3,
            { x: entity.x, y: entity.y, w: entity.w || entity.size, h: entity.h || entity.size }
        );
    }
};
