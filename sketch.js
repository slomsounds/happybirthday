// @ts-nocheck
/* global p5, drawingContext */

const CARD_W    = 600;
const CARD_H    = 900;
const PAD       = 30;
const MAX_CAKES = 30;

let cakes          = [];
let nextSpawnFrame = 0;
let sceneBuffer;

function nextInterval() {
  const base  = random(12, 30);
  const burst = noise(frameCount * 0.003) < 0.3 ? random(-6, 0) : 0;
  return max(8, base + burst);
}

function cakeBBox(c) {
  const hw  = (c.rectW * 1.8) / 2;
  const top = c.cy - c.rectH / 2 - c.rectH / 3;
  const bot = c.cy + c.rectH / 2 + c.rectH * 0.8;
  return { x1: c.cx - hw, y1: top, x2: c.cx + hw, y2: bot };
}
function bboxContains(b, a) {
  return a.x1 >= b.x1 && a.y1 >= b.y1 && a.x2 <= b.x2 && a.y2 <= b.y2;
}
function cullOccluded() {
  cakes = cakes.filter((c, i) => {
    const aBox = cakeBBox(c);
    for (let j = i + 1; j < cakes.length; j++) {
      if (bboxContains(cakeBBox(cakes[j]), aBox)) return false;
    }
    return true;
  });
}

function setup() {
  createCanvas(CARD_W, CARD_H);
  rectMode(CENTER);
  noStroke();

  sceneBuffer = createGraphics(CARD_W + PAD * 2, CARD_H + PAD * 2);
  sceneBuffer.rectMode(CENTER);
  sceneBuffer.noStroke();

  nextSpawnFrame = nextInterval();

  document.body.style.cssText = `
    margin: 0;
    padding: 40px 0;
    background: #000;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    box-sizing: border-box;
    overflow: auto;
  `;

  const wm = document.createElement('p');
  wm.innerHTML = 'Jeffrey Minwoo Kim, <em>Happy Birthday</em>, 2026';
  wm.style.cssText = `
    margin: 14px 0 0;
    font-family: Helvetica, Arial, sans-serif;
    font-size: 11px;
    color: rgba(255,255,255,0.35);
    letter-spacing: 0.08em;
    text-align: center;
    pointer-events: none;
    user-select: none;
  `;
  document.body.appendChild(wm);

  const btn = document.createElement('button');
  btn.textContent = 'save card';
  btn.style.cssText = `
    display: block;
    margin: 10px auto 0;
    font-family: Helvetica, Arial, sans-serif;
    font-size: 12px;
    color: #aaa;
    background: transparent;
    border: 1px solid #444;
    padding: 6px 18px;
    border-radius: 20px;
    cursor: pointer;
    letter-spacing: 0.06em;
  `;
  btn.onmouseover = () => { btn.style.color = '#fff'; btn.style.borderColor = '#aaa'; };
  btn.onmouseout  = () => { btn.style.color = '#aaa'; btn.style.borderColor = '#444'; };
  btn.onclick     = () => saveCanvas('birthday_card', 'png');
  document.body.appendChild(btn);
}

function draw() {
  background(50, 50, 50);

  if (frameCount >= nextSpawnFrame) {
    for (const c of cakes) {
      c.col[0]      = max(0, c.col[0]      - 4);
      c.col[1]      = max(0, c.col[1]      - 4);
      c.col[2]      = max(0, c.col[2]      - 4);
      c.plateCol[0] = max(0, c.plateCol[0] - 4);
      c.plateCol[1] = max(0, c.plateCol[1] - 4);
      c.plateCol[2] = max(0, c.plateCol[2] - 4);
      c.flameDark   = min(255, c.flameDark  + 1);
    }
    cakes.push(generateCake());
    if (cakes.length > MAX_CAKES) cakes.shift();
    cullOccluded();
    nextSpawnFrame = frameCount + nextInterval();
  }

  const driftX = sin(frameCount * 0.007) * 1.2;
  const driftY = noise(frameCount * 0.004) * 2 - 1;

  sceneBuffer.clear();
  sceneBuffer.background(50, 50, 50);
  sceneBuffer.push();
  sceneBuffer.translate(PAD + driftX, PAD + driftY);
  for (const c of cakes) {
    drawCakeStatic(sceneBuffer, c);
    drawAllFlames(c, sceneBuffer);
  }
  sceneBuffer.pop();

  drawingContext.filter = 'blur(14px)';
  image(sceneBuffer, -PAD, -PAD);
  drawingContext.filter = 'none';

  const crop = 30;
  noStroke();
  fill(255);
  rectMode(CORNER);
  rect(0,             0,             CARD_W, crop);
  rect(0,             CARD_H - crop, CARD_W, crop);
  rect(0,             0,             crop,   CARD_H);
  rect(CARD_W - crop, 0,             crop,   CARD_H);
  rectMode(CENTER);
  noStroke();
}

