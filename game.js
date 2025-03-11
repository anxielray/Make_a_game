const ball = document.querySelector(".ball");
const paddle = document.querySelector(".paddle");
const lives_display = document.getElementById("lives");
const score_display = document.getElementById("score");
const pause_menu = document.querySelector(".pause-menu");
const start_menu = document.getElementById("start-menu");
const ctn_btn = document.getElementById("continue_button");
const game_container = document.getElementById("game-container");
const new_game_button = document.getElementById("new-game-button");
const score_container = document.getElementById("score-container");
const instructions_container = document.querySelector(".instructions");

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
arrow_controls = false;
let ball_stuck_to_paddle = true;
let space_enabled = true;
let gameTimer = 0;
let timerInterval;


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

function create_bricks_level2() {
  // Clear any existing bricks first
  const existingBricks = document.querySelectorAll(".brick");
  existingBricks.forEach((brick) => brick.remove());

  const brickWidth = 60;
  const brickHeight = 30;
  const spacing = 10;

  // For a true hourglass shape
  const maxRows = 11; // Odd number works best for symmetry
  const maxBricksInRow = 15; // Maximum bricks in the top and bottom rows

  // Calculate starting position to center the pattern
  const startX =
    (game_container.clientWidth - maxBricksInRow * (brickWidth + spacing)) / 2;
  let currentY = 50; // Starting Y position

  // Create hourglass pattern
  for (let row = 0; row < maxRows; row++) {
    // Calculate how many bricks should be in this row
    // For hourglass: start with max, decrease to min at middle, then increase back to max
    const middleRow = Math.floor(maxRows / 2);
    let bricksInThisRow;

    if (row <= middleRow) {
      // Top half of hourglass (including middle) - decreasing width
      bricksInThisRow = maxBricksInRow - row * 2;
    } else {
      // Bottom half of hourglass - increasing width
      bricksInThisRow = maxBricksInRow - (maxRows - row - 1) * 2;
    }

    // Calculate starting X position for this row to center it
    const rowStartX =
      startX +
      ((maxBricksInRow - bricksInThisRow) * (brickWidth + spacing)) / 2;

    // Create bricks for this row
    for (let col = 0; col < bricksInThisRow; col++) {
      const brick = document.createElement("div");
      brick.classList.add("brick");
      brick.hit = false;
      brick.dataset.health = 1; //set default health

      // Position the brick
      brick.style.left = `${rowStartX + col * (brickWidth + spacing)}px`;
      brick.style.top = `${currentY}px`;
      brick.style.width = `${brickWidth}px`;
      brick.style.height = `${brickHeight}px`;

      // Add some visual interest with different colors based on position
      const colorIndex = (row + col) % 5;
      const colors = ["#ff0000", "#33FF57", "#3357FF", "#F3FF33", "#FF33F3"];
      brick.style.backgroundColor = colors[colorIndex];
      if (colorIndex === 0) {
        brick.dataset.health = 3;
      }
      brick.style.border = "1px solid white";

      game_container.appendChild(brick);
    }

    // Move to the next row
    currentY += brickHeight + spacing;
  }
}
// // === event listener to control the paddle movements ===
document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft" && paddle_x > 0 && arrow_controls) {
    paddle_x -= Math.min(40, paddle_x); // Move left but stay in bounds
  } else if (e.key === "ArrowRight" && arrow_controls) {
    let max_x = game_container.clientWidth - paddle.clientWidth;
    paddle_x += Math.min(40, max_x - paddle_x); // Move right but stay in bounds
  } else if (e.code === "Space" || e.key === "p") {
    if (ball_stuck_to_paddle && game_state === "playing") {
      arrow_controls = true;
      ball_stuck_to_paddle = false;
      ballDY = -3;
      ballDX = -ballDX;
    } else if (game_state === "playing") {
      game_state = "paused";
      arrow_controls = false;
      pause_game();
    } else if (game_state === "paused") {
      arrow_controls = true;
      resume_game();
    }
  } else if (e.code === "Space" || e.key === "p") {
    if (ball_stuck_to_paddle && game_state === "playing") {
      arrow_controls = true;
      ball_stuck_to_paddle = false;
      ballDY = -3;
      ballDX = Math.random() * 2 - 1;
      space_enabled = false;
    } else if (game_state === "playing") {
      game_state = "paused";
      arrow_controls = false;
      pause_game();
    } else if (game_state === "paused") {
      arrow_controls = true;
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
  arrow_controls = false;
  pause_menu.classList.replace("hidden", "visible");
}

// ==== This is a function to resume the game from the pause menu ===
function resume_game() {
  game_state = "playing";
  arrow_controls = true;
  hide_pause_menu();
}

// === function to hide the pause menu and resume the game ===
function hide_pause_menu() {
  pause_menu.classList.replace("visible", "hidden");
}

function update() {
  if (game_state === "paused") {
    arrow_controls = false;
    requestAnimationFrame(update);
    return;
  }

  if (ball_stuck_to_paddle) {
    ball_x = paddle_x + paddle.clientWidth / 2 - ball.clientWidth / 2;
    ball_y = 650;
  } else {
    ball_x += ballDX;
    ball_y += ballDY;

    handleWallCollision();
    handlePaddleCollision();
    handleBrickCollision();
  }

  // Update ball position
  ball.style.left = `${ball_x}px`;
  ball.style.top = `${ball_y}px`;
  requestAnimationFrame(update);
}

function handleWallCollision() {
  if (ball_x <= 0 || ball_x >= game_container.clientWidth - ball.clientWidth) {
    ballDX *= -1;
  }
  if (ball_y <= 0) {
    ballDY *= -1;
  }
}

function handlePaddleCollision() {
  if (
    ball_y >= 650 &&
    ball_x >= paddle_x &&
    ball_x <= paddle_x + paddle.clientWidth
  ) {
    ballDY = -Math.abs(ballDY);
    let hitPoint = (ball_x - paddle_x) / paddle.clientWidth;
    ballDX = 3 * (hitPoint - 0.5);
  }

  if (ball_y >= game_container.clientHeight) {
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

function handleBrickCollision() {
  let bricks = document.querySelectorAll(".brick");
  let ball_rect = ball.getBoundingClientRect();

  for (let brick of bricks) {
    let brick_rect = brick.getBoundingClientRect();

    if (
      ball_rect.left < brick_rect.right &&
      ball_rect.right > brick_rect.left &&
      ball_rect.top < brick_rect.bottom &&
      ball_rect.bottom > brick_rect.top
    ) {
      // Check if the brick is on cooldown
      if (brick.dataset.cooldown) {
        continue; // Skip this brick if it's on cooldown
      }

      
      // Decrease brick health
      let health = parseInt(brick.dataset.health||1, 10);
      console.log(health)
      health--;

      if (health <= 0) {
        // Remove brick if health is zero
        brick.remove();
      } else {
        // Update brick appearance based on remaining health
        brick.dataset.health = health;
        if (health === 2) {
          brick.style.opacity = 0.5;
        } else if (health === 1) {
          brick.style.opacity = 0.2;
        }
      }

      // Reverse ball direction
      ballDY = -ballDY;

      // Update score
      score += 10;
      score_display.textContent = score;

       // Set a cooldown for the brick
       brick.dataset.cooldown = true;
       setTimeout(() => {
         delete brick.dataset.cooldown;
       }, 100); // Cooldown period in milliseconds

       // Check if level is complete
      checkLevelCompletion();
      // Exit loop after handling collision
      break;
    }
  }
}

function update_lives(lost_lives) {
  const hearts = document.querySelectorAll(".heart");
  if (lost_lives === 0 || !lost_lives) {
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
  reset_ball_paddle();
  lives = 3;
  const lost_lives = start_lives - lives;
  score = 0;
  space_enabled = true;
  update_lives(lost_lives);
  updateScore();
  game_state = "playing";
  arrow_controls = true;
  pause_menu.classList.replace("visible", "hidden");
  requestAnimationFrame(update);
}

// ===( Reset ball and paddle will reset the paddle and the ball on the starting position )=====
function reset_ball_paddle() {
  paddle_x = game_container.clientWidth / 2 - paddle.clientWidth / 2;
  paddle.style.left = `${paddle_x}px`;
  reset_ball();
}

function updateScore() {
  document.getElementById("score").textContent = `Score: ${score}`;
}

// === function to start the game ===
function start_game() {
  reset_game();
  game_state = "playing";
  arrow_controls - true;
  ball_stuck_to_paddle = true;
  animate();
  gameTimer = 0;
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    if (game_state === "playing") {
      gameTimer++;
      updateTimer();
    }
  }, 1000);
}

// === This is a function to animate the game ===
function animate() {
  if (game_state === "playing" && arrow_controls) {
    update();
  }
}

// === startmenu===
new_game_button.addEventListener("click", () => {
  playerName = prompt("Enter your name:");
  if (!playerName) {
    alert("Name is required to start the game.");
    return;
  }
  start_menu.classList.add("hidden");
  game_container.style.display = `block`;
  score_container.style.display = `block`;
  instructions_container.style.display = `block`;
  create_bricks();
  update_lives();
  requestAnimationFrame(update);
  startCountdown();
});

// === CountDown ===
function startCountdown() {
  let countdown = 3;
  const countdownOverlay = document.createElement("div");
  countdownOverlay.style.position = "absolute";
  countdownOverlay.style.top = "0";
  countdownOverlay.style.left = "0";
  countdownOverlay.style.width = "100%";
  countdownOverlay.style.height = "100%";
  countdownOverlay.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
  countdownOverlay.style.color = "white";
  countdownOverlay.style.fontSize = "48px";
  countdownOverlay.style.display = "flex";
  countdownOverlay.style.justifyContent = "center";
  countdownOverlay.style.alignItems = "center";
  countdownOverlay.style.zIndex = "1000";
  document.body.appendChild(countdownOverlay);

  const countdownInterval = setInterval(() => {
    countdownOverlay.textContent = countdown;
    countdown--;

    if (countdown < 0) {
      clearInterval(countdownInterval);
      document.body.removeChild(countdownOverlay);
      start_game(); // Start the game after the countdown
    }
  }, 900);
}

function startMenu() {
  clearAllOverlays();
  arrow_controls = false;
  start_menu.classList.remove("hidden");
  game_container.style.display = `none`;
  score_container.style.display = `none`;
  instructions_container.style.display = `none`;
}
// Add a new function to check if all bricks are cleared
function checkLevelCompletion() {
  const bricks = document.querySelectorAll(".brick");
  if (bricks.length === 0) {
    // All bricks are cleared, move to the next level
    transitionToLevel2();
  }
}

// Function to transition to level 2
function transitionToLevel2() {
  alert("Level 1 Complete! Moving to Level 2...");
  reset_ball_paddle();
  create_bricks_level2();
  game_state = "playing";
  requestAnimationFrame(update);
}

// === function to show the game over menu ===
function game_over() {
  clearAllOverlays();
  start_menu.classList.add("hidden");
  game_container.style.display = "none";
  score_container.style.display = "block";
  instructions_container.style.display = "none";
  game_state = "over";
  arrow_controls = false;

  let scores = JSON.parse(localStorage.getItem("scores")) || [];
  scores.push({
    name: playerName,
    score: score,
    time: gameTimer,
    livesRemaining: lives,
  });
  localStorage.setItem("scores", JSON.stringify(scores));

  const scorelist = document.getElementById("score-list");
  scorelist.innerHTML = `
        <h2>Game Over, ${playerName}!</h2>
        <div class="game-stats">
            <p>Final Score: ${score}</p>
            <p>Time Played: ${Math.floor(gameTimer / 60)}m ${
    gameTimer % 60
  }s</p>
            <p>Bricks Destroyed: ${score / 10}</p>
        </div>
        <div class="leaderboard-container">
            <h3>High Scores</h3>
            <table class="leaderboard-table">
                <thead>
                    <tr>
                        <th>Rank</th>
                        <th>Player</th>
                        <th>Score</th>
                        <th>Time</th>
                        <th>Lives</th>
                    </tr>
                </thead>
                <tbody>
                    ${generateLeaderboardRows(scores)}
                </tbody>
            </table>
        </div>
        <div class="game-controls">
            <button class="game-button" onclick="location.reload()">Play Again</button>
        </div>
    `;
}

function generateLeaderboardRows(scores) {
  return scores
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (b.time !== a.time) return a.time - b.time;
      return b.livesRemaining - a.livesRemaining;
    })
    .slice(0, 5)
    .map(
      (entry, index) => `
            <tr class="${index === 0 ? "gold-rank" : ""}">
                <td>${index + 1}</td>
                <td>${entry.name}</td>
                <td>${entry.score}</td>
                <td>${Math.floor(entry.time / 60)}m ${entry.time % 60}s</td>
                <td>${entry.livesRemaining}</td>
            </tr>
        `
    )
    .join("");
}

