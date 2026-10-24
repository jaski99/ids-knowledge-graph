// Minimappa del grafo. La matematica non dipende da Cytoscape: il viewport arriva già in coordinate modello.

export function minimapTransform(bounds, width, height, pad = 8) {
  const x1 = Number.isFinite(bounds?.x1) ? bounds.x1 : 0;
  const y1 = Number.isFinite(bounds?.y1) ? bounds.y1 : 0;
  const x2 = Number.isFinite(bounds?.x2) ? bounds.x2 : x1 + 1;
  const y2 = Number.isFinite(bounds?.y2) ? bounds.y2 : y1 + 1;
  const bw = Math.max(x2 - x1, 1);
  const bh = Math.max(y2 - y1, 1);
  const scale = Math.min(Math.max(width - pad * 2, 1) / bw, Math.max(height - pad * 2, 1) / bh);
  const ox = (width - bw * scale) / 2 - x1 * scale;
  const oy = (height - bh * scale) / 2 - y1 * scale;
  return {
    scale,
    toCanvas(x, y) { return { x: x * scale + ox, y: y * scale + oy }; },
    toModel(x, y) { return { x: (x - ox) / scale, y: (y - oy) / scale }; },
  };
}

/** Pan di Cytoscape che centra `model` nel viewport. */
export function panToCenter(model, zoom, viewW, viewH) {
  return { x: viewW / 2 - model.x * zoom, y: viewH / 2 - model.y * zoom };
}

export function createMinimap(canvas, cy, { pad = 6 } = {}) {
  if (!canvas || !cy || typeof canvas.getContext !== 'function') return { redraw() {}, destroy() {} };
  const ctx = canvas.getContext('2d');
  const draw = () => {
    const dpr = canvas.ownerDocument?.defaultView?.devicePixelRatio || 1;
    const cssW = canvas.clientWidth || 168;
    const cssH = canvas.clientHeight || 112;
    const w = Math.max(1, Math.round(cssW * dpr));
    const h = Math.max(1, Math.round(cssH * dpr));
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
    const theme = canvas.ownerDocument.documentElement.dataset.theme;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = theme === 'dark' ? '#1c1f27' : '#fffcf7';
    ctx.fillRect(0, 0, w, h);
    const bb = cy.elements().boundingBox();
    if (!bb || !Number.isFinite(bb.x1) || !Number.isFinite(bb.x2) || bb.x2 <= bb.x1) return;
    const map = minimapTransform(bb, w, h, pad * dpr);
    cy.nodes().forEach((n) => {
      const p = map.toCanvas(n.position().x, n.position().y);
      ctx.fillStyle = n.data('color') || '#1e40af';
      ctx.globalAlpha = n.hasClass('faded') || n.hasClass('dim') ? 0.35 : 1;
      ctx.beginPath();
      ctx.arc(p.x, p.y, Math.max(2.2 * dpr, 2), 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
    const ext = cy.extent();
    const a = map.toCanvas(ext.x1, ext.y1);
    const b = map.toCanvas(ext.x2, ext.y2);
    ctx.strokeStyle = theme === 'dark' ? '#fbbf24' : '#1e3a8a';
    ctx.lineWidth = Math.max(1, 1.5 * dpr);
    ctx.strokeRect(a.x, a.y, Math.max(b.x - a.x, 1), Math.max(b.y - a.y, 1));
  };
  const onPointer = (ev) => {
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const bb = cy.elements().boundingBox();
    const map = minimapTransform(bb, canvas.width, canvas.height, pad * (canvas.width / rect.width));
    const model = map.toModel((ev.clientX - rect.left) * (canvas.width / rect.width), (ev.clientY - rect.top) * (canvas.height / rect.height));
    cy.pan(panToCenter(model, cy.zoom(), cy.width(), cy.height()));
  };
  cy.on('render pan zoom resize', draw);
  canvas.addEventListener('pointerdown', onPointer);
  draw();
  return {
    redraw: draw,
    destroy() {
      cy.off('render pan zoom resize', draw);
      canvas.removeEventListener('pointerdown', onPointer);
    },
  };
}
