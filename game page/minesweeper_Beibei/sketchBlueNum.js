let grid;
let cols;
let rows;
const w = 100;
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
    this.setColor();
  }
  //UNCOVERED GRID COLOURS
  setColor() {
    let r = floor(random(4)); 
    switch (r) {
      case 0:
        this.color = color(0, 0, 255); // Blue
        break;
      case 1:
        this.color = color(255, 0, 0); // Red
        break;
      case 2:
        this.color = color(0, 255, 0); // Green
        break;
      case 3:
        this.color = color(255, 255, 0); // Yellow
        break;
    }}
    //

  show() {
    stroke(255);
    if (this.revealed) {
      if (this.bee) {
        fill('white');
        ellipse(this.x + this.w * 0.5, this.y + this.w * 0.5, this.w * 0.5);
      } else if (this.fixedBrick) {
        fill('white');
        rect(this.x, this.y, this.w, this.w);
        if (showBlueBox) {

          fill('blue');
          textSize(20);
          textAlign(CENTER, CENTER);
          text("Give a\nbrick!", this.x + this.w / 2, this.y + this.w / 2);
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
          fill(0, 0, 255);
          textSize(16);
          noStroke();
          text(this.neighborCount, this.x + this.w * 0.5, this.y + this.w * 0.5);
        } 
      }
    } else {
      fill(this.color);
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
  createCanvas(2100, 2100);
  cols = 10;
  rows = 10; 
  grid = make2DArray(cols, rows);
  port = createSerial();
  let buttonDiv = createDiv('');
  buttonDiv.position(1100, 200);
  connectBtn = createButton('Connect to Arduino');
  connectBtn.parent(buttonDiv);
  connectBtn.mousePressed(connectBtnClick);

  //TEXT ABOVE BUTTON
  let title = createP('Let\'s sweep some mines!')
  title.parent(buttonDiv);
  title.style('font-size', '45px');
 title.style('font-family', 'Avenir');
 title.style('color', 'white');
  let infoText = createP('First,');
  infoText.parent(buttonDiv);
  infoText.style('font-size', '45px');
  infoText.style('font-family', 'Avenir');
  infoText.style('margin-bottom', '30px');
  infoText.style('color', 'white');
//
buttonDiv.child(title)
buttonDiv.child(infoText);
buttonDiv.child(connectBtn);

  // CONNECT BUTTON STYLING
  connectBtn.style('font-size', '25px');
  connectBtn.style('font-family', 'Avenir');
  connectBtn.style('padding', '30px 60px');
  connectBtn.style('border', 'none');
  connectBtn.style('border-radius', '25px'); 
  connectBtn.style('background', 'linear-gradient(45deg, #6fb1fc, #4364f7)'); // Gradient background
  connectBtn.style('color', 'white');
  connectBtn.style('cursor', 'pointer');
  connectBtn.style('transition', 'background 0.3s, transform 0.3s');
//

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
  background('black');

  // Draw the grid
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      grid[i][j].show();
    }
  }

  // GRID NUMBERS
  textSize(32);
  fill('yellow');
  noStroke();
  for (let i = 0; i < cols; i++) {
    let x = i * w + w / 2;
    let y = rows * w + 25; 
    textAlign(CENTER, CENTER);
    text(i + 1, x, y);
  }

  // GRID LETTERS
  textSize(32);
  fill('red');
  noStroke();
  for (let j = 0; j < rows; j++) {
    let x = cols * w + 25; 
    let y = j * w + w / 2;
    textAlign(CENTER, CENTER);
    text(String.fromCharCode(97 + j), x, y); 
  }

  // Draw the orange circle if needed
  if (showOrangeCircle) {
    fill(255, 165, 0, 150);
    ellipse(width / 2, height / 2, w * 2);
    orangeCircleTimer--;
    if (orangeCircleTimer <= 0) {
      showOrangeCircle = false;
    }
  }
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
