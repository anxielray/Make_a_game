document.addEventListener("DOMContentLoaded", function () {
  const game = document.getElementById("game");
  const gameWidth = game.clientWidth;
  const gameHeight = game.clientHeight;

  const paddleEl = document.getElementById("paddle");
  const ballEl = document.getElementById("ball");

  const paddle = {
    width: 75,
    height: 20,
    x: (gameWidth - 75) / 2,
    y: gameHeight - 20,
    element: paddleEl,
    move: function (direction) {
      const step = 7;
      if (direction === "left") {
        this.x = Math.max(0, this.x - step);
      } else if (direction === "right") {
        this.x = Math.min(gameWidth - this.width, this.x + step);
      }
      this.update();
    },
    update: function () {
      // update paddle position (bottom fixed with 0 offset)
      this.element.style.left = this.x + "px";
    },
  };
  paddle.update();

  const ball = {
    radius: 10,
    x: canvas.width / 2,
    y: canvas.height - 30,
    dx: 2,
    dy: -2,
    element: ballEl,
    update: function () {
      // position the ball using its center, adjusting for its radius
      this.element.style.left = this.x - this.radius + "px";
      this.element.style.top = this.y - this.radius + "px";
    },
  };
  ball.update();

  document.addEventListener("keydown", function (event) {
    if (event.key === "ArrowLeft") {
      paddle.move("left");
    } else if (event.key === "ArrowRight") {
      paddle.move("right");
    }
    update();
  });
  ball.update();

  let bricks = [];
  let bricksRowCount = 3;
  let bricksColumnCount = 4;
  let brickWidth = 75;
  let brickHeight = 20;
  let brickPadding = 10;
  let brickOffsetLeft = 20;
  let brickOffsetTop = 10;

  for (let i = 0; i < bricksColumnCount; i++) {
    bricks[i] = [];
    for (let j = 0; j < bricksRowCount; j++) {
      const brickX = i * (brickWidth + brickPadding) + brickOffsetLeft;
      const brickY = j * (brickHeight + brickPadding) + brickOffsetTop;
      const brickEl = document.createElement("div");
      brickEl.className = "brick";
      brickEl.style.left = brickX + "px";
      brickEl.style.top = brickY + "px";
      // Append brick to the game container
      game.appendChild(brickEl);
      bricks[i][j] = { x: brickX, y: brickY, status: 1, element: brickEl };
    }
  }

  // update();

  // gameloop logic
  function draw() {

    //update ball position
    ball.x += ball.dx;
    ball.y += ball.dy;

    //ball collision logic
    if (
      ball.x + ball.dx > canvas.width - ball.radius ||
      ball.x + ball.dx < ball.radius
    ) {
      ball.dx = -ball.dx;
    }
    if (ball.y + ball.dy < ball.radius) {
      ball.dy = -ball.dy;
    }
    if (ball.y + ball.dy > gameHeight - ball.radius) {
      if (ball.x > paddle.x && ball.x < paddle.x + paddle.width) {
        ball.dy = -ball.dy;
      } else {
        document.location.reload();
      }
    }
    brickCollision();
    ball.update();
    requestAnimationFrame(draw);
  }
  //brick collision logic
  function brickCollision() {
    for (let i = 0; i < bricksColumnCount; i++) {
      for (let j = 0; j < bricksRowCount; j++) {
        const b = bricks[i][j];
        if (b.status === 1) {
          if (
            ball.x > b.x &&
            ball.x < b.x + brickWidth &&
            ball.y > b.y &&
            ball.y < b.y + brickHeight
          ) {
            ball.dy = -ball.dy;
            b.status = 0;
            // Remove brick's element from DOM
            if (b.element && b.element.parentNode) {
              b.element.parentNode.removeChild(b.element);
            }
          }
        }
      }
    }
  }

  draw();
});
