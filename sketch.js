let showCake = false;
let rectW, rectH, col, candleW, circH;
let candleCount;
let candlePositions = [];
let candleYOffsets = [];   // Y offsets for slightly irregular placement
let candleHeights = [];    // Individual candle heights
let sprinkles = [];

function setup() {
  createCanvas(windowWidth, windowHeight);
  rectMode(CENTER);
  noStroke();
}

function draw() {
  background(100, 100, 100, 150);
  // Center greeting text
  noStroke();
  textAlign(CENTER, CENTER);
  textSize(12);
  fill(255);
  textFont('Georgia');
  text('happy birthday! <3', width / 2, height / 2);

  if (!showCake) return;
  background(50, 50, 50, 150);
  const cx = width / 2;
  const cy = height / 2;
  const yb = cy + rectH / 2;
  const yt = cy - rectH / 2;

  // Plate (trapezoid shape)
  const plateH = rectH * 0.8;
  const plateTopW = rectW * 1.3;
  const plateBotW = rectW * 1.8;
  const plateTopY = yb - circH * 2;
  const plateBotY = plateTopY + plateH;
  noStroke();
  fill(200, 200, 170);
  beginShape();
  vertex(cx - plateTopW / 2, plateTopY);
  vertex(cx + plateTopW / 2, plateTopY);
  vertex(cx + plateBotW / 2, plateBotY);
  vertex(cx - plateBotW / 2, plateBotY);
  endShape(CLOSE);
  fill('lightyellow');
  rect(cx, plateBotY + plateBotY * 0.01, plateBotW, plateH * 0.1);

  // Cake body
  fill(col[0], col[1], col[2]);
  rect(cx, cy, rectW, rectH);
  ellipse(cx, yb, rectW, circH);

  // Top ellipse (shadow)
  fill(col[0] - 50, col[1] - 50, col[2] - 50);
  ellipse(cx, yt, rectW, circH);

  // Sprinkles
  for (const s of sprinkles) {
    push();
    translate(cx + s.x, yt + s.y);
    rotate(s.ang);
    fill(s.col[0], s.col[1], s.col[2]);
    noStroke();
    const sw = rectW / 38;
    const sh = rectW / 140;
    rect(0, 0, sw, sh, sh);
    pop();
  }

  // Candles
  for (let i = 0; i < candleCount; i++) {
    const candleX = candlePositions[i];
    const thisCandleH = candleHeights[i];
    const capH = candleW / 4;

    // Y position with small random offset and global upward shift
    const candleY = yt - thisCandleH / 2 + candleYOffsets[i]/1.2;
    const topY = candleY - thisCandleH / 2;
    const botY = candleY + thisCandleH / 2;

    // Candle body
    noStroke();
    fill(255);
    rect(candleX, candleY, candleW, thisCandleH);
    fill(235);
    ellipse(candleX, topY, candleW, capH);
    fill(255);
    ellipse(candleX, botY, candleW, capH);

    // Wick
    stroke(0);
    strokeWeight(2);
    line(candleX, topY - capH * 0.2, candleX, topY - capH * 2);
    noStroke();

    // Flame
    const flameBaseY = topY - capH * 2;
    const flicker = map(
      noise(frameCount * 0.01 + i * 7),
      0, 1,
      -thisCandleH * 0.015,
      thisCandleH * 0.015
    );

    // Outer glow
    stroke(255, 250, random(200, 255), random(25, 30));
    strokeWeight(random(1, candleW));
    fill(255, 255, random(150, 255), random(0, 10));
    circle(candleX, flameBaseY - flicker - thisCandleH * 0.2, thisCandleH * 2.5);

    // Outer flame
    fill(255, 150, 0, 150);
    stroke(255, 255, 255, 30);
    strokeWeight(random(3, 10));
    ellipse(candleX, flameBaseY - flicker - thisCandleH * 0.2, candleW * 0.7, thisCandleH * 0.7);

    // Inner flame
    stroke(255, 230, 0, 25);
    strokeWeight(1 + flicker);
    fill(255, 230, 0, 180);
    ellipse(candleX, flameBaseY + flicker, candleW * 0.5, thisCandleH * 0.4);
  }
}

function mousePressed() {
  showCake = !showCake;
  if (!showCake) return;

  const t = random(0.85, 1.5);
  const r = random(0.5, 1.5);

  rectW = r * 200 * t;
  rectH = (r / 1.5) * 200;
  circH = rectH / 5;
  candleW = rectW / 20;

  col = [random(150, 255), random(150, 255), random(0, 255)];

  // Candle positions and irregularities
  candleCount = floor(random(1, 4));
  candlePositions = [];
  candleYOffsets = [];
  candleHeights = [];
  const spacing = rectW / (candleCount + 1);
  const centerX = width / 2;

  for (let i = 0; i < candleCount; i++) {
    const baseOffset = -rectW / 2 + spacing * (i + 1);
    const xOffset = random(-rectW * 0.05, rectW * 0.05);
    candlePositions.push(centerX + baseOffset + xOffset);

    // Random Y offset
    candleYOffsets.push(random(-10, 10));

    // Random individual candle height
    const baseCandleH = rectH / 3;
    candleHeights.push(baseCandleH * random(0.85, 1.15));
  }

  // Sprinkle generation
  sprinkles = [];
  const sprCount = floor(random(18, 36));
  const sprpallete = 
  [
    [255, 120, 120],
    [255, 200, 120],
    [150, 220, 255],
    [180, 255, 180],
    [235, 180, 255]
  ];
  for (let i = 0; i < sprCount; i++) {
    const sx = random(-rectW * 0.44, rectW * 0.44);
    const sy = random(-circH * 0.28, circH * 0.10);
    const ang = random(365);
    const scol = random(sprpallete);
    sprinkles.push({ x: sx, y: sy, ang, col: scol });
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}