function showVictoryScreen() {
  clearAllOverlays();
  game_state = "victory";
  arrow_controls = false;

  const victoryOverlay = document.createElement("div");
  victoryOverlay.className = "victory-overlay";

  // Create confetti
  for (let i = 0; i < 100; i++) {
    createConfetti(victoryOverlay);
  }

  let scores = JSON.parse(localStorage.getItem("scores")) || [];
  scores.push({
    name: playerName,
    score: score,
    time: gameTimer,
    livesRemaining: lives,
  });
  localStorage.setItem("scores", JSON.stringify(scores));

  victoryOverlay.innerHTML += `
        <div class="victory-content">
            <h1>🎉 Congratulations ${playerName}! 🎉</h1>
            <div class="victory-stats">
                <p>You completed the game in ${Math.floor(gameTimer / 60)}m ${
    gameTimer % 60
  }s</p>
                <p>Final Score: ${score}</p>
                <p>Lives Remaining: ${lives}</p>
            </div>
            <div class="victory-buttons">
                <button class="game-button" onclick="showLeaderboard()">View Leaderboard</button>
                <button class="game-button" onclick="location.reload()">Play Again</button>
            </div>
        </div>
    `;

  document.body.appendChild(victoryOverlay);
}

function showLeaderboard() {
  clearAllOverlays();
  const leaderboardOverlay = document.createElement("div");
  leaderboardOverlay.className = "leaderboard-overlay";

  const scores = JSON.parse(localStorage.getItem("scores")) || [];

  leaderboardOverlay.innerHTML = `
        <div class="leaderboard-content">
            <h2>Leaderboard</h2>
            <table class="leaderboard-table">
                <thead>
                    <tr>
                        <th>Rank</th>
                        <th>Player</th>
                        <th>Score</th>
                        <th>Time</th>
                        <th>Lives</th>
                    </tr>
                </thead>
                <tbody>
                    ${generateLeaderboardRows(scores)}
                </tbody>
            </table>
            <button class="game-button" onclick="this.parentElement.parentElement.remove(); victoryOverlay.show()">Close</button>
        </div>
    `;

  document.body.appendChild(leaderboardOverlay);
}

