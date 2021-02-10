function setup() {
  createCanvas(400, 400);
  noCursor();
}

function draw() {
  background(220);
  noStroke();
  fill(255, 0, 0);
  ellipse(mouseX, mouseY, 10, 10);
  fill(0);
  ellipse(mouseX, mouseY, 5, 5);
}
