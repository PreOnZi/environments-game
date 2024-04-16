let tower = [];
let craneX;
let blockWidth = 50;
let blockHeight = 20;
let blockSpeed = 2;
let gravity = 0.1; // Gravity force
let gameOver = false;
let block;

function setup() {
  createCanvas(windowWidth, windowHeight);
  craneX = width / 2;
  let initialX = random(width); // Generate random x-coordinate within canvas width
  let initialY = 0; // Set initial y-coordinate to the top of the canvas
  block = new Block(initialX, initialY, blockWidth, blockHeight, color(255, 0, 0), "square");
}

function draw() {
  background(220);
  
  if (!gameOver) {
    // Move and display tower blocks
    for (let block of tower) {
      block.display();
      block.applyGravity(); // Apply gravity to tower blocks
    }
    
    // Move and display crane block
    block.display();
    block.move();
    
    // Check for collision with tower or bottom edge
    if (block.collidesWithTower(tower) || block.y + block.height >= height) {
      tower.push(new Block(block.x, block.y, block.width, block.height, block.color, block.shape));
      let initialX = random(width); // Generate random x-coordinate within canvas width
      let initialY = 0; // Set initial y-coordinate to the top of the canvas
      block = new Block(initialX, initialY, blockWidth, blockHeight, randomColor(), randomShape());
    }
    
    // Check for game over
    if (tower.length > 0 && tower[tower.length - 1].y <= 0) {
      gameOver = true;
    }
    
    // Check tower stability
    if (!isTowerStable()) {
      towerFalls();
    }
  } else {
    textSize(32);
    textAlign(CENTER, CENTER);
    fill(255, 0, 0);
    text("Game Over", width / 2, height / 2);
  }
}

function keyPressed() {
  // Move crane left or right continuously while arrow keys are held down
  if (keyCode === LEFT_ARROW) {
    craneX -= 5;
    block.x -= 5;
  } else if (keyCode === RIGHT_ARROW) {
    craneX += 5;
    block.x += 5;
  }
}

function keyReleased() {
  // Stop crane movement when arrow keys are released
  if (keyCode === LEFT_ARROW || keyCode === RIGHT_ARROW) {
    // Do nothing
  }
}

function randomColor() {
  return color(random(255), random(255), random(255));
}

function randomShape() {
  return random(["square", "rectangle"]);
}

class Block {
  constructor(x, y, w, h, col, shp) {
    this.x = x;
    this.y = y;
    this.width = w;
    this.height = h;
    this.color = col;
    this.shape = shp;
    this.speedY = blockSpeed; // Vertical speed
  }
  
  move() {
    if (this.y + this.height < height) { // Check if block is not at the bottom
      this.y += this.speedY;
    } else {
      this.speedY = 0; // Set vertical speed to 0 when block lands
    }
  }
  
  display() {
    fill(this.color);
    if (this.shape === "square") {
      rect(this.x, this.y, this.width, this.height);
    } else if (this.shape === "rectangle") {
      rect(this.x, this.y, this.width * 1.5, this.height);
    }
  }
  
  applyGravity() {
    if (!this.isStable()) {
      this.speedY += gravity; // Apply gravity if block is not stable
    }
  }
  
  isStable() {
    let bottomY = this.y + this.height;
    for (let other of tower) {
      if (this !== other && this.collidesWith(other)) {
        let overlap = min(this.y + this.height, other.y + other.height) - max(this.y, other.y);
        if (overlap > 0 && overlap < this.width / 2) { // Check if overlap is less than half of block width
          return true; // Block is stable
        }
      }
    }
    return bottomY >= height; // Block is stable if it's at the bottom
  }
  
  collidesWithTower(tower) {
    for (let block of tower) {
      if (this.collidesWith(block)) {
        return true;
      }
    }
    return false;
  }
  
  collidesWith(other) {
    return (
      this.x < other.x + other.width &&
      this.x + this.width > other.x &&
      this.y < other.y + other.height &&
      this.y + this.height > other.y
    );
  }
}

function isTowerStable() {
  for (let block of tower) {
    if (!block.isStable()) {
      return false;
    }
  }
  return true;
}

function towerFalls() {
  for (let block of tower) {
    block.speedY = blockSpeed; // Reset block speed
  }
}
