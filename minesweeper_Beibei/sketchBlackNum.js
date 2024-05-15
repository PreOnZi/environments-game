let grid;
let cols;
let rows;
const w = 60;
let showOrangeCircle = false;
const circleDuration = 60;
let showBlueBox = false;
let port;
let connectBtn;
let blackMineDiscoveredSound;


// Positions for the mines
const fixedMinePositions = [
  [0, 2], [0, 1], [1, 2], [1, 1], [2, 3], [3, 2], [2, 4], [4, 2], 
  [3, 7], [3, 8], [4, 7], [4, 8], [5, 6], [6, 5], [6, 6], [5, 5], 
  [7, 1], [7, 2], [8, 1], [8, 2], [9, 0], [9, 1], [9, 2], [9, 3], [9,9]
];

const fixedPunchPositions = [
  [0, 9], [1, 9], [2, 9], [0, 8], [1, 8], [2, 8], [3, 9], [4, 9], 
  [3, 0], [4, 0], [5, 0], [3, 1], [4, 1], [5, 1], [6, 0], [7, 0], 
  [6, 9], [7, 9], [8, 9], [7, 8], [8, 8], [5, 4], [9, 8] 
];

const fixedBrickPositions = [
  [5, 6], [4, 5], [4, 6], [6, 3], [6, 4], [7, 3], [7, 4], 
  [0, 5], [0, 6], [1, 5], [1, 6], [2, 7], [2, 8], [3, 7], [3, 8], 
  [5, 0], [6, 0], [5, 1], [6, 1], [8, 6], [8, 7], [9, 6], [9, 7], [6, 8] 
];


// CELL CLASS
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
        ellipse(this.x + this.w * 0.5, this.y + this.w * 0.5, this.w * 0.5);
      } else if (this.fixedBrick) {
        fill(0, 0, 255);
        rect(this.x, this.y, this.w, this.w);
        if (showBlueBox) {
          fill(255);
          textSize(10);
          textAlign(CENTER, CENTER);
          text("Take a\nbrick!", this.x + this.w / 2, this.y + this.w / 2);
        }
      } else if (this.fixedPunch) {
        fill(255, 165, 0);
        ellipse(this.x + this.w * 0.5, this.y + this.w * 0.5, this.w * 0.5);
        if (showOrangeCircle) {
          fill(255, 165, 0, 150);
          ellipse(width / 2, height / 2, w * 2);
        }
      } else if (this.neighborCount > 0) {
        if (this.isNeighborBlueBrick()) {
         
        } else {
          fill('black');
          textSize(16);
          text(this.neighborCount, this.x + this.w * 0.5, this.y + this.w * 0.5);
        }
      }
    } else {
      fill(250);
      rect(this.x, this.y, this.w, this.w);
    }
  }

  countBees() {
    if (this.bee || this.fixedBrick || this.fixedPunch) {
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
    if (this.bee) {
      blackMineDiscoveredSound.play();
   
    }
    if (this.fixedBrick) {
      showBlueBox = true;
    
    }
    if (this.fixedPunch) {
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
//PRELOAD
function preload() {
  blackMineDiscoveredSound = loadSound('sound.mp3');
}
// SETUP
function setup() {
  createCanvas(660, 660);
  cols = 10;
  rows = 10; 
  grid = make2DArray(cols, rows);
  port = createSerial();
  let buttonDiv = createDiv('');
  buttonDiv.position(1, 1);
  connectBtn = createButton('Connect to Arduino');
  connectBtn.parent(buttonDiv);
  connectBtn.mousePressed(connectBtnClick);
  fixedMinePositions.forEach(pos => {
    let i = pos[0], j = pos[1];
    if (i < cols && j < rows) {
      grid[i][j].bee = true;
    }
  });
  fixedBrickPositions.forEach(pos => {
    let i = pos[0], j = pos[1];
    if (i < cols && j < rows) {
      grid[i][j].fixedBrick = true;
    }
  });
  fixedPunchPositions.forEach(pos => {
    let i = pos[0], j = pos[1];
    if (i < cols && j < rows) {
      grid[i][j].fixedPunch = true;
    }
  });
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      grid[i][j].countBees();
    }
  }
}

// MOUSEP PRESS
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
  return false;
}


function draw() {
  background(255);
  if (showOrangeCircle) {
    fill(255, 165, 0, 150);
    ellipse(width / 2, height / 2, w * 2);
    orangeCircleTimer--;
    if (orangeCircleTimer <= 0) {
      showOrangeCircle = false;
    }
  }
  grid.forEach(row => row.forEach(cell => cell.show()));
}

// 2D ARRAY
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
