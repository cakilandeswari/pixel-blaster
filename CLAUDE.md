# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

PIXEL BLASTER — a retro top-down shooter. Vanilla JS + HTML5 Canvas, no build tools, no dependencies. Open `index.html` in a browser to run.

## Architecture

### Global Singletons + Prototypal Entities

All subsystems are global object literals (Game, Player, Input, Camera, Audio, Collision, Renderer, Screens, Levels, Particles, Spawner). Entities with many instances use constructor functions with prototype methods: `Enemy`, `Bullet`, `Particle`. Player is a singleton, not a constructor.

### Script Load Order (index.html)

Order matters — no modules, no bundler. Later scripts depend on globals from earlier ones:

```
input → camera → audio → collision → particles → bullet → player → enemy → level → renderer → screens → main
```

Key dependency: `player.js` before `enemy.js` (enemies reference Player). `main.js` must be last (it calls `Game.init()` on window load and references all other globals).

### State Machine

`Game.state` drives the top-level flow: `MENU → PLAYING → LEVEL_TRANSITION → PLAYING → ... → VICTORY` (with `GAME_OVER` branching from `PLAYING`). Update and draw logic switch on this state in `main.js`.

### Entity Lifecycle

Entities live in `Game.bullets[]`, `Game.enemies[]`, `Game.particles[]`. Each has an `active` flag — deactivated entities are skipped during update/draw and lazily cleaned up when arrays exceed size thresholds (100 bullets, 200 particles). Avoid splicing arrays during iteration.

### Wave Spawning

`Levels.definitions` is an array of 10 level objects, each with a `waves` array of `{ enemyType: count }` objects. Enemies are spawned with staggered `setTimeout` calls (200ms apart). The system waits for all active enemies to die before advancing waves/levels.

### Collision Dispatch

`Collision.js` provides pure utility functions (AABB, circle-AABB). Collision checking runs in `Game.checkCollisions()` in main.js. Rusher contact damage is handled separately inside `Enemy.prototype.update()`.

## Debug

- Backtick key toggles debug overlay (FPS, entity counts, hitboxes)
- `Game.skipLevel()` in browser console kills all enemies to advance
- `Game.debug = true` enables collision box rendering
