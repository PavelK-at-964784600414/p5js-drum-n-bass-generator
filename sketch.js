let maestor;

function setup() {
  print(width, height)
  createCanvas(windowWidth, windowHeight);

  maestor = new Maestor(width, height);
  startAudioContext();
}

function draw() {
  noLoop();
}
