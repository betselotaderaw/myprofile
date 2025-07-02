/**
 * Home page wave animation
 */
const ClassicalNoise = function() {
  const r = Math; // Define random number generator

  this.grad3 = [
    [1, 1, 0], [-1, 1, 0], [1, -1, 0], [-1, -1, 0],
    [1, 0, 1], [-1, 0, 1], [1, 0, -1], [-1, 0, -1],
    [0, 1, 1], [0, -1, 1], [0, 1, -1], [0, -1, -1]
  ];

  this.p = [];

  for (let i = 0; i < 256; i++) {
    this.p[i] = Math.floor(r.random() * 256);
  }

  // To remove the need for index wrapping, double the permutation table length
  this.perm = [];
  for (let i = 0; i < 512; i++) {
    this.perm[i] = this.p[i & 255];
  }
};

ClassicalNoise.prototype.dot = function (g, x, y, z) {
  return g[0] * x + g[1] * y + g[2] * z;
};

ClassicalNoise.prototype.mix = function (a, b, t) {
  return (1.0 - t) * a + t * b;
};

ClassicalNoise.prototype.fade = function (t) {
  return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
};

// Classic Perlin noise, 3D version
ClassicalNoise.prototype.noise = function (x, y, z) {
  // Find unit grid cell containing point
  let X = Math.floor(x);
  let Y = Math.floor(y);
  let Z = Math.floor(z);

  // Get relative xyz coordinates of point within that cell
  x = x - X;
  y = y - Y;
  z = z - Z;

  // Wrap the integer cells at 255 (smaller integer period can be introduced here)
  X = X & 255;
  Y = Y & 255;
  Z = Z & 255;

  // Calculate a set of eight hashed gradient indices
  const gi000 = this.perm[X + this.perm[Y + this.perm[Z]]] % 12;
  const gi001 = this.perm[X + this.perm[Y + this.perm[Z + 1]]] % 12;
  const gi010 = this.perm[X + this.perm[Y + 1 + this.perm[Z]]] % 12;
  const gi011 = this.perm[X + this.perm[Y + 1 + this.perm[Z + 1]]] % 12;
  const gi100 = this.perm[X + 1 + this.perm[Y + this.perm[Z]]] % 12;
  const gi101 = this.perm[X + 1 + this.perm[Y + this.perm[Z + 1]]] % 12;
  const gi110 = this.perm[X + 1 + this.perm[Y + 1 + this.perm[Z]]] % 12;
  const gi111 = this.perm[X + 1 + this.perm[Y + 1 + this.perm[Z + 1]]] % 12;

  // The gradients of each corner are now:
  // g000 = grad3[gi000];
  // g001 = grad3[gi001];
  // g010 = grad3[gi010];
  // g011 = grad3[gi011];
  // g100 = grad3[gi100];
  // g101 = grad3[gi101];
  // g110 = grad3[gi110];
  // g111 = grad3[gi111];
  // Calculate noise contributions from each of the eight corners
  const n000 = this.dot(this.grad3[gi000], x, y, z);
  const n100 = this.dot(this.grad3[gi100], x - 1, y, z);
  const n010 = this.dot(this.grad3[gi010], x, y - 1, z);
  const n110 = this.dot(this.grad3[gi110], x - 1, y - 1, z);
  const n001 = this.dot(this.grad3[gi001], x, y, z - 1);
  const n101 = this.dot(this.grad3[gi101], x - 1, y, z - 1);
  const n011 = this.dot(this.grad3[gi011], x, y - 1, z - 1);
  const n111 = this.dot(this.grad3[gi111], x - 1, y - 1, z - 1);
  // Compute the fade curve value for each of x, y, z
  const u = this.fade(x);
  const v = this.fade(y);
  const w = this.fade(z);
  // Interpolate along x the contributions from each of the corners
  const nx00 = this.mix(n000, n100, u);
  const nx01 = this.mix(n001, n101, u);
  const nx10 = this.mix(n010, n110, u);
  const nx11 = this.mix(n011, n111, u);
  // Interpolate the four results along y
  const nxy0 = this.mix(nx00, nx10, v);
  const nxy1 = this.mix(nx01, nx11, v);
  // Interpolate the two last results along z
  const nxyz = this.mix(nxy0, nxy1, w);

  return nxyz;
};