function keyPressed() {
  if (key === 's' || key === 'S') saveCanvas('birthday_card', 'png');
}

function generateCake() {
  const t = random(0.85, 1.5);
  const r = random(0.5,  1.5);

  const rectW   = r * 200 * t;
  const rectH   = (r / 1.5) * 200;
  const circH   = rectH / 5;
  const candleW = rectW / 20;
  const col     = [random(150, 255), random(150, 255), random(0, 255)];

  const plateOffset = random(-50, 50);
  const plateCol    = [200 + plateOffset, 200 + plateOffset, 170 + plateOffset];

  const marginX = CARD_W / 10;
  const marginY = CARD_H / 10;
  const cx = random(marginX, CARD_W - marginX);
  const cy = random(marginY, CARD_H - marginY);

  const candleCount     = floor(random(1, 5));
  const candlePositions = [];
  const candleYOffsets  = [];
  const candleHeights   = [];
  const spacing = rectW / (candleCount + 1);
  for (let i = 0; i < candleCount; i++) {
    candlePositions.push(-rectW / 2 + spacing * (i + 1) + random(-rectW * 0.05, rectW * 0.05));
    candleYOffsets.push(random(-10, 10));
    candleHeights.push((rectH / 3) * random(0.85, 1.15));
  }

  const sprPalette = [
    [255, 120, 120], [255, 200, 120],
    [150, 220, 255], [180, 255, 180], [235, 180, 255],
  ];
  const sprinkles = [];
  for (let i = 0; i < floor(random(100, 800)); i++) {
    sprinkles.push({
      x:   random(-rectW * 0.44, rectW * 0.44),
      y:   random(-circH * 0.28, circH * 0.10),
      ang: random(TWO_PI),
      col: random(sprPalette),
    });
  }

  return {
    cx, cy, rectW, rectH, circH, candleW, col, plateCol, flameDark: 0,
    candleCount, candlePositions, candleYOffsets, candleHeights, sprinkles,
  };
}

function drawCakeStatic(g, c) {
  const { cx, cy, rectW, rectH, circH, col, plateCol } = c;
  const yb = cy + rectH / 2;
  const yt = cy - rectH / 2;

  const plateH    = rectH * 0.8;
  const plateTopW = rectW * 1.3;
  const plateBotW = rectW * 1.8;
  const plateTopY = yb - circH * 2;
  const plateBotY = plateTopY + plateH;

  g.noStroke();
  g.fill(plateCol[0], plateCol[1], plateCol[2]);
  g.beginShape();
  g.vertex(cx - plateTopW / 2, plateTopY);
  g.vertex(cx + plateTopW / 2, plateTopY);
  g.vertex(cx + plateBotW / 2, plateBotY);
  g.vertex(cx - plateBotW / 2, plateBotY);
  g.endShape(CLOSE);

  g.fill(plateCol[0] * 1.2, plateCol[1] * 1.2, plateCol[2] * 1.2);
  g.rect(cx, plateBotY, plateBotW, plateH * 0.1);

  g.fill(col[0], col[1], col[2]);
  g.rect(cx, cy, rectW, rectH);
  g.ellipse(cx, yb, rectW, circH);

  g.fill(col[0] - 50, col[1] - 50, col[2] - 50);
  g.ellipse(cx, yt, rectW, circH);

  g.blendMode(SOFT_LIGHT);
  g.fill(255, 255, 255, 80);
  g.ellipse(cx - rectW * 0.12, yt - circH * 0.08, rectW * 0.55, circH * 0.45);
  g.blendMode(BLEND);

  for (const s of c.sprinkles) {
    g.push();
    g.translate(cx + s.x, yt + s.y);
    g.rotate(s.ang);
    g.fill(s.col[0], s.col[1], s.col[2]);
    g.noStroke();
    g.rect(0, 0, rectW / 38, rectW / 140, rectW / 140);
    g.pop();
  }

  for (let i = 0; i < c.candleCount; i++) drawCandleStatic(g, c, i, cx, yt);
}

