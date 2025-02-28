const gameContainer = document.getElementById("game-container");
const paddle = document.querySelector(".paddle");
const ball = document.querySelector(".ball");
const pauseMenu = document.getElementById("pause-menu");
const scoreDisplay = document.getElementById("score");
const livesDisplay = document.getElementById("lives");

let ballX = 295,
  ballY = 50,
  ballDX = 2,
  ballDY = 2;
let paddleX = 250;
let isPaused = false;
let score = 0;
let lives = 3;
let gameStarted = false;

// Create bricks
function createBricks() {
  const rows = 5,
    cols = 10;
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      const brick = document.createElement("div");
      brick.classList.add("brick");
      brick.style.left = `${j * 55 + 10}px`;
      brick.style.top = `${i * 25 + 10}px`;
      gameContainer.appendChild(brick);
    }
  }
}

createBricks();

// Paddle movement
document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft" && paddleX > 0) {
    paddleX -= 20;
    if (!gameStarted) {
      ballX = paddleX + 45;
    }
  } else if (e.key === "ArrowRight" && paddleX < 500) {
    paddleX += 20;
    if (!gameStarted) {
      ballX = paddleX + 45;
    }
  } else if (e.key === "p") {
    togglePause();
  } else if (e.key === " " && !gameStarted) {
    gameStarted = true;
    ballDY = -2;
  }
  paddle.style.left = `${paddleX}px`;
});

function togglePause() {
  isPaused = !isPaused;
  pauseMenu.classList.toggle("hidden", !isPaused);
  if (!isPaused) requestAnimationFrame(update);
}

function resumeGame() {
  togglePause();
}

function restartGame() {
  location.reload();
}

function update() {
  if (isPaused) return;

  if (!gameStarted) {
    ballY = 380;
    ballX = paddleX + 45;
    ball.style.left = `${ballX}px`;
    ball.style.top = `${ballY}px`;
    requestAnimationFrame(update);
    return;
  }

  ballX += ballDX;
  ballY += ballDY;

  // Wall collisions
  if (ballX <= 0 || ballX >= 590) ballDX *= -1;
  if (ballY <= 0) ballDY *= -1;

  // Paddle collision
  if (ballY >= 380 && ballX >= paddleX && ballX <= paddleX + 100) {
    ballDY = -Math.abs(ballDY);
    let hitPoint = (ballX - paddleX) / 100;
    ballDX = 5 * (hitPoint - 0.5);
  }

  // Bottom collision (lose a life)
  if (ballY > 400) {
    lives--;
    livesDisplay.textContent = lives;
    if (lives === 0) {
      alert("Game Over!");
      restartGame();
    } else {
      gameStarted = false;
      ballX = paddleX + 45;
      ballY = 380;
      ballDX = 2;
      ballDY = 2;
    }
  }

  // Brick collision
  document.querySelectorAll(".brick").forEach((brick) => {
    const brickRect = brick.getBoundingClientRect();
    const ballRect = ball.getBoundingClientRect();

    if (
      ballRect.left < brickRect.right &&
      ballRect.right > brickRect.left &&
      ballRect.top < brickRect.bottom &&
      ballRect.bottom > brickRect.top
    ) {
      brick.remove();
      ballDY *= -1;
      score += 10;
      scoreDisplay.textContent = score;
    }
  });

  ball.style.left = `${ballX}px`;
  ball.style.top = `${ballY}px`;

  requestAnimationFrame(update);
}

function updateLives() {
  const hearts = document.querySelectorAll(".heart");
  for (let i = 0; i < hearts.length; i++) {
    if (i < lives) {
      hearts[i].classList.remove("lost");
    } else {
      hearts[i].classList.add("lost");
    }
  }
}

function loseLife() {
  lives--;
  updateLives();
  if (lives === 0) {
    alert("Game Over!");
    restartGame();
  } else {
    gameStarted = false;
    ballX = paddleX + 45;
    ballY = 380;
    ballDX = 2;
    ballDY = 2;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  updateLives();
  requestAnimationFrame(update);
});

requestAnimationFrame(update); 