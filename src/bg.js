function bakeBackground(scene, key, w, h, opts) {
  if (scene.textures.exists(key)) scene.textures.remove(key);
  const tex = scene.textures.createCanvas(key, w, h);
  const ctx = tex.getContext();
  const top = opts.wallTop;
  const bot = opts.wallBottom;
  const floorH = h - top - bot;

  ctx.fillStyle = '#15151d';
  ctx.fillRect(0, 0, w, top);
  ctx.fillRect(0, h - bot, w, bot);

  ctx.strokeStyle = 'rgba(255,255,255,0.05)';
  for (let y = 10; y < top; y += 14) {
    ctx.beginPath();
    ctx.moveTo(0, y + 0.5);
    ctx.lineTo(w, y + 0.5);
    ctx.stroke();
  }
  for (let y = h - bot + 7; y < h; y += 14) {
    ctx.beginPath();
    ctx.moveTo(0, y + 0.5);
    ctx.lineTo(w, y + 0.5);
    ctx.stroke();
  }
  let row = 0;
  for (let y = 0; y < top; y += 14) {
    for (let x = (row % 2) * 26; x < w; x += 52) {
      ctx.beginPath();
      ctx.moveTo(x + 0.5, y);
      ctx.lineTo(x + 0.5, y + 14);
      ctx.stroke();
    }
    row++;
  }

  ctx.fillStyle = opts.floor || '#232330';
  ctx.fillRect(0, top, w, floorH);

  ctx.strokeStyle = 'rgba(0,0,0,0.3)';
  for (let x = 0; x < w; x += 48) {
    ctx.beginPath();
    ctx.moveTo(x + 0.5, top);
    ctx.lineTo(x + 0.5, top + floorH);
    ctx.stroke();
  }
  for (let y = top + 24; y < h - bot; y += 24) {
    ctx.beginPath();
    ctx.moveTo(0, y + 0.5);
    ctx.lineTo(w, y + 0.5);
    ctx.stroke();
  }

  ctx.fillStyle = 'rgba(0,0,0,0.18)';
  for (let i = 0; i < Math.floor(w / 90); i++) {
    const sx = Math.random() * w;
    const sy = top + 10 + Math.random() * (floorH - 20);
    ctx.beginPath();
    ctx.ellipse(sx, sy, 12 + Math.random() * 22, 5 + Math.random() * 8, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  if (opts.pillars) {
    for (let x = 150; x < w - 90; x += 240) {
      ctx.fillStyle = '#1b1b24';
      ctx.fillRect(x, top, 26, floorH);
      ctx.fillStyle = '#262633';
      ctx.fillRect(x, top, 8, floorH);
      ctx.fillStyle = '#12121a';
      ctx.fillRect(x - 4, top, 34, 10);
      ctx.fillRect(x - 4, top + floorH - 12, 34, 12);
    }
  }

  const spacing = opts.torchSpacing || 200;
  for (let x = 70; x < w - 40; x += spacing) {
    const ty = top - 4;
    const grd = ctx.createRadialGradient(x, ty + 16, 4, x, ty + 16, 52);
    grd.addColorStop(0, 'rgba(255,180,90,0.30)');
    grd.addColorStop(1, 'rgba(255,180,90,0)');
    ctx.fillStyle = grd;
    ctx.fillRect(x - 52, ty - 36, 104, 104);
    ctx.fillStyle = '#3a2c1c';
    ctx.fillRect(x - 2, ty, 4, 10);
    ctx.fillStyle = '#ffb347';
    ctx.fillRect(x - 2, ty - 6, 4, 7);
    ctx.fillStyle = '#ffe08a';
    ctx.fillRect(x - 1, ty - 4, 2, 4);
  }

  tex.refresh();
}