function drawCandleStatic(g, c, i, cx, yt) {
  const { candlePositions, candleHeights, candleYOffsets, candleW } = c;
  const candleX     = cx + candlePositions[i];
  const thisCandleH = candleHeights[i];
  const capH        = candleW / 4;
  const candleY     = yt - thisCandleH / 2 + candleYOffsets[i] / 1.2;
  const topY        = candleY - thisCandleH / 2;
  const botY        = candleY + thisCandleH / 2;

  g.noStroke();
  g.fill(255); g.rect(candleX, candleY, candleW, thisCandleH);
  g.fill(235); g.ellipse(candleX, topY, candleW, capH);
  g.fill(255); g.ellipse(candleX, botY, candleW, capH);
  g.stroke(0); g.strokeWeight(2);
  g.line(candleX, topY - capH * 0.2, candleX, topY - capH * 2);
  g.noStroke();
}

function drawAllFlames(c, g) {
  const yt = c.cy - c.rectH / 2;
  for (let i = 0; i < c.candleCount; i++) {
    const candleX     = c.cx + c.candlePositions[i];
    const thisCandleH = c.candleHeights[i];
    const capH        = c.candleW / 4;
    const candleY     = yt - thisCandleH / 2 + c.candleYOffsets[i] / 1.2;
    const topY        = candleY - thisCandleH / 2;
    drawFlame(g, candleX, topY, thisCandleH, capH, c.candleW, i, c.flameDark);
  }
}

function drawFlame(g, candleX, topY, thisCandleH, capH, candleW, i, d) {
  const t          = frameCount * 0.012 + i * 6.3;
  const flicker    = map(noise(t),            0, 1, -thisCandleH * 0.012, thisCandleH * 0.012);
  const flutter    = map(noise(t * 1.7 + 99), 0, 1, -1.5, 1.5);
  const flameBaseY = topY - capH * 2;
  const flameCY    = flameBaseY - thisCandleH * 0.2 + flicker;
  const fX         = candleX + flutter;

  g.blendMode(ADD);
  g.noStroke();
  const glowSizes  = [thisCandleH * 2.8, thisCandleH * 1.9, thisCandleH * 1.1];
  const glowAlphas = [12, 20, 30];
  for (let gl = 0; gl < 3; gl++) {
    g.fill(max(0, 255 - d), max(0, 180 - d), max(0, 60 - d), glowAlphas[gl]);
    g.ellipse(fX, flameCY, glowSizes[gl], glowSizes[gl]);
  }
  g.blendMode(BLEND);

  g.noStroke();
  g.fill(max(0, 255 - d), max(0, 140 - d), max(0, 30 - d), 160);
  g.ellipse(fX, flameCY, candleW * 0.75, thisCandleH * 0.72);
  g.fill(max(0, 255 - d), max(0, 235 - d), max(0, 80 - d), 200);
  g.ellipse(fX, flameBaseY + flicker * 0.5, candleW * 0.45, thisCandleH * 0.38);
  g.fill(max(0, 255 - d), max(0, 255 - d), max(0, 240 - d), 220);
  g.ellipse(fX, flameBaseY + flicker * 0.3 + thisCandleH * 0.05, candleW * 0.2, thisCandleH * 0.15);
}