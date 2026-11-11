const CFG = { WIDTH: 640, HEIGHT: 360 };

const RENDERER_PREF = new URLSearchParams(location.search).get('renderer');

function pickRenderer() {
  if (RENDERER_PREF === 'canvas') return Phaser.CANVAS;
  if (RENDERER_PREF === 'webgl') return Phaser.WEBGL;
  try {
    const probe = document.createElement('canvas').getContext('webgl');
    if (!probe) return Phaser.CANVAS;
    const ext = probe.getExtension('WEBGL_debug_renderer_info');
    const gpu = ext ? probe.getParameter(ext.UNMASKED_RENDERER_WEBGL) : '';
    const lose = probe.getExtension('WEBGL_lose_context');
    if (lose) lose.loseContext();
    if (/Basic Render|SwiftShader|llvmpipe|Software|WARP/i.test(gpu)) {
      console.log(`[PERF] Software GPU detected ("${gpu}") -> using Canvas2D`);
      return Phaser.CANVAS;
    }
  } catch (_) {}
  return Phaser.WEBGL;
}

function applyIntegerZoom(game) {
  const canvas = game.canvas;
  if (!canvas) return;
  const zoom = Math.max(1, Math.floor(Math.min(
    window.innerWidth / CFG.WIDTH,
    window.innerHeight / CFG.HEIGHT
  )));
  canvas.style.width = (CFG.WIDTH * zoom) + 'px';
  canvas.style.height = (CFG.HEIGHT * zoom) + 'px';
  canvas.style.imageRendering = 'pixelated';
  canvas.dataset.zoom = zoom;
  console.log(`[PERF] Effective zoom: ${zoom}x (${CFG.WIDTH * zoom}x${CFG.HEIGHT * zoom})`);
}

window.addEventListener('load', () => {
  const game = new Phaser.Game({
    type: pickRenderer(),
    parent: 'game',
    width: CFG.WIDTH,
    height: CFG.HEIGHT,
    backgroundColor: '#050508',
    pixelArt: false,
    physics: { default: 'arcade', arcade: { debug: false, gravity: { y: 0 } } },
    scale: { mode: Phaser.Scale.NONE, autoCenter: Phaser.Scale.NO_CENTER },
    render: {
      antialias: false,
      desynchronized: true,
      clearBeforeRender: true,
      roundPixels: false
    },
    scene: [BootScene, CorridorScene, RoomScene, BattleScene, EndScene]
  });

  window.__game = game;

  game.events.once('ready', () => {
    const name = game.renderer.type === Phaser.WEBGL ? 'WEBGL' : 'CANVAS';
    const gl = game.renderer.gl;
    let gpu = 'n/a (Canvas2D)';
    if (gl) {
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      if (ext) gpu = gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) || gpu;
    }
    console.log(`[PERF] Renderer: ${name}`);
    console.log(`[PERF] GPU: ${gpu}`);
    if (game.input.keyboard) {
      game.input.keyboard.addCapture('W,A,S,D,UP,DOWN,LEFT,RIGHT,SPACE,J,K,SHIFT,ENTER');
    }
    applyIntegerZoom(game);
  });

  window.addEventListener('resize', () => applyIntegerZoom(game));

  setInterval(() => {
    const el = document.getElementById('fps');
    if (el && game.loop) el.textContent = Math.round(game.loop.actualFps) + ' FPS';
  }, 250);
});
