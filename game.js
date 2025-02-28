const canvas = document.getElementById("game_canvas");
const context = canvas.getContext("2d");

canvas.width = 400;
canvas.height = 240;

const paddle = {
  width: 75,
  height: 20,
  color: "#ff0000",
  x: (canvas.width - 75) / 2,
  draw: function () {
    context.fillStyle = this.color;
    context.fillRect(
      this.x,
      canvas.height - this.height,
      this.width,
      this.height
    );
  },
  move: function (direction) {
    const step = 7;
    if (direction === "left" && this.x > 0) {
      this.x -= step;
    } else if (direction === "right" && this.x < canvas.width - this.width) {
      this.x += step;
    }
  },
};

const ball = {
  radius: 10,
  x: canvas.width / 2,
  y: canvas.height - 30,
  dx: 2,
  dy: -2,
  color: "#0000ff",
  draw: function () {
    context.beginPath();
    context.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    context.fillStyle = this.color;
    context.fill();
    context.closePath();
  },
};
function clearCanvas() {
  context.clearRect(0, 0, canvas.width, canvas.height);
}
function update() {
  clearCanvas();
  paddle.draw();
  ball.draw();
  drawBricks();
}

document.addEventListener("keydown", function (event) {
  if (event.key === "ArrowLeft") {
    paddle.move("left");
  } else if (event.key === "ArrowRight") {
    paddle.move("right");
  }
  update();
});

let bricks = [];
let bricksRowCount = 5;
let bricksColumnCount = 4;
let brickWidth = 75;
let brickHeight = 20;
let brickPadding = 10;
let brickOffsetLeft = 20;
let brickOffsetTop = 10;

for (let i = 0; i < bricksColumnCount; i++) {
  bricks[i] = [];
  for (let j = 0; j < bricksRowCount; j++) {
    bricks[i][j] = { x: 0, y: 0, status: 1 };
  }
}

//bricks drawing logic
function drawBricks() {
  for (let i = 0; i < bricksColumnCount; i++) {
    for (let j = 0; j < bricksRowCount; j++) {
      if (bricks[i][j].status === 1) {
        const brickX = (i * (brickWidth + brickPadding)) + brickOffsetLeft;
        const brickY = (j * (brickHeight + brickPadding)) + brickOffsetTop;
        bricks[i][j].x = brickX;
        bricks[i][j].y = brickY;
        context.beginPath();
        context.rect(brickX, brickY, brickWidth, brickHeight);
        context.fillStyle = "#008000";
        context.fill();
        context.closePath();
      }
    }
  }
}

// update();

// gameloop logic
function draw(){
    clearCanvas();
    ball.draw();
    paddle.draw();
    drawBricks();

    //update ball position
    ball.x+=ball.dx;
    ball.y+=ball.dy;

    //collision logic
    if (ball.x+ball.dx>canvas.width-ball.radius||ball.x+ball.dx<ball.radius){
        ball.dx=-ball.dx;
    }
    if (ball.y+ball.dy<ball.radius){
        ball.dy=-ball.dy;
    }
    if (ball.y+ball.dy>canvas.height-ball.radius){
        if(ball.x>paddle.x&&ball.x<paddle.x+paddle.width){
            ball.dy=-ball.dy;
        }else{
            document.location.reload();
        }
    }
    requestAnimationFrame(draw)
}
draw();