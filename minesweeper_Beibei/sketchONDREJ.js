// Global declarations for the grid, dimensions, and cell width
let grid;
let cols;
let rows;
const w = 60; // Width of each cell
let showOrangeCircle = false; // Variable to control the display of the orange circle
let orangeCircleTimer = 0; // Timer to control the duration of the orange circle
const circleDuration = 60; // Duration of the circle in frames (approx 2 seconds)
let showBlueBox = false; // Variable to control the display of the blue box
let blueBoxTimer = 0; // Timer to control the duration of the blue box display

let port;
let connectBtn;

// Positions for the mines
const fixedMinePositions = [
  [0, 0],
  [2, 4], [9, 5], [4, 3], [9, 2], [5, 8], [7, 7], [1, 5], [5, 4], [4, 5], [6, 5], [5, 5], [3, 6], [4, 8], [6, 2], [5, 4], [4, 4], [5, 1], [6, 1], [1, 2], [8, 6]
];
const fixedPunchPositions = [[7, 9], [3, 3], [0, 4], [9, 0]];
const fixedBrickPositions = [[9, 9], [9, 4], [0, 8], [2, 9], [3, 1]];

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
    this.fixedBrick = false;
    this.fixedPunch = false;
    this.revealed = false;
  }

  show() {
    stroke(0);
    if (this.revealed) {
      if (this.bee) {
        fill('black');
        rect(this.x, this.y, this.w, this.w); // Display black rectangle for black mine
      } else if (this.fixedBrick) {
        fill(0, 0, 255); // Blue color for fixed bricks
        rect(this.x, this.y, this.w, this.w); // Display blue rectangle for blue mine
        if (showBlueBox) {
          fill(255);
          textSize(20);
          text("Blue Mine Found!", this.x + this.w / 4, this.y + this.w / 2);
        }
      } else if (this.fixedPunch) {
        fill(255, 165, 0); // Orange color for fixed punch
        ellipse(this.x + this.w * 0.5, this.y + this.w * 0.5, this.w * 0.5);
        if (showOrangeCircle) {
          fill(255, 165, 0, 150); // Semi-transparent orange color
          ellipse(width / 2, height / 2, w * 2); // Large circle at the center of the canvas
        }
      } else if (this.neighborCount > 0) {
        fill(this.isNeighborBlueBrick() ? color(0, 0, 255) : 0); // Blue color for numbers touching blue bricks
        textSize(16);
        text(this.neighborCount, this.x + this.w * 0.5, this.y + this.w * 0.5);
      }
    } else {
      fill(250); // Light gray for unrevealed cells
      rect(this.x, this.y, this.w, this.w);
    }
  }

  countBees() {
    if (this.bee || this.fixedBrick || this.fixedPunch) { // Include fixed bricks in mine count
      this.neighborCount = -1;
      return;
    }
    let total = 0;
    for (let xoff = -1; xoff <= 1; xoff++) {
      for (let yoff = -1; yoff <= 1; yoff++) {
        let i = this.i + xoff, j = this.j + yoff;
        if (i >= 0 && i < cols && j >= 0 && j < rows && (grid[i][j].bee || grid[i][j].fixedBrick || grid[i][j].fixedPunch)) {
          total++;
        }
      }
    }
    this.neighborCount = total;
  }

  reveal() {
    this.revealed = true;
    if (this.neighborCount == 0) {
      // Implement flood fill if needed
    }
    if (this.bee) {
      // Display the black square for a black mine
      showBlackSquare = true;
      blackSquareTimer = circleDuration;  // Reuse the duration variable for consistency
    }
    if (this.fixedBrick) {
      // Display text for the blue mine
      showBlueBox = true;
      blueBoxTimer = circleDuration;
    }
    if (this.fixedPunch) {
      // Send signal to Arduino when an orange mine is discovered
      if (port.opened()) {
        port.write("OrangeMine\n");
      }
    }
  }

  floodFill() {
    for (let xoff = -1; xoff <= 1; xoff++) {
      for (let yoff = -1; yoff <= 1; yoff++) {
        let i = this.i + xoff, j = this.j + yoff;
        if (i >= 0 && i < cols && j >= 0 && j < rows && !grid[i][j].bee && !grid[i][j].fixedBrick && !grid[i][j].fixedPunch && !grid[i][j].revealed) {
          grid[i][j].reveal();
        }
      }
    }
  }

  contains(x, y) {
    return (x > this.x && x < this.x + this.w && y > this.y && y < this.y + this.w);
  }

  isNeighborBlueBrick() {
    for (let xoff = -1; xoff <= 1; xoff++) {
      for (let yoff = -1; yoff <= 1; yoff++) {
        let i = this.i + xoff, j = this.j + yoff;
        if (i >= 0 && i < cols && j >= 0 && j < rows && grid[i][j].fixedBrick) {
          return true;
        }
      }
    }
    return false;
  }
}

// Setup the canvas and grid
function setup() {
  createCanvas(600, 600);
  cols = floor(width / w);
  rows = floor(height / w);
  grid = make2DArray(cols, rows);

  // Serial Port Initialization
  port = createSerial();

  // Creating a separate div for the connect button
  let buttonDiv = createDiv('');
  buttonDiv.position(20, 20);

  // Creating the connect button
  connectBtn = createButton('Connect to Arduino');
  connectBtn.parent(buttonDiv);
  connectBtn.mousePressed(connectBtnClick);

  // Placing mines at fixed positions
  fixedMinePositions.forEach(pos => {
    let i = pos[0], j = pos[1];
    if (i < cols && j < rows) {
      grid[i][j].bee = true;
    }
  });
  // Placing fixed bricks at fixed positions
  fixedBrickPositions.forEach(pos => {
    let i = pos[0], j = pos[1];
    if (i < cols && j < rows) {
      grid[i][j].fixedBrick = true;
    }
  });
  // Placing fixed punch mines at fixed positions
  fixedPunchPositions.forEach(pos => {
    let i = pos[0], j = pos[1];
    if (i < cols && j < rows) {
      grid[i][j].fixedPunch = true;
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
      }
    }
  }
  return false; // Prevent default behavior
}

// Drawing the grid and cells
function draw() {
  background(255);
  // Display the orange circle if needed
  if (showOrangeCircle) {
    fill(255, 165, 0, 150); // Semi-transparent orange color
    ellipse(width / 2, height / 2, w * 2); // Large circle at the center of the canvas
    // Decrease the timer
    orangeCircleTimer--;
    // Hide the orange circle when the timer reaches 0
    if (orangeCircleTimer <= 0) {
      showOrangeCircle = false;
    }
  }
  // Display the blue box with message if needed
  if (showBlueBox) {
    fill(0, 0, 255, 150); // Semi-transparent blue color
    rect(width / 4, height / 4, width / 2, height / 2); // Blue box at the center of the canvas
    fill(255);
    textSize(32);
    text("Blue Mine Found!", width / 4 + 20, height / 4 + 50);
    // Decrease the timer
    blueBoxTimer--;
    // Hide the blue box when the timer reaches 0
    if (blueBoxTimer <= 0) {
      showBlueBox = false;
    }
  }
  // Draw the grid cells
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

function connectBtnClick() {
  if (!port.opened()) {
    port.open('Arduino', 57600);
    connectBtn.html('Disconnect');
  } else {
    port.close();
    connectBtn.html('Connect to Arduino');
  }
}
