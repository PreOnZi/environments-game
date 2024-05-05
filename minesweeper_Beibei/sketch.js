// Global declarations for the grid, dimensions, and cell width
let grid;
let cols;
let rows;
const w = 60;  // Width of each cell

// Positions for the mines
const fixedMinePositions = [
  [2, 4], [9, 5], [4, 3], [9, 2], [5, 8], [7, 7], [1, 5], [5, 4], [4, 5], [6, 5], [5, 5], [3, 6], [4, 8], [6, 2], [5, 4], [4, 4], [5, 1], [6, 1], [1, 2], [8, 6]
];

// Cell class definition
class Cell {
  constructor(i, j, w) {
    this.i = i;
    this.j = j;
    this.x = i * w;
    this.y = j * w;
    this.w = w;
    this.neighborCount = 0;
    this.bee = false;
    this.revealed = false;
  }

  show() {
    stroke(0);
    fill(this.revealed ? (this.bee ? 0 : 200) : 255);
    rect(this.x, this.y, this.w, this.w);
    textAlign(CENTER, CENTER);
    if (this.revealed) {
      if (this.bee) {
        fill(127); // Dark gray for the bee
        ellipse(this.x + this.w * 0.5, this.y + this.w * 0.5, this.w * 0.5);
      } else if (this.neighborCount > 0) {
        fill(0); // Black color for the text
        textSize(16);
        text(this.neighborCount, this.x + this.w * 0.5, this.y + this.w * 0.5);
      }
    }
  }

  countBees() {
    if (this.bee) {
      this.neighborCount = -1;
      return;
    }
    let total = 0;
    for (let xoff = -1; xoff <= 1; xoff++) {
      for (let yoff = -1; yoff <= 1; yoff++) {
        let i = this.i + xoff, j = this.j + yoff;
        if (i >= 0 && i < cols && j >= 0 && j < rows && grid[i][j].bee) {
          total++;
        }
      }
    }
    this.neighborCount = total;
  }

  reveal() {
    this.revealed = true;
    if (this.neighborCount == 0) {
      this.floodFill();
    }
  }

  floodFill() {
    for (let xoff = -1; xoff <= 1; xoff++) {
      for (let yoff = -1; yoff <= 1; yoff++) {
        let i = this.i + xoff, j = this.j + yoff;
        if (i >= 0 && i < cols && j >= 0 && j < rows && !grid[i][j].bee && !grid[i][j].revealed) {
          grid[i][j].reveal();
        }
      }
    }
  }

  contains(x, y) {
    return (x > this.x && x < this.x + this.w && y > this.y && y < this.y + this.w);
  }
}

// Setup the canvas and grid
function setup() {
  createCanvas(600, 600);
  cols = floor(width / w);
  rows = floor(height / w);
  grid = make2DArray(cols, rows);
  
  // Placing mines at fixed positions
  fixedMinePositions.forEach(pos => {
    let i = pos[0], j = pos[1];
    if (i < cols && j < rows) {
      grid[i][j].bee = true;
    }
  });

  // Counting bees for each cell
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      grid[i][j].countBees();
    }
  }
}

// Handling mouse presses on the canvas
function mousePressed() {
  if (mouseX >= 0 && mouseX < width && mouseY >= 0 && mouseY < height) {
    let i = floor(mouseX / w);
    let j = floor(mouseY / w);
    if (i >= 0 && i < cols && j >= 0 && j < rows) {
      if (grid[i][j].contains(mouseX, mouseY)) {
        grid[i][j].reveal();
        if (grid[i][j].bee) {
          gameOver();
        }
      }
    }
  }
  return false; // Prevent default behavior
}

// Drawing the grid and cells
function draw() {
  background(255);
  grid.forEach(row => row.forEach(cell => cell.show()));
}

// Create a 2D array for the grid
function make2DArray(cols, rows) {
  let arr = new Array(cols);
  for (let i = 0; i < cols; i++) {
    arr[i] = new Array(rows);
    for (let j = 0; j < rows; j++) {
      arr[i][j] = new Cell(i, j, w);
    }
  }
  return arr;
}

// Revealing all cells at game over
function gameOver() {
  grid.forEach(row => row.forEach(cell => cell.revealed = true));
  document.getElementById('status').innerHTML = "YOU FAIL!"; 
  httpGet('http://arduino.local/mine?pin=5', 'text', false, function(response) {
    console.log(response);
  });
}
