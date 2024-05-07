let grid;
let cols = 4;
let rows = 4;
const w = 100; 
let gameover = false;


const mines = [
  [0, 0], [0, 2], [0, 3], 
  [1, 1], [1, 3],
  [2, 0], [2, 2], [2, 3]
];


const mustReveal = [
  [0, 1], [1, 0], [1, 2], [2, 1]
];
let revealedCount = 0;  

function setup() {
  createCanvas(401, 401);
  grid = make2DArray(cols, rows);
 
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      grid[i][j] = new Cell(i, j, w);
     
      for (let mine of mines) {
        if (mine[0] === i && mine[1] === j) {
          grid[i][j].bee = true;
        }
      }
    }
  }
}

function draw() {
  background(255);
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      grid[i][j].show();
    }
  }
}

function mousePressed() {
  if (gameover) return;
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      if (grid[i][j].contains(mouseX, mouseY)) {
        if (grid[i][j].bee) {
          revealMines();
          gameover = true;
          displayMessage("Game Over!");
        } else {
          grid[i][j].reveal();
         
          if (checkMustReveal(i, j)) {
            revealedCount++;
            if (revealedCount === mustReveal.length) {
              gameover = true;
              displayMessage("YOU WIN&#129395	PLEASE TAKE A BRICK&#128512");
            }
          }
        }
        return;
      }
    }
  }
}


function revealMines() {
  for (let mine of mines) {
    grid[mine[0]][mine[1]].reveal();
  }
}


function make2DArray(cols, rows) {
  let arr = new Array(cols);
  for (let i = 0; i < cols; i++) {
    arr[i] = new Array(rows);
  }
  return arr;
}


class Cell {
  constructor(i, j, w) {
    this.i = i;
    this.j = j;
    this.x = i * w;
    this.y = j * w;
    this.w = w;
    this.bee = false;
    this.revealed = false;
  }

  show() {
    stroke(0);
    noFill();
    rect(this.x, this.y, this.w, this.w);
    if (this.revealed) {
      if (this.bee) {
        fill(127);
        ellipse(this.x + this.w * 0.5, this.y + this.w * 0.5, this.w * 0.5);
      } else {
        fill(255, 229, 204);
        rect(this.x, this.y, this.w, this.w);
      }
    }
  }

  contains(x, y) {
    return (x > this.x && x < this.x + this.w && y > this.y && y < this.y + this.w);
  }

  reveal() {
    this.revealed = true;
  }
}


function checkMustReveal(i, j) {
  return mustReveal.some(pos => pos[0] === i && pos[1] === j);
}


function displayMessage(message) {
  let status = document.getElementById('status');
  if (status) {
    status.innerHTML = message;
  } else {
    console.log("No status element found");
  }
}
