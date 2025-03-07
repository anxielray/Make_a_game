// === get the game frame ===
const game_container = document.getElementById("game-container");

// === paddle ====
const paddle = document.querySelector(".paddle");

// === ball === 
const ball = document.querySelector(".ball");

// == pause menu ===
const pause_menu = document.querySelector(".pause-menu");

// == score display === 
const score_display = document.getElementById("score");

// === lives === 
const lives_display = document.getElementById("lives");


// ==== game initial status ===
let paddleX = (game_container.clientWidth / 2) - (paddle.clientWidth/2);
let ballX = (paddleX/2) - (ball.clientWidth/2),
  ballY = 450,
  ballDX = 1.5,
  ballDY = 1.5;
let not_paused = false;// meaning the game is paused
let score = 0;
let lives = 3;
let game_state = "ready";
let ball_stuck_to_paddle = true;
let space_enabled = true;

// === function create bricks for the game ===
function createBricks() {
  const rows = 6;
  const col = 13;
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < col; j++) {
      const brick = document.createElement("div");
      
      if (i > 0){
        
        brick.classList.add("brick");
        if (j === 0) {
          brick.style.left = `${j * 60 + 50}px`;
        }else if (j === col-1){
          
          brick.style.left = `${j * 60 - 40}px`;
        }else {
          brick.style.left = `${j * 70 - 16}px`;
        }
        brick.style.top = `${i * 45 + 10}px`;
      }

      brick.style.border = "1px s olid white";
      // brick.style.padding = "1px";
      game_container.appendChild(brick);
      game_container.style.alignItems = "center";
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
    if (ball_stuck_to_paddle) {
      // ==== start the game ===
      ball_stuck_to_paddle = false;
      ballDY = -3;
      ballDX = Math.random() * 2 - 1;
      space_enabled = false;
      document.querySelector(".pause-menu").classList.remove("visible");
    } else if (game_state === "playing") {
      game_state = "paused";
      showPauseMenu();
    } else if (game_state === "paused") {
      hidePauseMenu();
    }
  }
  if (e.code === "Escape" && !ball_stuck_to_paddle) {
    showPauseMenu();
  }
  paddle.style.left = `${paddleX}px`;
});

function togglePause() {
  not_paused = !not_paused;
  
  //   pauseMenu.classList.toggle("hidden", !not_paused);
  pause_menu.style.display = "block";
  //   if (!not_paused) requestAnimationFrame(update);
}

function resumeGame() {
  togglePause();
}


function update() {
  if (game_state === "paused") {
    requestAnimationFrame(update);
    return;
  }
  
  if (ball_stuck_to_paddle) {
    
    // ===== this will be the original x-coordinate of the ball ====
    ballX = (game_container.clientWidth / 2) - (ball.clientWidth/2);

    // ===== this will be the original y-coordinate of the ball ====
    ballY = 650;
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
      lives_display.textContent = lives;
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
      score_display.textContent = score;
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
  ballX = (paddleX/2)- (ball.clientWidth/2);
  ballY = 450;
  ballDX = 0;
  ballDY = 0;
  ball_stuck_to_paddle = true;
  space_enabled = true;
}

function resetGame() {
  lives = 3;
  score = 0;
  space_enabled = true;
  updateLives();
  updateScore();
  resetBall();
  paddleX = (game_container.clientWidth / 2) - (paddle.clientWidth/2);
  paddle.style.left = `${paddleX}px`;
  game_state = "playing";
  // const controlButtons = document.querySelector(".pause-menu");
  controlButtons.classList.remove("visible");
  requestAnimationFrame(update);
}
  function restartGame() { // == Reload the page to restart the game ===
    location.reload();
  }

function updateScore() {
  document.getElementById("score").textContent = `Score: ${score}`;
}

document.addEventListener("DOMContentLoaded", () => {
  updateLives();
  requestAnimationFrame(update);
});

function showPauseMenu() {
  game_state = "paused";
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
    game_state = "playing";
  }, 90);
}

// === function to show the game over menu ===
function showGameOver() {
  game_state = "over";
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
  game_state = "playing";
  ball_stuck_to_paddle = true;
  animate();
}

// === function to animate the game ===
function animate() {
  if (game_state === "playing") {
    update();
  }
}

startGame();
