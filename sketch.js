// -----------------------------
// 🔵 WebSocket Receiver Mode
// -----------------------------
let socket;
let vol = 0;          // ← sender가 보내주는 값
let smoothVol = 0;    // ← 화면용 부드러운 볼륨값

let particles = [];

// NASA Thermal Palette Colors
let c1, c2, c3, c4;

function setup() {
  createCanvas(windowWidth, windowHeight);
  background('#000000');

  textAlign(CENTER, CENTER);
  textSize(28);
  fill(120);
  text("Receiver Mode: Waiting for Audio...", width / 2, height / 2);

  // NASA / thermal-like palette
  c1 = color('#1B0050'); 
  c2 = color('#7A1C8A'); 
  c3 = color('#FF6B1A'); 
  c4 = color('#FFFFFF'); 

  // -----------------------------
  // 🔥 WebSocket 연결
  // -----------------------------
  socket = new WebSocket("ws://192.168.100.100:8080"); // IP 업데이트 필요하면 바꿔줘!

  socket.onopen = () => {
    console.log("Receiver connected to WebSocket server");
  };

  socket.onmessage = (event) => {
    let data = JSON.parse(event.data);

    if (data.type === "audio") {
      vol = data.volume;       // 🔵 sender → 서버 → 여기로 전달됨
      // sender FFT 필요하면 data.fft 도 받음 (지금은 사용 X)
    }
  };
}

function draw() {
  background('#000000');

  // -----------------------------
  // 🔥 sender로부터 받은 vol로 동작
  // -----------------------------
  smoothVol = lerp(smoothVol, vol, 0.15);

  // energy는 vol에 비례
  let energy = smoothVol * 1000;

  if (energy > 5) {
    createParticles(int(energy * 0.5));
  }

  // display all particles
  for (let i = particles.length - 1; i >= 0; i--) {
    particles[i].update();
    particles[i].display();
    if (particles[i].isDead()) particles.splice(i, 1);
  }
}

// -------------------------------------------------
// 🔥 Main Particles + Shards
// -------------------------------------------------
function createParticles(count) {
  count = constrain(count, 3, 10);

  for (let i = 0; i < count; i++) {
    let px = width / 2;
    let py = height / 2;

    let main = new Particle(px, py);
    particles.push(main);

    createShards(px, py, main.size);
  }
}

function createShards(x, y, parentSize) {
  let shardCount = int(random(8, 14));

  for (let i = 0; i < shardCount; i++) {
    particles.push(new ShardParticle(x, y, parentageSize));
  }

  // tiny dust sparkles
  for (let i = 0; i < 12; i++) {
    particles.push(new MiniParticle(x, y, parentSize));
  }
}

// -------------------------------------------------
// 🎇 NASA Thermal Color Mapping
// -------------------------------------------------
function thermalColor(t) {
  if (t < 0.33) {
    return lerpColor(c1, c2, t / 0.33);
  } else if (t < 0.66) {
    return lerpColor(c2, c3, (t - 0.33) / 0.33);
  } else {
    return lerpColor(c3, c4, (t - 0.66) / 0.34);
  }
}

// -------------------------------------------------
// ⭐ Big Particle
// -------------------------------------------------
class Particle {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.vel = p5.Vector.random2D().mult(random(1, 4));

    let baseSize = random(40, 90);
    let volBoost = smoothVol * 800;
    this.size = baseSize + volBoost;

    this.alpha = 255;

    let t = constrain(smoothVol * 15, 0, 1);
    this.col = thermalColor(t);
  }

  update() {
    this.pos.add(this.vel);
    this.vel.mult(0.9);
    this.alpha -= 12;
  }

  display() {
    noStroke();
    fill(red(this.col), green(this.col), blue(this.col), this.alpha);
    circle(this.pos.x, this.pos.y, this.size);
  }

  isDead() {
    return this.alpha <= 0;
  }
}

class ShardParticle {
  constructor(x, y, parentSize) {
    this.pos = createVector(
      x + random(-parentSize * 0.2, parentSize * 0.2),
      y + random(-parentSize * 0.2, parentSize * 0.2)
    );

    this.vel = p5.Vector.random2D().mult(random(2, 6));
    this.size = random(4, 12);
    this.alpha = 200;

    let t = constrain(smoothVol * 15, 0, 1);
    this.col = thermalColor(t);
  }

  update() {
    this.pos.add(this.vel);
    this.vel.mult(0.88);
    this.alpha -= 18;
  }

  display() {
    noStroke();
    fill(red(this.col), green(this.col), blue(this.col), this.alpha);
    circle(this.pos.x, this.pos.y, this.size);
  }

  isDead() {
    return this.alpha <= 0;
  }
}

class MiniParticle {
  constructor(x, y, parentSize) {
    this.pos = createVector(
      x + random(-parentSize * 0.3, parentSize * 0.3),
      y + random(-parentSize * 0.3, parentSize * 0.3)
    );

    this.vel = p5.Vector.random2D().mult(random(0.5, 2));
    this.size = random(1, 3);
    this.alpha = 180;

    let t = constrain(smoothVol * 15, 0, 1);
    this.col = thermalColor(t);
  }

  update() {
    this.pos.add(this.vel);
    this.vel.mult(0.92);
    this.alpha -= 15;
  }

  display() {
    noStroke();
    fill(red(this.col), green(this.col), blue(this.col), this.alpha);
    circle(this.pos.x, this.pos.y, this.size);
  }

  isDead() {
    return this.alpha <= 0;
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  background('#000000');
}