function clearAllOverlays() {
  const overlays = document.querySelectorAll(
    ".victory-overlay, .leaderboard-overlay"
  );
  overlays.forEach((overlay) => overlay.classList.add("hidden"));
}

function restartGame() {
  clearAllOverlays();
  // Clear all bricks
  const bricks = document.querySelectorAll(".brick");
  bricks.forEach((brick) => brick.classList.add("hidden"));
  create_bricks();
  reset_game();
  // Start countdown
  startCountdown();
}

document.addEventListener("DOMContentLoaded", startMenu);

// Keep this cleaner version at the end of the file and update it
function updateTimer() {
  const minutes = Math.floor(gameTimer / 60);
  const seconds = gameTimer % 60;
  document.getElementById("timer").textContent = `${minutes
    .toString()
    .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}

function createConfetti(parent) {
  const confetti = document.createElement("div");
  const colors = ["#ff0000", "#00ff00", "#0000ff", "#ffff00", "#ff00ff"];

  confetti.style.position = "absolute";
  confetti.style.width = "10px";
  confetti.style.height = "10px";
  confetti.style.backgroundColor =
    colors[Math.floor(Math.random() * colors.length)];
  confetti.style.left = Math.random() * 100 + "%";
  confetti.style.top = "-10px";
  confetti.style.transform = "rotate(" + Math.random() * 360 + "deg)";

  parent.appendChild(confetti);

  const animation = confetti.animate(
    [
      { transform: `translate(0, 0) rotate(0deg)` },
      {
        transform: `translate(${Math.random() * 200 - 100}px, ${
          window.innerHeight
        }px) rotate(${Math.random() * 720}deg)`,
      },
    ],
    {
      duration: 1000 + Math.random() * 3000,
      easing: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
    }
  );

  animation.onfinish = () => confetti.remove();
}
