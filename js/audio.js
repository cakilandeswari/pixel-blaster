// audio.js — Procedural sound via Web Audio API
var Audio = {
    ctx: null,
    enabled: true,

    init: function() {
        try {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        } catch(e) {
            this.enabled = false;
        }
    },

    resume: function() {
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    },

    play: function(type) {
        if (!this.enabled || !this.ctx) return;
        try {
            this.resume();
            switch(type) {
                case 'shoot': this._shoot(); break;
                case 'enemyShoot': this._enemyShoot(); break;
                case 'hit': this._hit(); break;
                case 'kill': this._kill(); break;
                case 'playerHit': this._playerHit(); break;
                case 'levelUp': this._levelUp(); break;
                case 'gameOver': this._gameOver(); break;
                case 'select': this._select(); break;
            }
        } catch(e) {}
    },

    _noise: function(duration, volume) {
        var ctx = this.ctx;
        var bufferSize = ctx.sampleRate * duration;
        var buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        var data = buffer.getChannelData(0);
        for (var i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * volume;
        }
        var source = ctx.createBufferSource();
        source.buffer = buffer;
        return source;
    },

    _osc: function(freq, type, duration, volume) {
        var ctx = this.ctx;
        var osc = ctx.createOscillator();
        var gain = ctx.createGain();
        osc.type = type || 'square';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(volume || 0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + duration);
    },

    _shoot: function() {
        this._osc(800, 'square', 0.06, 0.1);
        this._osc(400, 'square', 0.04, 0.08);
    },

    _enemyShoot: function() {
        this._osc(300, 'sawtooth', 0.08, 0.06);
    },

    _hit: function() {
        this._osc(200, 'square', 0.1, 0.1);
    },

    _kill: function() {
        this._osc(150, 'square', 0.15, 0.12);
        this._osc(80, 'sawtooth', 0.2, 0.08);
    },

    _playerHit: function() {
        this._osc(100, 'sawtooth', 0.3, 0.15);
        this._osc(60, 'square', 0.2, 0.1);
    },

    _levelUp: function() {
        var self = this;
        var notes = [523, 659, 784, 1047];
        notes.forEach(function(freq, i) {
            setTimeout(function() {
                self._osc(freq, 'square', 0.15, 0.1);
            }, i * 100);
        });
    },

    _gameOver: function() {
        var self = this;
        var notes = [400, 350, 300, 200];
        notes.forEach(function(freq, i) {
            setTimeout(function() {
                self._osc(freq, 'sawtooth', 0.3, 0.12);
            }, i * 200);
        });
    },

    _select: function() {
        this._osc(600, 'square', 0.08, 0.08);
    }
};
