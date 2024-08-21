let maestor;

function setup() {
  createCanvas(1000, 607);
  maestor = new Maestor(width, height);
  startAudioContext();
}

function draw() {
  noLoop();
}
