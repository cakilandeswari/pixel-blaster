// camera.js — Screen shake effect
var Camera = {
    shakeX: 0,
    shakeY: 0,
    shakeDuration: 0,
    shakeIntensity: 0,

    shake: function(intensity, duration) {
        this.shakeIntensity = intensity;
        this.shakeDuration = duration;
    },

    update: function(dt) {
        if (this.shakeDuration > 0) {
            this.shakeDuration -= dt;
            this.shakeX = (Math.random() - 0.5) * 2 * this.shakeIntensity;
            this.shakeY = (Math.random() - 0.5) * 2 * this.shakeIntensity;
        } else {
            this.shakeX = 0;
            this.shakeY = 0;
        }
    },

    apply: function(ctx) {
        ctx.translate(this.shakeX, this.shakeY);
    },

    reset: function() {
        this.shakeX = 0;
        this.shakeY = 0;
        this.shakeDuration = 0;
        this.shakeIntensity = 0;
    }
};
