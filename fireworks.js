/**
 * This is an infinite fireworks simulation. Fireworks launch from the bottom of the 
 * screen and explode at a random location. The user can also click anywhere on
 * the screen to launch a new firework.
 * 
 * When a firework is made, the firework and particles are added to arrays. 
 * These arrays are iterated through on each animation frame to draw everything, by 
 * by calling the draw method on the Firework on Particle. 
 * 
 * The timerInterval and timerTick variables control how often fireworks are launched
 * randomly from the bottom of the screen. The user can also click the mouse to 
 * launch a firework which is controlled by mouse event listeners at the bottom 
 * of the code. 
 */

// get the canvas element
const canvas = document.getElementById('fireworks-canvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const fireworks = [];
const particles = [];
let hue = 0;

// timer for automatically firing fireworks
let timerInterval = 40;
let timerTick = 0;

// mouse coordinates
let mousedown = false;
let mx; 
let my;

// helper function for getting random number
function random(min, max) {
  return Math.random() * (max - min) + min;
}

// helper function for distance formula
function calculateDistance(p1x, p1y, p2x, p2y) {
  const xDistance = p1x - p2x;
  const yDistance = p1y - p2y;
  return Math.sqrt(Math.pow(xDistance, 2) + Math.pow(yDistance, 2));
}


function Firework(sx, sy, tx, ty) {
  this.x = sx;
  this.y = sy;
  this.sx = sx;
  this.sy = sy;
  this.tx = tx;
  this.ty = ty;
  this.distanceToTarget = calculateDistance(sx, sy, tx, ty);
  this.distanceTraveled = 0;
  this.coordinates = [];
  this.coordinateCount = 3;
  while (this.coordinateCount--) {
    this.coordinates.push([this.x, this.y]);
  }
  this.angle = Math.atan2(ty - sy, tx - sx);
  this.speed = random(2, 4); 
  this.acceleration = 1.05;
  this.brightness = random(50, 80); 
}

Firework.prototype.update = function (index) {
  this.coordinates.pop();
  this.coordinates.unshift([this.x, this.y]);

  this.speed *= this.acceleration;

  const vx = Math.cos(this.angle) * this.speed;
  const vy = Math.sin(this.angle) * this.speed;
  this.distanceTraveled = calculateDistance(this.sx, this.sy, this.x + vx, this.y + vy);

  if (this.distanceTraveled >= this.distanceToTarget) {
    createParticles(this.tx, this.ty);
    fireworks.splice(index, 1);
  } else {
    this.x += vx;
    this.y += vy;
  }
};

Firework.prototype.draw = function () {
  ctx.beginPath();
  ctx.moveTo(this.coordinates[this.coordinates.length - 1][0], this.coordinates[this.coordinates.length - 1][1]);
  ctx.lineTo(this.x, this.y);
  ctx.strokeStyle = `hsl(${hue}, 100%, ${this.brightness}%)`;
  ctx.lineWidth = random(1, 3); 
  ctx.stroke();
};


function Particle(x, y) {
  this.x = x;
  this.y = y;
  this.coordinates = [];
  this.coordinateCount = 5;
  while (this.coordinateCount--) {
    this.coordinates.push([this.x, this.y]);
  }
  this.angle = random(0, Math.PI * 2);
  this.speed = random(1, 10);
  this.friction = 0.95;
  this.gravity = 1;
  this.hue = random(hue - 50, hue + 50);
  this.brightness = random(50, 80);
  this.alpha = 1;
  this.decay = random(0.015, 0.03);
}

Particle.prototype.update = function (index) {
  this.coordinates.pop();
  this.coordinates.unshift([this.x, this.y]);
  this.speed *= this.friction;
  this.x += Math.cos(this.angle) * this.speed;
  this.y += Math.sin(this.angle) * this.speed + this.gravity;
  this.alpha -= this.decay;

  if (this.alpha <= this.decay) {
    particles.splice(index, 1);
  }
};

Particle.prototype.draw = function () {
  ctx.beginPath();
  ctx.moveTo(this.coordinates[this.coordinates.length - 1][0], this.coordinates[this.coordinates.length - 1][1]);
  ctx.lineTo(this.x, this.y);
  ctx.strokeStyle = `hsla(${this.hue}, 100%, ${this.brightness}%, ${this.alpha})`;
  ctx.lineWidth = random(1, 3); 
  ctx.stroke();
};

function createParticles(x, y) {
  let particleCount = 40; 
  while (particleCount--) {
    particles.push(new Particle(x, y));
  }
}

// main loop
function loop() {
  requestAnimationFrame(loop);

  hue = random(0, 360);

  ctx.globalCompositeOperation = 'destination-out';
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.globalCompositeOperation = 'lighter';

  for (let i = fireworks.length - 1; i >= 0; i--) {
    fireworks[i].draw();
    fireworks[i].update(i);
  }

  for (let i = particles.length - 1; i >= 0; i--) {
    particles[i].draw();
    particles[i].update(i);
  }

  if (timerTick >= timerInterval) {
    if (!mousedown) {
      fireworks.push(new Firework(canvas.width / 2, canvas.height, random(0, canvas.width), random(0, canvas.height / 2)));
      timerTick = 0;
    }
  } else {
    timerTick++;
  }

  if (mousedown) {
    fireworks.push(new Firework(canvas.width / 2, canvas.height, mx, my));
  }
}

// Mouse event handlers
canvas.addEventListener('mousemove', (e) => {
  mx = e.pageX - canvas.offsetLeft;
  my = e.pageY - canvas.offsetTop;
});

canvas.addEventListener('mousedown', (e) => {
  e.preventDefault();
  mousedown = true;
});

canvas.addEventListener('mouseup', (e) => {
  e.preventDefault();
  mousedown = false;
});

// Start the simulation
loop();
