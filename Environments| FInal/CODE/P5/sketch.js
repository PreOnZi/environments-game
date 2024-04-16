let landedShapes = []; // Array to store landed shapes

function preload() {}

function setup() {
  createCanvas(windowWidth, windowHeight);
  b2newWorld(30, b2V(0, 10));
  new b2Body('edge', false, b2V(width / 2, height - 4), [b2V(-width / 2, 0), b2V(width / 2, 0)]);
}

function draw() {
  background(255, 205, 0);
  
  // Draw landed shapes with their stored color
  for (let shape of landedShapes) {
    fill(shape.color);
    stroke(0);
    shape.body.draw();
  }
  
  if (frameCount % 60 == 0) {
    let randomColor = color(random(255), random(255), random(255)); // Generate a random RGB color
    fill(randomColor); // Set the fill color to the random color
    stroke(0); // Set the stroke color to black
    let newShape = new b2Body('box', true, b2V(width / 2 + 80, 100), b2V(90, 50));
    newShape.color = randomColor; // Store the color of the new shape
  }
  
  b2Update();
  b2Draw();
}

function EndContactHandler(contactPtr) {
  let shape = b2GetUserDataFromContact(contactPtr); // Get the shape that landed
  landedShapes.push({ body: shape, color: shape.color }); // Store the shape and its color
}

