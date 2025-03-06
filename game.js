const gameContainer = document.getElementById("game-container");
const paddle = document.querySelector(".paddle");
const ball = document.querySelector(".ball");
const pauseMenu = document.querySelector(".pause-menu");
const scoreDisplay = document.getElementById("score");
const livesDisplay = document.getElementById("lives");

let ballX = 50,
  ballY = 50,
  ballDX = 1.5,
  ballDY = 1.5;
let paddleX = 250;
let isPaused = false;
let score = 0;
let lives = 3;
let gameState = "ready";
let ballStuckToPaddle = true;
let spaceEnabled = true;

// === function create bricks for the game ===
function createBricks() {
  const rows = 5;
  // === get the width size of the game container to use as the column size for responsiveness
  const game_width = document.getElementById("game-container");
  // const computed_style = getComputedStyle(game_width);
  // const col = computed_style.width;
  const colWidth = col.offsetWidth / 10;
  // const colWidth = col / 10;
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < colWidth; j++) {

      const brick = document.createElement("div");
      brick.classList.add("brick");
      brick.style.left = `${j * 55 + 10}px`;
      brick.style.top = `${i * 25 + 10}px`;
      gameContainer.appendChild(brick);
    }
  }
}
// === create bricks for the game ===
createBricks();

// === event listener to control the paddle movements ===
document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft" && paddleX > 0) {
    paddleX -= 40;
  } else if (e.key === "ArrowRight" && paddleX < 500) {
    paddleX += 40;
  } else if (e.code === "Space") {
    if (ballStuckToPaddle && gameState === "playing") {
      ballStuckToPaddle = false;
      ballDY = -3;
      ballDX = Math.random() * 2 - 1;
      spaceEnabled = false;
      document.querySelector(".pause-menu").classList.remove("visible");
    } else if (gameState === "playing") {
      gameState = "paused";
      showPauseMenu();
    } else if (gameState === "paused") {
      hidePauseMenu();
    }
  }
  if (e.code === "Escape" && !ballStuckToPaddle) {
    showPauseMenu();
  }
  paddle.style.left = `${paddleX}px`;
});

function togglePause() {
  isPaused = !isPaused;

  //   pauseMenu.classList.toggle("hidden", !isPaused);
  pauseMenu.style.display = "block";
  //   if (!isPaused) requestAnimationFrame(update);
}

function resumeGame() {
  togglePause();
}

function restartGame() {
  location.reload();
}

function update() {
  if (gameState === "paused") {
    requestAnimationFrame(update);
    return;
  }

  if (ballStuckToPaddle) {
    ballX = paddleX + 100 / 2 - 10 / 2;
    ballY = 380;
  } else {
    ballX += ballDX;
    ballY += ballDY;

    // Wall collisions
    if (ballX <= 0 || ballX >= 590) ballDX *= -1;
    if (ballY <= 0) ballDY *= -1;
    
    // Paddle collision
    if (ballY >= 380 && ballX >= paddleX && ballX <= paddleX + 100) {
      // Force the ball to always go upward after paddle hit
      ballDY = -Math.abs(ballDY);

      // Optionally adjust x direction based on where the ball hits the paddle
      let hitPoint = (ballX - paddleX) / 100;
      ballDX = 3 * (hitPoint - 0.5); // This gives a spread between -1.5 to 1.5
    }

    // Bottom collision (lose a life)
    if (ballY > 400) {
      lives--;
      livesDisplay.textContent = lives;
      if (lives === 0) {
        showGameOver();
      } else {
        resetBall();
      }
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

function resetBall() {
  ballX = paddleX + 100 / 2 - 10 / 2;
  ballY = 380;
  ballDX = 0;
  ballDY = 0;
  ballStuckToPaddle = true;
  spaceEnabled = true;
}

function resetGame() {
  lives = 3;
  score = 0;
  spaceEnabled = true;
  updateLives();
  updateScore();
  resetBall();
  paddleX = 250;
  paddle.style.left = `${paddleX}px`;
  gameState = "playing";
  const controlButtons = document.querySelector(".pause-menu");
  controlButtons.classList.remove("visible");
  requestAnimationFrame(update);
}

function updateScore() {
  document.getElementById("score").textContent = `Score: ${score}`;
}

document.addEventListener("DOMContentLoaded", () => {
  updateLives();
  requestAnimationFrame(update);
});

function showPauseMenu() {
  gameState = "paused";
  //   const continueButton = document.querySelector(".continueButton");
  //   const restartButton = document.querySelector(".restartButton");
  const menuText = document.querySelector(".pause-menu");
  const controlButtons = document.querySelector(".pause-menu");
  controlButtons.classList.add("visible");
  menuText.classList.add("show");
  //   setTimeout(() => {
  //     continueButton.classList.add("show");
  //     restartButton.classList.add("show");
  //   }, 100);
}

// === function to hide the pause menu ===
function hidePauseMenu() {
  const menuText = document.querySelector(".pause-menu");
  menuText.classList.remove("show");
  controlButtons.classList.remove("visible");

  // === set the game state to playing after the pause menu is hidden ===
  setTimeout(() => {
    gameState = "playing";
  }, 90);
}

// === function to show the game over menu ===
function showGameOver() {
  gameState = "over";
  const menuText = document.querySelector(".pause-menu");
  const controlButtons = document.querySelector(".pause-menu");
  menuText.textContent = `Game Over!\nFinal Score: ${score}`;
  controlButtons.classList.add("visible");
  menuText.classList.add("show");
  setTimeout(() => {
    restartButton.classList.add("show");
  }, 100);
}

// === function to start the game ===
function startGame() {
  resetGame();
  gameState = "playing";
  ballStuckToPaddle = true;
  animate();
}

// === function to animate the game ===
function animate() {
  if (gameState === "playing") {
    update();
  }
}

startGame();
