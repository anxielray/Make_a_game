const ball = document.querySelector(".ball");
const paddle = document.querySelector(".paddle");
const score_display = document.getElementById("score");
const lives_display = document.getElementById("lives");
const pause_menu = document.querySelector(".pause-menu");
const ctn_btn = document.getElementById("continue_button");
const game_container = document.getElementById("game-container");

// ==== game initial status ===
let paddle_x = game_container.clientWidth / 2 - paddle.clientWidth / 2;
let ball_x = paddle_x / 2 - ball.clientWidth / 2,
  ball_y = 650,
  ballDX = 1.5,
  ballDY = 1.5;
let not_paused = false; // meaning the game is paused
let score = 0;
let start_lives = 3;
let game_state = "ready";
let ball_stuck_to_paddle = true;
let space_enabled = true;

// === function create bricks for the game ===
function create_bricks() {
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

// // === event listener to control the paddle movements ===
document.addEventListener("keydown", (e) => {
  const furthest_x_paddle = paddle_x + 200;
  if (e.key === "ArrowLeft" && paddle_x > 0) {
    //&& game_state === "playing") {
    if (paddle_x - 40 <= game_container.clientLeft) {
      paddle.style.left = `${game_container.clientLeft}px`;
    } else {
      paddle_x -= 40;
    }
  } else if (e.key === "ArrowRight" && paddle_x < 800) {
    //&& game_state === "playing") {
    if (
      furthest_x_paddle + 40 >=
      game_container.clientLeft + game_container.clientWidth
    ) {
      paddle.style.left =
        game_container.clientLeft + game_container.clientWidth;
    } else {
      paddle_x += 40;
    }
  } else if (e.code === "Space") {
    if (ball_stuck_to_paddle && game_state === "playing") {
      ball_stuck_to_paddle = false;
      ballDY = -3;
      ballDX = Math.random() * 2 - 1;
      space_enabled = false;
    } else if (game_state === "playing") {
      game_state = "paused";
      pause_game();
    } else if (game_state === "paused") {
      resume_game();
    }
  }

  if (e.code === "Escape" && !ball_stuck_to_paddle) {
    game_state = "paused";
    pause_game();
  }
  paddle.style.left = `${paddle_x}px`;
});

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
  // if (game_state !== "over") {
  if (game_state === "paused") {
    requestAnimationFrame(update); // === request for the animation frames recursivelly, this causes a pause-like effect ===
    return;
  }

  if (ball_stuck_to_paddle) {
    ball_x = game_container.clientWidth / 2 - ball.clientWidth / 2;
    ball_y = 650;
  } else {
    ball_x += ballDX;
    ball_y += ballDY;

    // == ball and Wall collisions ===
    if (
      ball_x <= 0 ||
      ball_x >= game_container.clientWidth + game_container.clientLeft
    )
      ballDX *= -1;
    if (ball_y <= 0) ballDY *= -1;

    // === simulate vertical ball bouncing off the paddle on collision ===
    if (ball_y >= 650 && ball_x >= paddle_x && ball_x <= paddle_x + 200) {
      ballDY = -Math.abs(ballDY);

      // === simulate horizontal ball bouncing off the paddle on collision ===
      let hitPoint = (ball_x - paddle_x) / 200;
      ballDX = 3 * (hitPoint - 0.5); // This gives a spread between -1.5 to 1.5
    }

    // Bottom collision (lose a life)
    if (ball_y > 650) {
      lives--;
      if (lives === 0) {
        game_over();
        return;
      } else {
        reset_ball();
        update_lives(3 - lives);
      }
    }
  }

  // Brick collision
  document.querySelectorAll(".brick").forEach((brick) => {
    const brick_rect = brick.getBoundingClientRect();
    const ball_rect = ball.getBoundingClientRect();

    if (
      ball_rect.left < brick_rect.right &&
      ball_rect.right > brick_rect.left &&
      ball_rect.top < brick_rect.bottom &&
      ball_rect.bottom > brick_rect.top
    ) {
      brick.remove();
      ballDY *= -1;
      score += 10;
      score_display.textContent = score;
    }
  });

  ball.style.left = `${ball_x}px`;
  ball.style.top = `${ball_y}px`;
  requestAnimationFrame(update);
}

function update_lives(lost_lives) {
  const hearts = document.querySelectorAll(".heart");
  if (lost_lives === 0) {
    return;
  } else if (lost_lives === 3) {
    game_over(); 
    return;
  }
  for (let i = 0; i < lost_lives; i++) {
    hearts[i].classList.add("lost");
  }
}

function reset_ball() {
  ball.style.left = `${
    game_container.clientWidth / 2 - ball.clientWidth / 2
  }px`;
  ball_y = 650;
  ballDX = 0;
  ballDY = 0;
  ball_stuck_to_paddle = true;
  space_enabled = true;
}

// === This function will reset the ball to the original position ===
function reset_game() {
  lives = 3;
  const lost_lives = start_lives - lives;
  score = 0;
  space_enabled = true;
  update_lives(lost_lives);
  updateScore();
  reset_ball();
  paddle_x = game_container.clientWidth / 2 - paddle.clientWidth / 2;
  paddle.style.left = `${paddle_x}px`;
  game_state = "playing";
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

// === function to show the game over menu ===
function game_over() {
  game_state = "over";
  pause_menu.classList.add("visible");
  ctn_btn.classList.remove("show");
}

// === function to start the game ===
function start_game() {
  reset_game();
  game_state = "playing";
  ball_stuck_to_paddle = true;
  animate();
}

// === This is a function to animate the game ===
function animate() {
  if (game_state === "playing") {
    update();
  }
}

document.addEventListener("DOMContentLoaded", () => {
  // === Create the bricks for the game ===
  create_bricks();

  // === start the game ===
  start_game();
  update_lives(0);
  requestAnimationFrame(update);
});