const canvas = document.getElementById('waves');
const ctx = canvas.getContext('2d');
const perlin = new ClassicalNoise();
const variation = .0011;
const amp = 1000;
const maxLines = 50;
const speed = 0.000;
const variators = [];
const color = "0, 0, 0";
let canvasWidth;
let canvasHeight;
let startY;

for (let i = 0, u = 0; i < maxLines; i++, u += .016) {
  variators[i] = u;
}

/*
  Progressive loading optimization:
  The resolution of the animation starts at 10 and gradually increases by 10 each frame.
  Once the resolution reaches 1, the increment is set to 0 so that the animation stops increasing in resolution.
*/
let resolution = 10;
let increment = 10;

// Vibrant, energetic, multi-layered animated waves effect
const vibrantColors = [
  '33,255,147',    // green
  '0,153,255',    // blue
  '255,255,102',  // yellow
  '255,0,255',    // magenta
  '255,102,0',    // orange
  '102,255,255',  // cyan
  '255,0,102',    // pink
  '0,255,204',    // teal
];
const vibrantCount = vibrantColors.length;
const vibrantAmp = [180, 140, 120, 160, 100, 130, 110, 150];
const vibrantSpeed = [0.00018, 0.00022, 0.00013, 0.00019, 0.00016, 0.00021, 0.00015, 0.00017];
const vibrantAlpha = [0.18, 0.13, 0.10, 0.12, 0.15, 0.14, 0.11, 0.13];

function drawVibrantWaves() {
  for (let j = 0; j < vibrantCount; j++) {
    ctx.save();
    ctx.beginPath();
    // Start at the middle bottom left
    const baseY = canvasHeight * 0.75 + (j - vibrantCount / 2) * 30;
    ctx.moveTo(0, baseY);
    for (let x = 0; x <= canvasWidth; x += 2) {
      const y = perlin.noise((x * variation + variators[j]), (x * variation), 0);
      ctx.lineTo(x, baseY + vibrantAmp[j] * y + Math.sin(Date.now() * 0.0005 + j * 2) * 40);
    }
    // End at the bottom right
    ctx.lineTo(canvasWidth, canvasHeight);
    ctx.lineTo(0, canvasHeight);
    ctx.closePath();
    ctx.globalAlpha = vibrantAlpha[j];
    ctx.fillStyle = `rgba(${vibrantColors[j]},1)`;
    ctx.shadowColor = `rgba(${vibrantColors[j]},0.7)`;
    ctx.shadowBlur = 40;
    ctx.fill();
    ctx.restore();
    variators[j] += vibrantSpeed[j];
  }
}

function draw() {
  let y;
  for (let i = 0; i <= maxLines; i++) {
    ctx.beginPath();
    ctx.moveTo(0, startY);

    for (let x = 0; x <= canvasWidth; x += resolution) {
      y = perlin.noise((x * variation + variators[i]), (x * variation), 0);
      ctx.lineTo(x, startY + amp * y);
    }

    const alpha = Math.min(Math.abs(y), .8) + .1;
    ctx.strokeStyle = `rgba(${color}, ${alpha})`;
    ctx.stroke();
    ctx.closePath();

    variators[i] += speed;
  }

  resolution += increment;
  if (resolution > 1) {
    increment = 0;
  }
}

function animate() {
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  drawVibrantWaves();
  requestAnimationFrame(animate);
}

function resizeCanvas() {
  canvasWidth = document.documentElement.clientWidth;
  canvasHeight = document.documentElement.clientHeight;
  canvas.setAttribute("width", canvasWidth);
  canvas.setAttribute("height", canvasHeight);
  startY = canvasHeight / 2;
}

(function init() {
  resizeCanvas();
  animate();
  window.addEventListener('resize', resizeCanvas);
})();
