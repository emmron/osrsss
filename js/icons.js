// ===== Procedural pixel-art icons with dark outlines (item / skill / prayer) =====
const Icons = (() => {
  const cache = {};

  function hex2rgb(h) {
    h = h.replace('#', '');
    return [parseInt(h.substr(0, 2), 16), parseInt(h.substr(2, 2), 16), parseInt(h.substr(4, 2), 16)];
  }
  function shade(h, f) {
    const [r, g, b] = hex2rgb(h);
    const c = v => Math.max(0, Math.min(255, Math.round(f >= 1 ? v + (255 - v) * (f - 1) : v * f)));
    return '#' + [c(r), c(g), c(b)].map(v => v.toString(16).padStart(2, '0')).join('');
  }

  // Make alpha crisp and add a 1px dark outline, like classic item sprites
  function finish(cv) {
    const ctx = cv.getContext('2d');
    const w = cv.width, h = cv.height;
    const img = ctx.getImageData(0, 0, w, h);
    const d = img.data;
    const solid = new Uint8Array(w * h);
    for (let i = 0; i < w * h; i++) {
      if (d[i * 4 + 3] > 110) { solid[i] = 1; d[i * 4 + 3] = 255; } else { d[i * 4 + 3] = 0; }
    }
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const i = y * w + x;
      if (solid[i]) continue;
      let n = false;
      if (x > 0 && solid[i - 1]) n = true; else if (x < w - 1 && solid[i + 1]) n = true;
      else if (y > 0 && solid[i - w]) n = true; else if (y < h - 1 && solid[i + w]) n = true;
      if (n) { d[i * 4] = 10; d[i * 4 + 1] = 8; d[i * 4 + 2] = 6; d[i * 4 + 3] = 255; }
    }
    ctx.putImageData(img, 0, 0);
    return cv;
  }

  function mk(size) {
    const cv = document.createElement('canvas');
    cv.width = cv.height = size || 32;
    const ctx = cv.getContext('2d');
    return [cv, ctx];
  }
  function ell(ctx, x, y, rx, ry, col, rot) {
    ctx.fillStyle = col; ctx.beginPath(); ctx.ellipse(x, y, rx, ry, rot || 0, 0, Math.PI * 2); ctx.fill();
  }
  function poly(ctx, pts, col) {
    ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(pts[0], pts[1]);
    for (let i = 2; i < pts.length; i += 2) ctx.lineTo(pts[i], pts[i + 1]);
    ctx.closePath(); ctx.fill();
  }
  function rect(ctx, x, y, w, h, col) { ctx.fillStyle = col; ctx.fillRect(x, y, w, h); }
  function diag(ctx, fn) { ctx.save(); ctx.translate(16, 16); ctx.rotate(-Math.PI / 4); fn(); ctx.restore(); }

  const WOOD = '#6b4523';

  const drawers = {
    coins(ctx, ic, qty) {
      const n = qty >= 1000 ? 6 : qty >= 100 ? 5 : qty >= 25 ? 4 : qty >= 5 ? 3 : qty >= 2 ? 2 : 1;
      const spots = [[16, 24], [11, 20], [20, 19], [14, 15], [19, 12], [13, 9]];
      for (let i = 0; i < n; i++) {
        const [x, y] = spots[i];
        ell(ctx, x, y + 1.5, 6, 3.4, '#8a6a10');
        ell(ctx, x, y, 6, 3.4, '#f0cc30');
        ell(ctx, x - 1, y - 0.6, 3.5, 1.6, '#fff080');
      }
    },
    axe(ctx, ic) {
      diag(ctx, () => {
        rect(ctx, -1.5, -9, 3, 22, WOOD); rect(ctx, -1.5, -9, 1, 22, shade(WOOD, 1.3));
        poly(ctx, [1, -11, 9, -14, 10, -3, 1, -5], ic.c);
        poly(ctx, [1, -10, 8, -13, 8, -10, 1, -8], shade(ic.c, 1.4));
      });
    },
    pickaxe(ctx, ic) {
      diag(ctx, () => {
        rect(ctx, -1.5, -8, 3, 21, WOOD);
        ctx.strokeStyle = ic.c; ctx.lineWidth = 3.5; ctx.beginPath(); ctx.arc(0, 4, 13, Math.PI * 1.22, Math.PI * 1.78); ctx.stroke();
        ctx.strokeStyle = shade(ic.c, 1.4); ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(0, 4, 14, Math.PI * 1.3, Math.PI * 1.7); ctx.stroke();
      });
    },
    net(ctx, ic) {
      if (ic && ic.big) { ctx.save(); ctx.translate(-2, -2); ctx.scale(1.12, 1.12); }
      ctx.strokeStyle = '#c8b48a'; ctx.lineWidth = 1.2;
      for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.moveTo(6 + i * 4, 6); ctx.lineTo(4 + i * 4.5, 27); ctx.stroke(); }
      for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.moveTo(5, 7 + i * 4); ctx.lineTo(28, 6 + i * 4); ctx.stroke(); }
      ctx.strokeStyle = '#6b4523'; ctx.lineWidth = 2; ctx.strokeRect(5, 6, 22, 21);
      if (ic && ic.big) ctx.restore();
    },
    tinderbox(ctx) {
      rect(ctx, 7, 12, 18, 11, '#7a7a80'); rect(ctx, 7, 12, 18, 3, '#a8a8b0');
      rect(ctx, 9, 15, 3, 6, '#5a5a60'); rect(ctx, 18, 9, 5, 4, '#c03020');
    },
    hammer(ctx) {
      diag(ctx, () => {
        rect(ctx, -1.5, -6, 3, 20, WOOD);
        rect(ctx, -6, -12, 12, 7, '#707078'); rect(ctx, -6, -12, 12, 2, '#a0a0a8');
      });
    },
    knife(ctx) {
      diag(ctx, () => {
        rect(ctx, -2, 3, 4, 10, '#3a2a1a');
        poly(ctx, [-2.5, 3, 2.5, 3, 1, -13, -2.5, -9], '#b0b0b8');
        poly(ctx, [-2.5, 3, -0.5, 3, -0.5, -10, -2.5, -9], '#e0e0e8');
      });
    },
    logs(ctx, ic) {
      const c = ic.c;
      for (const [ox, oy] of [[0, 6], [5, -2], [-4, -1]]) {
        ctx.save(); ctx.translate(16 + ox, 16 + oy); ctx.rotate(-0.5);
        rect(ctx, -11, -3.5, 20, 7, c); rect(ctx, -11, -3.5, 20, 2, shade(c, 1.3)); rect(ctx, -11, 2, 20, 1.5, shade(c, 0.7));
        ell(ctx, 9, 0, 2.6, 3.5, '#c8a070'); ell(ctx, 9, 0, 1.2, 1.6, shade('#c8a070', 0.75));
        ctx.restore();
      }
    },
    ashes(ctx) { ell(ctx, 16, 22, 11, 5, '#5a5a5a'); ell(ctx, 15, 19, 7, 4, '#7a7a7a'); ell(ctx, 13, 18, 3, 1.5, '#9a9a9a'); },
    shafts(ctx) {
      for (let i = 0; i < 5; i++) {
        ctx.save(); ctx.translate(12 + i * 2.2, 16 + i * 0.6); ctx.rotate(-0.75);
        rect(ctx, -12, -0.8, 24, 1.8, '#a07a48'); ctx.restore();
      }
    },
    ore(ctx, ic) {
      poly(ctx, [6, 20, 9, 9, 18, 6, 26, 11, 27, 21, 19, 26, 9, 25], '#55524d');
      poly(ctx, [9, 9, 18, 6, 22, 9, 12, 13], '#757069');
      for (const [x, y, r] of [[13, 17, 3], [20, 14, 2.5], [18, 21, 2.2], [11, 22, 1.6], [23, 19, 1.5]]) {
        ell(ctx, x, y, r, r * 0.8, ic.c); ell(ctx, x - 0.7, y - 0.7, r * 0.4, r * 0.3, shade(ic.c, 1.5));
      }
    },
    bar(ctx, ic) {
      poly(ctx, [4, 20, 10, 13, 28, 13, 22, 20], shade(ic.c, 1.35));
      poly(ctx, [4, 20, 22, 20, 22, 25, 4, 25], ic.c);
      poly(ctx, [22, 20, 28, 13, 28, 18, 22, 25], shade(ic.c, 0.7));
    },
    shrimp(ctx, ic) {
      ctx.strokeStyle = ic.c; ctx.lineWidth = 6; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.arc(16, 15, 8, Math.PI * 0.1, Math.PI * 1.25); ctx.stroke();
      ctx.strokeStyle = shade(ic.c, 1.3); ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(16, 15, 9.5, Math.PI * 0.3, Math.PI * 1.1); ctx.stroke();
      poly(ctx, [23, 19, 28, 24, 22, 24], shade(ic.c, 0.85));
    },
    fish(ctx, ic) {
      ell(ctx, 14, 16, 10, 5, ic.c, -0.3);
      ell(ctx, 13, 14, 7, 2, shade(ic.c, 1.35), -0.3);
      poly(ctx, [22, 12, 29, 6, 28, 17], shade(ic.c, 0.8));
      rect(ctx, 7, 15, 2, 2, '#101010');
    },
    meat(ctx, ic) {
      ell(ctx, 15, 17, 11, 8, ic.c, -0.3);
      ell(ctx, 13, 15, 6, 3.5, shade(ic.c, 1.25), -0.3);
      ell(ctx, 20, 20, 3, 2, '#e8e0d0');
    },
    drumstick(ctx, ic) {
      ell(ctx, 13, 13, 9, 7, ic.c, 0.7);
      ell(ctx, 11, 11, 4, 3, shade(ic.c, 1.25), 0.7);
      diag(ctx, () => { rect(ctx, -1.5, 4, 3, 9, '#ece4d4'); ell(ctx, -2, 13, 2.2, 2.2, '#ece4d4'); ell(ctx, 2, 13, 2.2, 2.2, '#ece4d4'); });
    },
    bones(ctx, ic) {
      const s = ic.big ? 1.25 : 1;
      diag(ctx, () => {
        const col = '#e8e0cc';
        rect(ctx, -2 * s, -10 * s, 4 * s, 20 * s, col);
        for (const y of [-10, 10]) { ell(ctx, -2.5 * s, y * s, 3 * s, 3 * s, col); ell(ctx, 2.5 * s, y * s, 3 * s, 3 * s, col); }
        rect(ctx, -2 * s, -9 * s, 1.2 * s, 18 * s, '#ffffff');
      });
    },
    hide(ctx, ic) {
      poly(ctx, [5, 9, 11, 5, 16, 8, 22, 4, 28, 10, 25, 17, 28, 25, 20, 28, 15, 24, 9, 28, 4, 22, 7, 16], ic.c || '#ddd5c5');
      if (!ic.c) { ell(ctx, 12, 14, 4, 3, '#2a2420'); ell(ctx, 21, 21, 4, 3, '#2a2420'); }
    },
    feather(ctx, ic) {
      diag(ctx, () => {
        ell(ctx, 0, -2, 4.5, 11, ic.c || '#f4f4f4'); ell(ctx, 1, -2, 2, 9, ic.c ? Icons.shade(ic.c, 0.8) : '#d8d8d8');
        rect(ctx, -0.5, -12, 1, 25, '#b0b0b0');
      });
    },
    dagger(ctx, ic) {
      diag(ctx, () => {
        rect(ctx, -1.5, 5, 3, 7, '#4a3020'); rect(ctx, -5, 3, 10, 2.5, shade(ic.c, 0.8));
        poly(ctx, [-2.5, 3, 2.5, 3, 0, -9], ic.c); poly(ctx, [-2.5, 3, 0, 3, 0, -9], shade(ic.c, 1.4));
      });
    },
    sword(ctx, ic) {
      diag(ctx, () => {
        rect(ctx, -1.5, 7, 3, 7, '#4a3020'); rect(ctx, -6, 5, 12, 2.5, shade(ic.c, 0.8));
        poly(ctx, [-2.2, 5, 2.2, 5, 2.2, -10, 0, -14, -2.2, -10], ic.c); poly(ctx, [-2.2, 5, 0, 5, 0, -14, -2.2, -10], shade(ic.c, 1.4));
      });
    },
    scimitar(ctx, ic) {
      diag(ctx, () => {
        rect(ctx, -1.5, 7, 3, 7, '#4a3020'); rect(ctx, -5, 5, 10, 2.5, shade(ic.c, 0.8));
        ctx.fillStyle = ic.c; ctx.beginPath(); ctx.moveTo(-2.5, 5); ctx.quadraticCurveTo(-6, -6, 3, -15); ctx.quadraticCurveTo(0, -5, 2.5, 5); ctx.fill();
        ctx.fillStyle = shade(ic.c, 1.4); ctx.beginPath(); ctx.moveTo(-2.5, 5); ctx.quadraticCurveTo(-6, -6, 3, -15); ctx.quadraticCurveTo(-3, -5, -0.5, 5); ctx.fill();
      });
    },
    helm(ctx, ic) {
      ctx.fillStyle = ic.c; ctx.beginPath(); ctx.arc(16, 15, 10, Math.PI, 0); ctx.lineTo(26, 26); ctx.lineTo(6, 26); ctx.closePath(); ctx.fill();
      ell(ctx, 12, 10, 4, 2.5, shade(ic.c, 1.4));
      rect(ctx, 9, 15, 14, 2.5, '#151515'); rect(ctx, 15, 15, 2, 9, '#151515');
    },
    platebody(ctx, ic) {
      poly(ctx, [9, 5, 23, 5, 29, 10, 27, 17, 23, 15, 23, 28, 9, 28, 9, 15, 5, 17, 3, 10], ic.c);
      poly(ctx, [12, 5, 20, 5, 16, 10], '#151515');
      rect(ctx, 11, 11, 4, 14, shade(ic.c, 1.35)); rect(ctx, 9, 20, 14, 1.5, shade(ic.c, 0.7));
    },
    platelegs(ctx, ic) {
      poly(ctx, [8, 4, 24, 4, 26, 28, 18, 28, 16, 12, 14, 28, 6, 28], ic.c);
      rect(ctx, 8, 4, 16, 3, shade(ic.c, 0.7)); rect(ctx, 9, 8, 3, 18, shade(ic.c, 1.35));
    },
    kiteshield(ctx, ic) {
      poly(ctx, [6, 5, 26, 5, 26, 14, 16, 29, 6, 14], ic.c);
      poly(ctx, [6, 5, 16, 5, 16, 29, 6, 14], shade(ic.c, 1.25));
      rect(ctx, 15, 5, 2, 23, shade(ic.c, 0.7)); rect(ctx, 6, 11, 20, 2, shade(ic.c, 0.7));
    },
    amulet(ctx, ic) {
      ctx.strokeStyle = '#e8c030'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.ellipse(16, 12, 9, 9, 0, Math.PI * 0.85, Math.PI * 2.15); ctx.stroke();
      ell(ctx, 16, 23, 5, 5, '#e8c030'); ell(ctx, 16, 23, 3.4, 3.4, ic.c); ell(ctx, 15, 22, 1.2, 1.2, '#ffd0a0');
    },
    woodshield(ctx) {
      ell(ctx, 16, 16, 12, 12, '#8a5a2a'); for (let i = -8; i <= 8; i += 4) rect(ctx, 16 + i, 5, 1, 22, '#6a4018');
      ell(ctx, 16, 16, 3, 3, '#808088');
    },
    leatherbody(ctx) {
      poly(ctx, [9, 5, 23, 5, 29, 10, 27, 17, 23, 15, 23, 28, 9, 28, 9, 15, 5, 17, 3, 10], '#8a5a30');
      poly(ctx, [12, 5, 20, 5, 16, 10], '#151515'); rect(ctx, 15, 11, 2, 16, '#6a4020');
    },
    planks(ctx) {
      for (let i = 0; i < 3; i++) { rect(ctx, 4, 8 + i * 6, 24, 5, i % 2 ? '#a07040' : '#b08050'); rect(ctx, 4, 8 + i * 6, 24, 1, '#c8a070'); }
    },
    ring(ctx, ic) { ctx.strokeStyle = '#000'; ctx.lineWidth = 5; ctx.beginPath(); ctx.ellipse(16, 18, 8, 6, 0, 0, 7); ctx.stroke(); ctx.strokeStyle = ic.c; ctx.lineWidth = 3; ctx.stroke(); },
    skull(ctx) { ell(ctx, 16, 14, 9, 8, '#e0dcc8'); rect(ctx, 11, 18, 10, 6, '#e0dcc8'); ell(ctx, 12, 14, 2.5, 3, '#202020'); ell(ctx, 20, 14, 2.5, 3, '#202020'); for (let i = 0; i < 4; i++) rect(ctx, 12 + i * 2.5, 21, 1, 3, '#404040'); },
    talisman(ctx, ic) { poly(ctx, [16, 5, 26, 16, 16, 27, 6, 16], '#7a7a7a'); poly(ctx, [16, 8, 23, 16, 16, 24, 9, 16], ic.c); ctx.strokeStyle = '#404040'; ctx.beginPath(); ctx.arc(16, 16, 3, 0, 5); ctx.stroke(); },
    snare(ctx) { rect(ctx, 9, 8, 2, 18, '#6b4a2a'); rect(ctx, 21, 8, 2, 18, '#6b4a2a'); rect(ctx, 9, 8, 14, 2, '#6b4a2a'); ctx.strokeStyle = '#e8d8b0'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.ellipse(16, 22, 6, 3, 0, 0, 7); ctx.stroke(); },
    boxtrap(ctx) { poly(ctx, [5, 12, 22, 12, 27, 8, 10, 8], '#a07a48'); rect(ctx, 5, 12, 17, 13, '#8a6238'); poly(ctx, [22, 12, 27, 8, 27, 21, 22, 25], '#6b4a2a'); for (let i = 0; i < 3; i++) rect(ctx, 7 + i * 5, 14, 1, 10, '#5a3a1a'); },
    ferret(ctx, ic) { ell(ctx, 16, 19, 10, 5, ic.c); ell(ctx, 7, 16, 4, 3.5, ic.c); ell(ctx, 5, 15, 1, 1, '#101010'); poly(ctx, [25, 18, 30, 12, 28, 20], ic.c); rect(ctx, 9, 22, 2, 4, Icons.shade(ic.c, 0.7)); rect(ctx, 20, 22, 2, 4, Icons.shade(ic.c, 0.7)); },
    rod(ctx, ic) { diag(ctx, () => { rect(ctx, -0.8, -14, 1.6, 28, ic.fly ? '#a07040' : '#6b4523'); rect(ctx, -2, 8, 4, 4, '#404040'); }); ctx.strokeStyle = '#e0e0e0'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(26, 5); ctx.quadraticCurveTo(30, 18, 24, 26); ctx.stroke(); },
    bait(ctx) { for (const [x, y] of [[12, 14], [18, 18], [14, 21], [20, 12]]) { ctx.strokeStyle = '#c07060'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(x, y, 3, 0, 4); ctx.stroke(); } },
    harpoon(ctx) { diag(ctx, () => { rect(ctx, -1, -6, 2, 20, '#6b4523'); poly(ctx, [-3, -6, 3, -6, 0, -15], '#a0a0a8'); poly(ctx, [-3, -6, -6, -2, -2, -6], '#a0a0a8'); poly(ctx, [3, -6, 6, -2, 2, -6], '#a0a0a8'); }); },
    pot(ctx) { ctx.strokeStyle = '#6b4523'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(16, 18, 10, Math.PI, 0); ctx.lineTo(26, 26); ctx.lineTo(6, 26); ctx.closePath(); ctx.stroke(); for (let i = 9; i < 25; i += 4) { ctx.beginPath(); ctx.moveTo(i, 10); ctx.lineTo(i, 26); ctx.stroke(); } },
    lobster(ctx, ic) { ell(ctx, 16, 18, 5, 9, ic.c); for (const s of [-1, 1]) { ell(ctx, 16 + s * 8, 8, 3.5, 5, ic.c); rect(ctx, 16 + s * 5 - 1, 10, 2, 5, ic.c); } ell(ctx, 15, 16, 2, 5, Icons.shade(ic.c, 1.3)); poly(ctx, [12, 26, 20, 26, 16, 30], ic.c); },
    swordfish(ctx, ic) { diag(ctx, () => { ell(ctx, 0, 2, 5, 11, ic.c); poly(ctx, [-1, -9, 1, -9, 0, -16], '#d0d0d8'); poly(ctx, [-5, 12, 5, 12, 0, 8], ic.c); ell(ctx, -1, 0, 1.5, 6, Icons.shade(ic.c, 1.3)); }); },
    chisel(ctx) { diag(ctx, () => { rect(ctx, -2, 2, 4, 10, '#6b4523'); poly(ctx, [-1.5, 2, 1.5, 2, 1, -12, -1, -12], '#a0a0a8'); }); },
    gem(ctx, ic) {
      if (ic.uncut) { poly(ctx, [9, 12, 15, 7, 23, 10, 24, 19, 17, 25, 9, 21], Icons.shade(ic.c, 0.8)); poly(ctx, [15, 7, 23, 10, 17, 14], Icons.shade(ic.c, 1.2)); return; }
      poly(ctx, [10, 12, 16, 7, 22, 12, 16, 26], ic.c); poly(ctx, [10, 12, 16, 7, 16, 12], Icons.shade(ic.c, 1.5)); poly(ctx, [16, 12, 22, 12, 16, 26], Icons.shade(ic.c, 0.7));
    },
    tiara(ctx, ic) { ctx.strokeStyle = '#000'; ctx.lineWidth = 4; ctx.beginPath(); ctx.ellipse(16, 18, 10, 5, 0, Math.PI, 0); ctx.stroke(); ctx.strokeStyle = '#c0c0c8'; ctx.lineWidth = 2; ctx.stroke(); poly(ctx, [12, 13, 16, 6, 20, 13], '#c0c0c8'); ell(ctx, 16, 11, 2.5, 2.5, ic.c); },
    pouch(ctx, ic) { ell(ctx, 16, 19, 9, 8, ic.c); poly(ctx, [11, 12, 21, 12, 19, 7, 13, 7], Icons.shade(ic.c, 0.8)); rect(ctx, 11, 11, 10, 2, '#3a2a10'); ell(ctx, 13, 17, 3, 2, Icons.shade(ic.c, 1.3)); },
    egg(ctx) { ell(ctx, 16, 17, 7, 9, '#f0e8d8'); ell(ctx, 14, 14, 2.5, 3, '#ffffff'); },
    bucket(ctx, ic) { poly(ctx, [8, 10, 24, 10, 22, 26, 10, 26], '#8a6238'); if (ic.milk) ell(ctx, 16, 11, 8, 2.5, '#f8f8f8'); else ell(ctx, 16, 11, 8, 2.5, '#3a2a1a'); rect(ctx, 8, 15, 16, 2, '#4a4a4a'); rect(ctx, 9, 22, 14, 2, '#4a4a4a'); ctx.strokeStyle = '#4a4a4a'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(16, 10, 8, Math.PI, 0); ctx.stroke(); },
    flourpot(ctx, ic) { ell(ctx, 16, 19, 9, 8, '#a0603a'); rect(ctx, 10, 9, 12, 4, '#8a5030'); if (ic.flour) ell(ctx, 16, 10, 6, 2, '#f8f8f0'); },
    horn(ctx) { poly(ctx, [10, 26, 16, 4, 22, 26], '#f0ece0'); for (let i = 0; i < 4; i++) rect(ctx, 12 + i * 0.8, 22 - i * 5, 8 - i * 1.6, 1, '#c8c0a8'); },
    dart(ctx, ic) { for (let i = 0; i < 3; i++) { ctx.save(); ctx.translate(12 + i * 4, 20 - i * 3); ctx.rotate(-0.8); rect(ctx, -6, -0.8, 9, 1.6, '#a07a48'); poly(ctx, [3, -2.5, 9, 0, 3, 2.5], ic.c); poly(ctx, [-8, 0, -5, -3, -4, 0], '#f0f0f0'); ctx.restore(); } },
    cape(ctx, ic) { poly(ctx, [10, 5, 22, 5, 27, 27, 5, 27], ic.c); poly(ctx, [10, 5, 22, 5, 20, 9, 12, 9], Icons.shade(ic.c, 0.7)); rect(ctx, 14, 9, 2, 17, Icons.shade(ic.c, 1.25)); },
    lamp(ctx) { ell(ctx, 15, 20, 9, 5, '#e8c030'); poly(ctx, [22, 18, 29, 13, 28, 16, 23, 21], '#e8c030'); ell(ctx, 12, 15, 3, 2, '#e8c030'); ell(ctx, 13, 19, 3, 1.5, '#fff080'); rect(ctx, 8, 24, 14, 2, '#a08020'); },
    tab(ctx, ic) { poly(ctx, [7, 6, 25, 6, 25, 26, 7, 26], '#c8b896'); ctx.strokeStyle = '#6a5a3a'; ctx.strokeRect(7.5, 6.5, 17, 19); ell(ctx, 16, 16, 5, 5, ic.c); ell(ctx, 15, 15, 2, 2, '#ffffff'); },
    gnomefood(ctx, ic) { ell(ctx, 16, 20, 11, 6, '#d8c8a0'); ell(ctx, 16, 17, 9, 5, ic.c); for (const [x, y] of [[12, 16], [18, 15], [20, 18]]) ell(ctx, x, y, 1.5, 1.5, Icons.shade(ic.c, 1.4)); },
    needle(ctx) { diag(ctx, () => { rect(ctx, -0.8, -12, 1.6, 24, '#c8c8d0'); rect(ctx, -0.4, -11, 0.8, 3, '#202020'); }); },
    thread(ctx) { ell(ctx, 16, 16, 9, 9, '#e8e0c8'); for (let i = -6; i <= 6; i += 3) rect(ctx, 8, 16 + i, 16, 1, '#b8b098'); rect(ctx, 6, 5, 20, 3, '#8a5a2a'); rect(ctx, 6, 24, 20, 3, '#8a5a2a'); },
    rake(ctx) { diag(ctx, () => { rect(ctx, -1, -6, 2, 20, WOOD); rect(ctx, -8, -8, 16, 2.5, '#808088'); for (let i = -7; i <= 7; i += 3.5) rect(ctx, i - 0.5, -13, 1.5, 6, '#808088'); }); },
    dibber(ctx) { diag(ctx, () => { rect(ctx, -2, -4, 4, 14, WOOD); poly(ctx, [-2, -4, 2, -4, 0, -14], '#a08060'); rect(ctx, -6, 8, 12, 3, WOOD); }); },
    spade(ctx) { diag(ctx, () => { rect(ctx, -1.2, -2, 2.4, 14, WOOD); rect(ctx, -4, 10, 8, 2, WOOD); poly(ctx, [-5, -2, 5, -2, 4, -12, 0, -14, -4, -12], '#8a8a92'); }); },
    vial(ctx, ic) {
      if (ic.c) { const h = ic.dose ? 4 + ic.dose * 3.5 : 12; rect(ctx, 11, 26 - h, 10, h, ic.c); rect(ctx, 11, 26 - h, 3, h, Icons.shade(ic.c, 1.4)); }
      ctx.strokeStyle = 'rgba(220,230,240,0.9)'; ctx.lineWidth = 1.5; ctx.strokeRect(10.5, 8.5, 11, 18);
      rect(ctx, 12, 4, 8, 4, ic.c ? '#8a6a40' : 'rgba(220,230,240,0.9)');
    },
    bow(ctx, ic) {
      const L = ic.long ? 13 : 10;
      diag(ctx, () => {
        ctx.strokeStyle = ic.c; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(-6, 0, L, -1.1, 1.1); ctx.stroke();
        ctx.strokeStyle = Icons.shade(ic.c, 1.4); ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(-6, 0, L - 1, -1.0, 1.0); ctx.stroke();
        if (!ic.unstrung) { ctx.strokeStyle = '#e8e8e8'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(-6 + L * Math.cos(1.1), -L * Math.sin(1.1)); ctx.lineTo(-6 + L * Math.cos(1.1), L * Math.sin(1.1)); ctx.stroke(); }
        rect(ctx, L - 7, -2, 2, 4, '#4a3020');
      });
    },
    bowstring(ctx) { ctx.strokeStyle = '#e8e0c8'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(16, 16, 9, 0, Math.PI * 2); ctx.stroke(); ctx.beginPath(); ctx.arc(16, 16, 6, 0.5, 5.5); ctx.stroke(); },
    flax(ctx) { for (let i = 0; i < 4; i++) { rect(ctx, 10 + i * 3, 8, 1.5, 20, '#6a8a2a'); } ell(ctx, 11, 7, 2.5, 2.5, '#6a7ae0'); ell(ctx, 17, 6, 2.5, 2.5, '#6a7ae0'); ell(ctx, 20, 9, 2, 2, '#6a7ae0'); },
    essence(ctx, ic) { poly(ctx, [9, 8, 22, 6, 26, 16, 21, 26, 9, 25, 6, 16], ic.pure ? '#e8e8f8' : '#c8c8d0'); poly(ctx, [9, 8, 22, 6, 18, 12, 11, 13], ic.pure ? '#ffffff' : '#e8e8f0'); if (ic.pure) { ell(ctx, 16, 17, 3, 3, '#d0e0ff'); } },
    tips(ctx, ic) { for (let i = 0; i < 4; i++) poly(ctx, [6 + i * 6, 22 - i * 3, 10 + i * 6, 22 - i * 3, 8 + i * 6, 12 - i * 3], i % 2 ? ic.c : Icons.shade(ic.c, 1.3)); },
    arrows(ctx, ic) {
      for (let i = 0; i < 3; i++) {
        ctx.save(); ctx.translate(14 + i * 3, 18 - i * 2); ctx.rotate(-0.78);
        rect(ctx, -11, -0.8, 20, 1.8, '#a07a48');
        if (ic.c) poly(ctx, [9, -2.5, 14, 0, 9, 2.5], ic.c);
        poly(ctx, [-12, 0, -8, -3, -6, 0], '#f0f0f0'); poly(ctx, [-12, 0, -8, 3, -6, 0], '#d8d8d8');
        ctx.restore();
      }
    },
    cake(ctx) { poly(ctx, [5, 16, 27, 16, 27, 25, 5, 25], '#e8c070'); poly(ctx, [5, 16, 16, 10, 27, 16], '#f8f0e0'); rect(ctx, 5, 19, 22, 2, '#c04040'); },
    banana(ctx) { ctx.strokeStyle = '#f0d040'; ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.beginPath(); ctx.arc(16, 6, 16, 0.6, 2.4); ctx.stroke(); ctx.strokeStyle = '#fff090'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(16, 6, 14.5, 0.8, 2.2); ctx.stroke(); },
    veg(ctx, ic) {
      if (ic.cabbage) { ell(ctx, 16, 17, 10, 9, ic.c); ell(ctx, 13, 14, 5, 4, Icons.shade(ic.c, 1.3)); ctx.strokeStyle = Icons.shade(ic.c, 0.7); ctx.beginPath(); ctx.moveTo(16, 9); ctx.lineTo(16, 25); ctx.stroke(); return; }
      ell(ctx, 16, 18, 9, 7, ic.c); ell(ctx, 13, 16, 4, 2.5, Icons.shade(ic.c, 1.25));
      if (ic.onion) poly(ctx, [15, 11, 17, 11, 16, 4], '#6a9a3a'); else { rect(ctx, 12, 18, 1, 1, '#5a3a1a'); rect(ctx, 19, 16, 1, 1, '#5a3a1a'); }
    },
    leather(ctx) { poly(ctx, [6, 8, 25, 6, 27, 24, 7, 26], '#8a5a30'); poly(ctx, [6, 8, 25, 6, 22, 10, 9, 11], '#a87040'); },
    silk(ctx) { poly(ctx, [5, 10, 27, 7, 25, 25, 7, 23], '#e8e8f8'); poly(ctx, [5, 10, 27, 7, 24, 12, 8, 14], '#ffffff'); ctx.strokeStyle = '#c0c0d8'; ctx.beginPath(); ctx.moveTo(8, 18); ctx.lineTo(24, 16); ctx.stroke(); },
    rune(ctx, ic) {
      ell(ctx, 16, 16, 11, 11, '#8a8a8a'); ell(ctx, 15, 15, 10, 10, '#b0b0b0'); ell(ctx, 13, 12, 4, 3, '#d0d0d0');
      ctx.strokeStyle = ic.c; ctx.fillStyle = ic.c; ctx.lineWidth = 2.2;
      const g = { air: () => { ctx.beginPath(); ctx.arc(16, 16, 5, 0, 5); ctx.stroke(); }, mind: () => { ctx.beginPath(); ctx.arc(16, 16, 5, 0, 7); ctx.stroke(); rect(ctx, 15, 11, 2, 10, ic.c); },
        water: () => { ctx.beginPath(); ctx.moveTo(10, 14); ctx.quadraticCurveTo(13, 10, 16, 14); ctx.quadraticCurveTo(19, 18, 22, 14); ctx.stroke(); ctx.beginPath(); ctx.moveTo(10, 19); ctx.quadraticCurveTo(13, 15, 16, 19); ctx.quadraticCurveTo(19, 23, 22, 19); ctx.stroke(); },
        earth: () => { rect(ctx, 11, 11, 10, 10, ic.c); }, fire: () => { poly(ctx, [16, 9, 21, 20, 16, 23, 11, 20], ic.c); },
        body: () => { ell(ctx, 16, 13, 3, 3, ic.c); rect(ctx, 14, 16, 4, 7, ic.c); }, chaos: () => { ctx.beginPath(); ctx.moveTo(11, 11); ctx.lineTo(21, 21); ctx.moveTo(21, 11); ctx.lineTo(11, 21); ctx.stroke(); },
        nature: () => { ctx.beginPath(); ctx.moveTo(16, 22); ctx.lineTo(16, 12); ctx.stroke(); ell(ctx, 13, 12, 3, 2, ic.c); ell(ctx, 19, 12, 3, 2, ic.c); }, law: () => { ctx.beginPath(); ctx.moveTo(16, 10); ctx.lineTo(16, 22); ctx.moveTo(11, 14); ctx.lineTo(21, 14); ctx.stroke(); } };
      (g[ic.r] || g.air)();
    },
    staff(ctx, ic) { diag(ctx, () => { rect(ctx, -1.5, -11, 3, 25, ic.c); rect(ctx, -1.5, -11, 1, 25, Icons.shade(ic.c, 1.4)); if (ic.orb) { ell(ctx, 0, -12, 3.5, 3.5, ic.orb); ell(ctx, -1, -13, 1.2, 1.2, '#ffffff'); } else rect(ctx, -2.5, -12, 5, 3, '#5a3a20'); }); },
    wizhat(ctx, ic) { poly(ctx, [16, 3, 25, 24, 7, 24], ic.c); ell(ctx, 16, 24, 12, 3.5, ic.c); poly(ctx, [16, 3, 19, 24, 16, 24], Icons.shade(ic.c, 1.3)); ell(ctx, 14, 14, 1.2, 1.2, '#ffe040'); ell(ctx, 18, 19, 1.2, 1.2, '#ffe040'); },
    robe(ctx, ic) { poly(ctx, [9, 5, 23, 5, 29, 12, 26, 18, 23, 15, 25, 28, 7, 28, 9, 15, 6, 18, 3, 12], ic.c); poly(ctx, [12, 5, 20, 5, 16, 11], '#151515'); rect(ctx, 15, 11, 2, 16, '#e8c030'); },
    herb(ctx, ic) { for (let i = 0; i < 4; i++) { ctx.save(); ctx.translate(16, 20); ctx.rotate(-0.9 + i * 0.6); ell(ctx, 0, -8, 3.5, 8, ic.c); ell(ctx, -1, -9, 1.2, 5, Icons.shade(ic.c, 1.3)); ctx.restore(); } rect(ctx, 15, 19, 2, 9, '#5a6a2a'); },
    eye(ctx) { ell(ctx, 16, 16, 9, 7, '#e8e8d8'); ell(ctx, 16, 16, 4.5, 4.5, '#4a8a3a'); ell(ctx, 16, 16, 2, 2, '#101010'); ell(ctx, 14, 14, 1, 1, '#ffffff'); },
    root(ctx) { ctx.strokeStyle = '#a0784a'; ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(8, 8); ctx.quadraticCurveTo(20, 12, 24, 26); ctx.stroke(); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(16, 12); ctx.lineTo(10, 22); ctx.stroke(); },
    berries(ctx) { for (const [x, y] of [[12, 14], [18, 12], [15, 19], [21, 18], [10, 21]]) { ell(ctx, x, y, 3.5, 3.5, '#f0f0e8'); ell(ctx, x - 1, y - 1, 1, 1, '#ffffff'); } rect(ctx, 15, 5, 1.5, 8, '#5a6a2a'); },
    seed(ctx, ic) { poly(ctx, [8, 7, 24, 7, 25, 26, 7, 26], '#d8c8a0'); rect(ctx, 8, 7, 16, 4, '#b8a880'); ell(ctx, 16, 18, 4, 3, ic.c); ell(ctx, 12, 22, 2, 1.5, '#8a6a3a'); ell(ctx, 20, 22, 2, 1.5, '#8a6a3a'); },
    weeds(ctx) { for (let i = 0; i < 6; i++) poly(ctx, [8 + i * 3, 27, 10 + i * 3, 27, 6 + i * 4, 6 + (i % 3) * 4], i % 2 ? '#6a7a2a' : '#5a6a20'); },
    gloves(ctx) { poly(ctx, [8, 12, 14, 8, 15, 22, 9, 26], '#8a5a30'); poly(ctx, [18, 8, 24, 12, 23, 26, 17, 22], '#8a5a30'); rect(ctx, 8, 20, 7, 3, '#6a4020'); rect(ctx, 17, 20, 7, 3, '#6a4020'); },
    boots(ctx) { poly(ctx, [6, 8, 12, 8, 12, 20, 17, 22, 17, 26, 6, 26], '#7a4a24'); poly(ctx, [16, 6, 22, 6, 22, 18, 27, 20, 27, 24, 16, 24], '#8a5a30'); },
    cowl(ctx) { ctx.fillStyle = '#8a5a30'; ctx.beginPath(); ctx.arc(16, 16, 11, Math.PI, 0); ctx.lineTo(27, 27); ctx.lineTo(5, 27); ctx.fill(); ell(ctx, 16, 19, 6, 6, '#3a2010'); },
    vambs(ctx) { rect(ctx, 6, 8, 8, 18, '#8a5a30'); rect(ctx, 18, 8, 8, 18, '#8a5a30'); for (let i = 0; i < 3; i++) { rect(ctx, 6, 11 + i * 5, 8, 1, '#5a3a18'); rect(ctx, 18, 11 + i * 5, 8, 1, '#5a3a18'); } },
    chaps(ctx) { poly(ctx, [8, 4, 24, 4, 26, 28, 18, 28, 16, 12, 14, 28, 6, 28], '#8a5a30'); rect(ctx, 8, 4, 16, 3, '#5a3a18'); },
  };

  function item(id, qty) {
    const def = ITEMS[id];
    if (!def) return null;
    let key = id;
    if (def.icon.t === 'coins') {
      const tier = qty >= 1000 ? 6 : qty >= 100 ? 5 : qty >= 25 ? 4 : qty >= 5 ? 3 : qty >= 2 ? 2 : 1;
      key = id + '_' + tier;
    }
    if (cache[key]) return cache[key];
    const [cv, ctx] = mk(32);
    drawers[def.icon.t](ctx, def.icon, qty || 1);
    cache[key] = finish(cv);
    return cache[key];
  }

  // ---- Skill icons (20x20) ----
  const skillDraw = {
    attack(ctx) { ctx.scale(0.62, 0.62); drawers.sword(ctx, { c: '#b0b0b8' }); },
    strength(ctx) {
      ell(ctx, 10, 11, 6, 5, '#d8a060'); rect(ctx, 4, 13, 12, 5, '#c08850'); rect(ctx, 6, 7, 2, 4, '#e8b878'); rect(ctx, 9, 6, 2, 4, '#e8b878'); rect(ctx, 12, 7, 2, 4, '#e8b878');
    },
    defence(ctx) { ctx.scale(0.62, 0.62); drawers.kiteshield(ctx, { c: '#5a78b8' }); },
    hitpoints(ctx) {
      ctx.fillStyle = '#d02020'; ctx.beginPath(); ctx.moveTo(10, 18); ctx.bezierCurveTo(-4, 8, 4, -2, 10, 5); ctx.bezierCurveTo(16, -2, 24, 8, 10, 18); ctx.fill();
      ell(ctx, 7, 7, 2, 1.5, '#ff8080');
    },
    prayer(ctx) {
      ctx.fillStyle = '#f0f0e0'; ctx.beginPath();
      for (let i = 0; i < 10; i++) { const r = i % 2 ? 3.5 : 9, a = i * Math.PI / 5 - Math.PI / 2; ctx.lineTo(10 + Math.cos(a) * r, 10 + Math.sin(a) * r); }
      ctx.fill();
    },
    woodcutting(ctx) {
      ell(ctx, 12, 7, 6, 5, '#3a8a2a'); rect(ctx, 11, 10, 3, 9, '#6b4523');
      ctx.save(); ctx.scale(0.5, 0.5); drawers.axe(ctx, { c: '#a0a0a8' }); ctx.restore();
    },
    firemaking(ctx) {
      poly(ctx, [10, 1, 16, 10, 15, 17, 5, 17, 4, 10], '#f08020'); poly(ctx, [10, 7, 13, 12, 12, 17, 8, 17, 7, 12], '#ffe040');
    },
    fishing(ctx) { ctx.scale(0.62, 0.62); drawers.fish(ctx, { c: '#7aa0c8' }); },
    cooking(ctx) {
      ell(ctx, 6, 8, 4, 4, '#f4f4f4'); ell(ctx, 10, 6, 4.5, 4.5, '#f4f4f4'); ell(ctx, 14, 8, 4, 4, '#f4f4f4'); rect(ctx, 5, 9, 10, 8, '#ececec'); rect(ctx, 5, 15, 10, 2, '#c0c0c0');
    },
    mining(ctx) { ctx.scale(0.62, 0.62); drawers.pickaxe(ctx, { c: '#a0a0a8' }); },
    smithing(ctx) {
      poly(ctx, [2, 13, 18, 13, 15, 16, 14, 19, 6, 19, 5, 16], '#505058'); rect(ctx, 2, 12, 16, 2, '#78787f');
      ctx.save(); ctx.scale(0.45, 0.45); ctx.translate(8, -4); drawers.hammer(ctx); ctx.restore();
    },
    thieving(ctx) {
      ell(ctx, 10, 10, 8, 8, '#e0c0a0'); rect(ctx, 2, 6, 16, 5, '#202020'); rect(ctx, 5, 8, 3, 2, '#e0e0e0'); rect(ctx, 12, 8, 3, 2, '#e0e0e0');
    },
    agility(ctx) {
      ell(ctx, 12, 4, 2.5, 2.5, '#e0c0a0'); poly(ctx, [10, 7, 14, 7, 15, 12, 11, 12], '#3a6ad0');
      poly(ctx, [11, 12, 14, 12, 18, 18, 16, 19, 12, 15, 8, 19, 6, 18], '#3a3a8a'); poly(ctx, [10, 8, 5, 11, 6, 12, 11, 10], '#e0c0a0'); poly(ctx, [14, 8, 18, 6, 18, 7, 14, 10], '#e0c0a0');
    },
    herblore(ctx) { drawers.herb(ctx, { c: '#4a9a2a' }); },
    ranged(ctx) { ctx.translate(-6, -6); ctx.scale(0.85, 0.85); drawers.arrows(ctx, { c: '#a0a0a8' }); },
    crafting(ctx) { ctx.scale(0.62, 0.62); drawers.needle(ctx); drawers.thread(ctx); },
    magic(ctx) { ctx.scale(0.62, 0.62); drawers.wizhat(ctx, { c: '#3a5ac8' }); },
    runecrafting(ctx) { ctx.scale(0.62, 0.62); drawers.rune(ctx, { c: '#e03018', r: 'fire' }); },
    slayer(ctx) {
      ell(ctx, 10, 9, 7, 7, '#e8e4d8'); rect(ctx, 6, 13, 8, 5, '#e8e4d8'); ell(ctx, 7, 9, 2, 2.2, '#101010'); ell(ctx, 13, 9, 2, 2.2, '#101010');
      for (let i = 0; i < 4; i++) rect(ctx, 6.5 + i * 2, 15, 1, 3, '#101010');
    },
    hunter(ctx) { ctx.scale(0.62, 0.62); drawers.snare(ctx); ell(ctx, 16, 6, 4, 3, '#a07040'); },
    farming(ctx) { poly(ctx, [2, 18, 18, 18, 16, 14, 4, 14], '#6a4a2a'); rect(ctx, 9, 4, 2, 11, '#4a8a2a'); ell(ctx, 7, 7, 3, 2, '#5aa030'); ell(ctx, 13, 6, 3, 2, '#5aa030'); },
    fletching(ctx) {
      ctx.strokeStyle = '#8a5a2a'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(4, 10, 11, -1.1, 1.1); ctx.stroke();
      ctx.strokeStyle = '#e0e0e0'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(9, 1); ctx.lineTo(9, 19); ctx.stroke();
      rect(ctx, 3, 9.5, 14, 1.2, '#b08050'); poly(ctx, [17, 8, 20, 10, 17, 12], '#a0a0a8');
    },
  };
  function skill(id) {
    const key = 'skill_' + id;
    if (cache[key]) return cache[key];
    const [cv, ctx] = mk(20);
    ctx.save(); skillDraw[id](ctx); ctx.restore();
    cache[key] = finish(cv);
    return cache[key];
  }

  // ---- Prayer icons (24x24) ----
  function prayer(p, active, unlocked) {
    const key = 'pr_' + p.id + (unlocked ? 1 : 0);
    if (cache[key]) return cache[key];
    const [cv, ctx] = mk(24);
    const base = unlocked ? 1 : 0.45;
    const g = p.glyph;
    const tier = g.endsWith('3') ? 3 : g.endsWith('2') ? 2 : 1;
    const kind = g.replace(/\d/, '');
    const col = kind === 'skin' ? '#7a9ad0' : kind === 'str' ? '#e0a040' : kind === 'att' ? '#d0d0d0' : kind === 'prot' ? '#d8d8e8' : '#e04040';
    const c = shade(col, base);
    if (kind === 'skin') {
      poly(ctx, [4, 4, 20, 4, 20, 12, 12, 21, 4, 12], c);
      for (let i = 0; i < tier; i++) rect(ctx, 7, 7 + i * 4, 10, 2, shade(col, base * 0.6));
    } else if (kind === 'str') {
      ell(ctx, 12, 11, 7, 6, c); rect(ctx, 6, 14, 12, 6, c);
      for (let i = 0; i < tier; i++) rect(ctx, 7 + i * 4, 5, 2, 5, shade(col, base * 1.3));
    } else if (kind === 'att') {
      ctx.save(); ctx.scale(0.75, 0.75); drawers.sword(ctx, { c: shade(col, base) }); ctx.restore();
      for (let i = 1; i < tier; i++) ell(ctx, 18, 4 + i * 5, 2, 2, '#ffff60');
    } else if (kind === 'prot') {
      poly(ctx, [4, 3, 20, 3, 20, 11, 12, 21, 4, 11], c); ctx.save(); ctx.scale(0.5, 0.5); ctx.translate(8, 6); drawers.sword(ctx, { c: '#606070' }); ctx.restore();
    } else {
      ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(12, 21); ctx.bezierCurveTo(-2, 11, 6, 0, 12, 7); ctx.bezierCurveTo(18, 0, 26, 11, 12, 21); ctx.fill();
      rect(ctx, 10, 8, 4, 9, '#ffffff'); rect(ctx, 8, 10, 8, 4, '#ffffff');
    }
    cache[key] = finish(cv);
    return cache[key];
  }

  return { item, skill, prayer, shade, hex2rgb };
})();
