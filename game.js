// === get the game frame ===
const game_container = document.getElementById("game-container");
game_container.style.borderInlineColor = "brown";

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
let paddle_x = (game_container.clientWidth / 2) - (paddle.clientWidth / 2);
let ball_x = (paddle_x / 2) - (ball.clientWidth / 2),
  ballY = 650,
  ballDX = 1.5,
  ballDY = 1.5;
let not_paused = false; // meaning the game is paused
let score = 0;
let start_lives = 3;
let game_state = "ready";
let ball_stuck_to_paddle = true;
let space_enabled = true;

// === function create bricks for the game ===
function createBricks() {
  const rows = 6;
  const col = 13;
  for (let i = 1; i < rows; i++) {
    for (let j = 1; j < col - 1; j++) {
      const brick = document.createElement("div");

      if (i > 0) {
        brick.classList.add("brick");
        if (j === 0) {
          brick.style.left = `${j * 60 + 50}px`;
        } else if (j === col - 1) {
          brick.style.left = `${j * 60 - 40}px`;
        } else {
          brick.style.left = `${j * 70 - 16}px`;
        }
        brick.style.top = `${i * 45 + 10}px`;
      }

      brick.style.border = "1px solid white";
      // brick.style.padding = "1px";
      game_container.appendChild(brick);
      game_container.style.alignItems = "center";
    }
  }
}
// === create bricks for the game ===
createBricks();

// // === event listener to control the paddle movements ===
document.addEventListener("keydown", (e) => {
  // === enable movement keys only when the game is on ===
  // === event for any key down ====
  // === event for direction keys ==
  if (e.key === "ArrowLeft" && game_state === "playing") {
    paddle_x -= 40;
  } else if (e.key === "ArrowRight" && game_state === "playing") {
    paddle_x += 40;
    // === event for space key ===
    // === event for pausing and resuming game ====
  } else if (e.key === "Space" && game_state === "playing") {
    pause_game();
    // call the function to pause the game and display the pause menu
    // === event for starting the game ===
  } else if ((e.key === "Space" || e.key === "p") && game_state === "paused") {
    resume_game();
  } else if (e.key === "Space" && game_state === "ready") {
    // == call the function to start the game ====
    start_game();
    // === event for the escape key ===
  } else if (e.key === "Escape" && game_state === "paused") {
    //call the function to hide the pause menu
  }
});

// document.addEventListener("keydown", (e) => {
//  else if (e.code === "Space") {
//     if (ball_stuck_to_paddle) {
//       // ==== start the game ===
//       ball_stuck_to_paddle = false; function to  start the game should do this not the event listener
//       ballDY = -3;
//       ballDX = Math.random() * 2 - 1;
//       space_enabled = false;
//       document.querySelector(".pause-menu").classList.remove("visible");
//     } else if (game_state === "playing") {
//       game_state = "paused";
//       showPauseMenu();
//     } else if (game_state === "paused") {
//       hidePauseMenu();
//     }
//   }
//   if (e.code === "Escape" && !ball_stuck_to_paddle) {
//     showPauseMenu();
//   }
//   paddle.style.left = `${paddleX}px`;
// });

// function togglePause() {
//   not_paused = !not_paused;

//   pauseMenu.classList.toggle("hidden", !not_paused);
// pause_menu.style.display = "block";
//   if (!not_paused) requestAnimationFrame(update);
// }

// ==== This is a function to pause the game ====
function pause_game() {
  show_pause_menu();
}

// ==== This is a function to pause the game and display the pause menu ===
function show_pause_menu() {
  game_state = "paused";
  pause_menu.classList.replace("hidden", "visible");
}

// ==== This is a function to resume the game from the pause menu ===
function resume_game() {
  game_state = "playing";
  hide_pause_menu();
}

// === function to hide the pause menu and resume the game ===
function hide_pause_menu() {
  pause_menu.classList.replace("visible", "hidden");
}

function update() {
  if (game_state === "paused") {
    requestAnimationFrame(update);
    return;
  }

  if (ball_stuck_to_paddle) {
    // ===== this will be the original x-coordinate of the ball ====
    ball_x = (paddle_x.clientWidth / 2) - (ball.clientWidth / 2);

    // ===== this will be the original y-coordinate of the ball ====
    ballY = 650;
  } else {
    ball_x += ballDX;
    ballY += ballDY;

    // Wall collisions
    if (ball_x <= 0 || ball_x >= 590) ballDX *= -1;
    if (ballY <= 0) ballDY *= -1;

    // Paddle collision
    if (ballY >= 380 && ball_x >= paddle_x && ball_x <= paddle_x + 100) {
      // Force the ball to always go upward after paddle hit
      ballDY = -Math.abs(ballDY);

      // Optionally adjust x direction based on where the ball hits the paddle
      let hitPoint = (ball_x - paddle_x) / 100;
      ballDX = 3 * (hitPoint - 0.5); // This gives a spread between -1.5 to 1.5
    }

    // Bottom collision (lose a life)
    if (ballY > 400) {
      lives--;
      lives_display.textContent = lives;
      if (lives === 0) {
        showGameOver();
      } else {
        reset_ball();
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

  ball.style.left = `${ball_x}px`;
  ball.style.top = `${ballY}px`;

  requestAnimationFrame(update);
}

function updateLives(lost_lives) {
  const hearts = document.querySelectorAll(".heart");
  if (lost_lives === 0) {
    return;
  }
  for (let i = 0; i < lost_lives; i++) {
      hearts[i].classList.remove("lost");
  }
}

function reset_ball() {
  ball.style.left = `${(game_container.clientWidth / 2) - (ball.clientWidth / 2)}px`;
  ballY = 650;
  ballDX = 1.5;
  ballDY = 1.5;
  ball_stuck_to_paddle = true;
  space_enabled = true;
}

function reset_game() {
  lives = 3;
  const lost_lives = start_lives - lives;
  score = 0;
  space_enabled = true;
  updateLives(lost_lives);
  updateScore();
  reset_ball();
  paddle_x = (game_container.clientWidth / 2) - (paddle.clientWidth / 2);
  paddle.style.left = `${paddle_x}px`;
  pause_menu.classList.replace("visible", "hidden");
  requestAnimationFrame(update);
}

// == Reload the page to restart the game ===
function restart_game() {
  location.reload();
  start_game();
}

function updateScore() {
  document.getElementById("score").textContent = `Score: ${score}`;
}

document.addEventListener("DOMContentLoaded", () => {
  updateLives();
  requestAnimationFrame(update);
});

// === function to show the game over menu ===
function showGameOver() {
  game_state = "over";
  // const menuText = document.querySelector(".pause-menu");
  // const pause_menu = document.querySelector(".pause-menu");
  menuText.textContent = `Game Over!\nFinal Score: ${score}`;
  pause_menu.classList.add("visible");
  menuText.classList.add("show");
  setTimeout(() => {
    restartButton.classList.add("show");
  }, 100);
}

// === function to start the game ===
function start_game() {
  reset_game();
  game_state = "ready";
  ball_stuck_to_paddle = true;
  animate();
}

// === function to animate the game ===
function animate() {
  if (game_state === "playing") {
    update();
  }
}

start_game();
