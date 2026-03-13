# PIXEL BLASTER

A retro top-down shooter built with vanilla JavaScript and HTML5 Canvas. No build tools, no dependencies — just open and play.

## How to Play

Open `index.html` in any modern browser.

- **Move**: WASD or Arrow Keys
- **Aim**: Mouse
- **Shoot**: Left Click

Survive 10 levels of increasing difficulty. Health is restored between levels. Clear a level without taking damage for a +500 score bonus.

## Enemy Types

| Type | Color | Behavior |
|------|-------|----------|
| Grunt | Red | Approaches and shoots every 2s |
| Rusher | Orange | Charges directly, deals contact damage |
| Tank | Purple | Slow, tanky (3 HP), shoots every 1.5s |
| Sniper | Yellow | Stationary, fires fast bullets every 3s |

## Level Progression

- **Levels 1-2**: Grunts only
- **Levels 3-4**: + Rushers
- **Levels 5-6**: + Tanks
- **Levels 7-10**: All types with escalating speed and fire rate multipliers

## Debug

- Press **`** (backtick) to toggle debug overlay (FPS, entity counts, hitboxes)
- Run `Game.skipLevel()` in the browser console to skip the current level

## Tech

- Vanilla JS + HTML5 Canvas (800x600)
- Procedural pixel-art sprites
- Web Audio API for retro sound effects
- Particle system for explosions, sparks, and muzzle flash
- Screen shake on damage
