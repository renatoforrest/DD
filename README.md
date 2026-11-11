# Hollow Depths

A dark, real-time 2D action dungeon crawler built with Phaser 3. Walk corridors and
rooms toward the end of the dungeon — enemies are randomly placed and will **ambush**
you into a battle scene when you get close. Darkest Dungeon atmosphere, action combat.

## Run it

Any static server works (textures are generated at runtime, only Phaser comes from CDN):

```bash
cd hollow-depths
python3 -m http.server 8080
# open http://localhost:8080
```

Opening `index.html` directly via `file://` also works.

## Controls

| Key | Action |
|---|---|
| WASD / Arrows | Move |
| J / Space | Attack (arc slash in facing direction) |
| K / Shift | Dash (brief invulnerability) |
| Enter | New run (end screen) |

## Structure

- **Corridor scene** — long narrow passage, entrance door on the left, exit door on the right.
- **Room scene** — wider chamber with pillars, entrance + exit doors.
- **Battle scene** — triggered by ambush when an enemy touches you; nearby enemies join (up to 3).
  Win to return to the corridor/room with those enemies removed; die and the run ends.

A run is 6 nodes: Corridor → Room → Corridor → Room → Corridor → Boss Room.
HP persists across scenes. The last room holds a boss plus adds.

## Performance notes (per TF2sUIPK-PHASER-OPTIMIZATION-NOTES.md)

- Internal render resolution **640×360**, integer-scaled via CSS (`image-rendering: pixelated`),
  `Phaser.Scale.NONE` — never `Scale.FIT`.
- **Renderer auto-detect** before game creation: probes `UNMASKED_RENDERER_WEBGL` and falls back
  to `Phaser.CANVAS` on software rasterizers (WARP / SwiftShader / llvmpipe). Manual override:
  `?renderer=canvas` or `?renderer=webgl`.
- `render.desynchronized: true`, `antialias: false`, no `powerPreference`, `pixelArt: false`.
- All static backgrounds (walls, floor grid, torch glows, pillars, stains) are **baked into a
  single CanvasTexture** per scene — one draw call instead of dozens of objects.
- Camera uses snap follow `startFollow(player, true, 1, 1)` — no per-frame lerp.
- No infinite tweens; the only tweens are one-shot hint/AMBUSH fade-outs.
- Geometry reused (`Phaser.Geom.Circle`/`Rectangle` `.setTo()`) instead of per-attack allocations.
- `[PERF]` renderer + GPU + zoom logged on boot; FPS counter (DOM overlay, updated 4×/s)
  reads `game.loop.actualFps`.
