// input.js — Keyboard + mouse input tracking
var Input = {
    keys: {},
    mouse: { x: 400, y: 300, down: false },

    init: function(canvas) {
        var self = this;
        window.addEventListener('keydown', function(e) {
            self.keys[e.key.toLowerCase()] = true;
            if (['arrowup','arrowdown','arrowleft','arrowright',' '].indexOf(e.key.toLowerCase()) !== -1) {
                e.preventDefault();
            }
        });
        window.addEventListener('keyup', function(e) {
            self.keys[e.key.toLowerCase()] = false;
        });
        canvas.addEventListener('mousemove', function(e) {
            var rect = canvas.getBoundingClientRect();
            var scaleX = canvas.width / rect.width;
            var scaleY = canvas.height / rect.height;
            self.mouse.x = (e.clientX - rect.left) * scaleX;
            self.mouse.y = (e.clientY - rect.top) * scaleY;
        });
        canvas.addEventListener('mousedown', function(e) {
            if (e.button === 0) self.mouse.down = true;
        });
        canvas.addEventListener('mouseup', function(e) {
            if (e.button === 0) self.mouse.down = false;
        });
        canvas.addEventListener('contextmenu', function(e) { e.preventDefault(); });
    },

    isDown: function(key) {
        return !!this.keys[key];
    },

    left: function() {
        return this.isDown('a') || this.isDown('arrowleft');
    },
    right: function() {
        return this.isDown('d') || this.isDown('arrowright');
    },
    up: function() {
        return this.isDown('w') || this.isDown('arrowup');
    },
    down: function() {
        return this.isDown('s') || this.isDown('arrowdown');
    }
};
