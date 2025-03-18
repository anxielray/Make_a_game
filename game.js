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
const game_controls = document.querySelector(".game_controls");

// ==== game initial status ===
let paddle_x = game_container.clientWidth / 2 - paddle.clientWidth / 2;
paddle.style.borderRadius = "19px";
let ball_x = paddle_x / 2 - ball.clientWidth / 2,
  ball_y = 650,
  ballDX = 1.5,
  ballDY = 1.5;
let not_paused = false;
let score = 0;
let start_lives = 3;
let game_state = "ready";
arrow_controls = false;
let ball_stuck_to_paddle = true;
let space_enabled = true;
let gameTimer = 0;
let timerInterval;
let currentLevel = 1;
let playerName = "";
let leftPressed = false;
let rightPressed = false;
let paddleSpeed = 6;
let bricksCache = [];
let heartsCache = [];

function cacheHearts() {
  heartsCache = Array.from(document.querySelectorAll(".heart"));
}

function clearBricks() {
  bricksCache.forEach((brick) => {
    if (brick.parentNode) {
      brick.parentNode.removeChild(brick);
    }
  });
  bricksCache = [];
}

// === The function will create bricks for the game ===
function create_bricks() {
  clearBricks();
  const rows = 5;
  const col = 13;
  for (let i = 1; i < rows; i++) {
    for (let j = 1; j < col - 1; j++) {
      const brick = document.createElement("div");

      if (i > 0) {
        brick.classList.add("brick");
        brick.classList.add("level1");
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
      game_container.appendChild(brick);
      bricksCache.push(brick);
      game_container.style.alignItems = "center";
    }
  }
}

/**
 * Debounce function to limit the rate at which a function can fire.
 * @param {Function} func - The function to debounce.
 * @param {number} delay - The delay in milliseconds.
 * @returns {Function} - A debounced version of the given function.
 */
function debounce(func, delay) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
}

/**
 * Handles keydown events to set movement flags.
 * @param {KeyboardEvent} e
 */
function keyDownHandler(e) {
  if (e.key === "ArrowLeft") {
    leftPressed = true;
  } else if (e.key === "ArrowRight") {
    rightPressed = true;
  }
}

/**
 * Handles keyup events to clear movement flags.
 * @param {KeyboardEvent} e
 */
function keyUpHandler(e) {
  if (e.key === "ArrowLeft") {
    leftPressed = false;
  } else if (e.key === "ArrowRight") {
    rightPressed = false;
  }
}

document.addEventListener("keydown", debounce(keyDownHandler, 30));
document.addEventListener("keyup", debounce(keyUpHandler, 30));

function create_bricks_level2() {
  bricksCache = [];

  const brickWidth = 60;
  const brickHeight = 30;
  const spacing = 10;

  const maxRows = 5;
  const maxBricksInRow = 7;

  const startX =
    (game_container.clientWidth - maxBricksInRow * (brickWidth + spacing)) / 2;
  let currentY = 50;

  for (let row = 0; row < maxRows; row++) {
    const middleRow = Math.floor(maxRows / 2);
    let bricksInThisRow;

    if (row <= middleRow) {
      bricksInThisRow = maxBricksInRow - row * 2;
    } else {
      bricksInThisRow = maxBricksInRow - (maxRows - row - 1) * 2;
    }
    const rowStartX =
      startX +
      ((maxBricksInRow - bricksInThisRow) * (brickWidth + spacing)) / 2;

    for (let col = 0; col < bricksInThisRow; col++) {
      const brick = document.createElement("div");
      brick.classList.add("brick");
      brick.hit = false;
      brick.dataset.health = 1;

      brick.style.left = `${rowStartX + col * (brickWidth + spacing)}px`;
      brick.style.top = `${currentY}px`;
      brick.style.width = `${brickWidth}px`;
      brick.style.height = `${brickHeight}px`;
      brick.style.border = "1px solid white";

      const colorIndex = (row + col) % 5;
      const colors = ["#ff0000", "#33FF57", "#3357FF", "#F3FF33", "#FF33F3"];
      brick.style.backgroundColor = colors[colorIndex];
      if (colorIndex === 0) {
        brick.dataset.health = 3;
      }

      game_container.appendChild(brick);
      bricksCache.push(brick);
    }

    currentY += brickHeight + spacing;
  }
}

// === event listener to control the paddle movements ===
document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft" && arrow_controls) {
    leftPressed = true;
  } else if (e.key === "ArrowRight" && arrow_controls) {
    rightPressed = true;
  } else if (e.code === "Space" || e.key === "p") {
    if (ball_stuck_to_paddle && game_state === "playing") {
      arrow_controls = true;
      ball_stuck_to_paddle = false;
      ballDY = -2.7;
      ballDX = -ballDX;
    } else if (game_state === "playing") {
      game_state = "paused";
      toggleCursor(true);
      arrow_controls = false;
      pause_game();
    } else if (game_state === "paused") {
      arrow_controls = true;
      resume_game();
    }
  } else if (e.code === "Escape" && !ball_stuck_to_paddle) {
    game_state = "paused";
    toggleCursor(true);
    pause_game();
  }
});

document.addEventListener("keyup", (e) => {
  if (e.key === "ArrowLeft") {
    leftPressed = false;
  } else if (e.key === "ArrowRight") {
    rightPressed = false;
  }
});

// Cache game container and paddle dimensions
let gameContainerWidth = game_container.clientWidth;
let paddleWidth = paddle.clientWidth;

// ==== This is a function to pause the game ====
function pause_game() {
  show_pause_menu();
}

// ==== This is a function to pause the game and display the pause menu ===
function show_pause_menu() {
  game_state = "paused";
  toggleCursor(true);
  arrow_controls = false;
  pause_menu.classList.replace("hidden", "visible");
}

// ==== This is a function to resume the game from the pause menu ===
function resume_game() {
  game_state = "playing";
  toggleCursor(false);
  arrow_controls = true;
  hide_pause_menu();
}

// === function to hide the pause menu and resume the game ===
function hide_pause_menu() {
  pause_menu.classList.replace("visible", "hidden");
}

let animationFrameId = 0;

function update() {
  if (game_state === "paused") {
    toggleCursor(true);
    arrow_controls = false;
    animationFrameId = requestAnimationFrame(update);
    return;
  }

  if (arrow_controls) {
    if (leftPressed && paddle_x > 0) {
      paddle_x -= paddleSpeed;
      if (paddle_x < 0) paddle_x = 0;
    }
    if (
      rightPressed &&
      paddle_x < game_container.clientWidth - paddle.clientWidth
    ) {
      paddle_x += paddleSpeed;
      if (paddle_x > game_container.clientWidth - paddle.clientWidth) {
        paddle_x = game_container.clientWidth - paddle.clientWidth; // Prevent going out of bounds
      }
    }
    paddle.style.transform = `translateX(${paddle_x}px)`;
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

  ball.style.left = `${ball_x}px`;
  ball.style.top = `${ball_y}px`;

  animationFrameId = requestAnimationFrame(update);
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
  // Cache paddle properties
  const paddleTop = 650;
  const paddleLeft = paddle_x;
  const paddleRight = paddle_x + paddle.clientWidth;

  if (ball_y >= paddleTop && ball_x >= paddleLeft && ball_x <= paddleRight) {
    ballDY = -Math.abs(ballDY);
    let hitPoint = (ball_x - paddleLeft) / paddle.clientWidth;
    ballDX = hitPoint + ballDX;
  }
  if (ball_y >= game_container.clientHeight) {
    lives--;
    if (lives === 0) {
      game_over();
      return;
    } else {
      cancelAnimationFrame(animationFrameId);
      reset_ball();
      update_lives(start_lives - lives);
      animationFrameId = requestAnimationFrame(update);
    }
  }
}

function handleBrickCollision() {
  const ballRect = ball.getBoundingClientRect();

  for (let i = bricksCache.length - 1; i >= 0; i--) {
    const brick = bricksCache[i];

    if (!document.body.contains(brick)) {
      bricksCache.splice(i, 1);
      continue;
    }

    const brickRect = brick.getBoundingClientRect();

    if (
      ballRect.left < brickRect.right &&
      ballRect.right > brickRect.left &&
      ballRect.top < brickRect.bottom &&
      ballRect.bottom > brickRect.top
    ) {
      if (brick.dataset.cooldown) continue;

      let health = parseInt(brick.dataset.health || 1, 10);
      health--;

      // === Calculate Intersection Depth for Bounce Direction ===
      let intersectX = Math.min(
        ballRect.right - brickRect.left,
        brickRect.right - ballRect.left
      );
      let intersectY = Math.min(
        ballRect.bottom - brickRect.top,
        brickRect.bottom - ballRect.top
      );

      if (intersectX < intersectY) {
        ballDX *= -1;
      } else {
        ballDY *= -1;
      }

      if (health <= 0) {
        brick.classList.add("hit");
        showFloatingScore(brickRect);
        brick.style.opacity = 0;
        setTimeout(() => {
          brick.remove();
        }, 150);
        bricksCache.splice(i, 1);
        score += 10;
        score_display.textContent = score;
      } else {
        brick.dataset.health = health;
        brick.style.opacity = health === 2 ? 0.5 : health === 1 ? 0.2 : 1;
      }
      brick.dataset.cooldown = true;
      setTimeout(() => {
        delete brick.dataset.cooldown;
      }, 100);
      checkLevelCompletion();
      break;
    }
  }
}

function showFloatingScore(brickRect) {
  const scoreEffect = document.createElement("div");
  scoreEffect.textContent = "+10";
  scoreEffect.style.position = "absolute";
  scoreEffect.style.left = `${brickRect.left + brickRect.width / 2 - 10}px`;
  scoreEffect.style.top = `${brickRect.top}px`;
  scoreEffect.style.color = "#ffcc00";
  scoreEffect.style.fontSize = "20px";
  scoreEffect.style.fontWeight = "bold";
  scoreEffect.style.textShadow = "2px 2px 10px rgba(255, 200, 0, 0.9)";
  scoreEffect.style.pointerEvents = "none";
  scoreEffect.style.userSelect = "none";
  scoreEffect.style.zIndex = "1000";
  scoreEffect.style.opacity = "1";
  scoreEffect.style.transform = "translateY(-10px) scale(1.2) rotate(-5deg)";
  scoreEffect.style.transition = "transform 0.8s ease-out, opacity 0.8s";

  document.body.appendChild(scoreEffect);

  setTimeout(() => {
    scoreEffect.style.transform = "translateY(-50px) scale(1) rotate(5deg)";
    scoreEffect.style.opacity = "0";
  }, 50);

  setTimeout(() => {
    scoreEffect.remove();
  }, 900);
}

function update_lives(lost_lives) {
  cacheHearts();
  if (lost_lives === 0 || !lost_lives) {
    return;
  } else if (lost_lives === 3) {
    game_over();
    return;
  } else if (lost_lives < 3) {
    for (let i = 0; i < lost_lives; i++) {
      if (heartsCache[i]) {
        heartsCache[i].classList.add("lost");
      }
    }
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
  toggleCursor(false);
  arrow_controls = true;
  pause_menu.classList.replace("visible", "hidden");
  requestAnimationFrame(update);
}

// ===( Reset ball and paddle will reset the paddle and the ball on the starting position )=====
function reset_ball_paddle() {
  paddle_x = game_container.clientWidth / 2 - paddle.clientWidth / 2;
  paddle.style.transform = `translateX(${paddle_x}px)`;
  reset_ball();
}

function updateScore() {
  document.getElementById("score").textContent = `Score: ${score}`;
}

// === function to start the game ===
function start_game() {
  reset_game();
  game_state = "playing";
  toggleCursor(false);
  arrow_controls = true;
  ball_stuck_to_paddle = true;
  animate();
  gameTimer = 0;
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    if (game_state === "playing") {
      gameTimer++;
      updateTimer();
    }
  }, 1);
}

// === This is a function to animate the game ===
function animate() {
  if (game_state === "playing" && arrow_controls) {
    update();
  }
}

// === Create and Inject Modal into the HTML ===
const modalHTML = `
<div id="nameModal" class="modal-overlay">
<div class="modal">
<h2 style="font-size:40px;">Enter Your Name</h2>
<input type="text" id="playerNameInput" placeholder="Enter your name..." autocomplete="off">
<br><br>
<button id="startGameBtn" class="btn">Start Game</button>
<br><br>
<a href="documentation.html" class="data-link" target="_blank">Why do we need your data?</a>
</div>
</div>
`;
document.body.insertAdjacentHTML("beforeend", modalHTML);

// Get modal elements
const nameModal = document.getElementById("nameModal");
const playerNameInput = document.getElementById("playerNameInput");
const startGameBtn = document.getElementById("startGameBtn");

// === Event Listener for "Start Game" Button in Modal ===
startGameBtn.addEventListener("click", () => {
  playerName = playerNameInput.value.trim();

  if (!playerName) return;

  nameModal.style.display = "none";
  startGame();
});

// === Function to Start the Game ===
function startGame() {
  game_container.style.display = `block`;
  score_container.style.display = `block`;
  instructions_container.style.display = `block`;
  game_controls.style.display = `block`;
  create_bricks();
  reset_ball_paddle();
  update_lives();
  requestAnimationFrame(update);
  startCountdown();
  currentLevel = 1;
}

// === Create Data Privacy Modal ===
const privacyModalHTML = `
    <div id="privacyModal" class="modal-overlay">
        <div class="modal">
            <h2>Data Privacy Policy</h2>
            <p>We value your privacy and do not store or share your personal data.</p>
            <p>Any name entered is used only for in-game identification and is not collected or stored.</p>
            <p>If you have concerns, contact us at <a href="mailto:anxielworld@gmail.com">Brick-breaker-creators</a>.</p>
            <br>
            <button id="closePrivacyBtn" class="btn">Close</button>
        </div>
    </div>
`;
document.body.insertAdjacentHTML("beforeend", privacyModalHTML);

const privacyModal = document.getElementById("privacyModal");
const closePrivacyBtn = document.getElementById("closePrivacyBtn");

document.querySelector(".data-link").addEventListener("click", (event) => {
  event.preventDefault();
  privacyModal.style.display = "flex";
});

closePrivacyBtn.addEventListener("click", () => {
  privacyModal.style.display = "none";
});

// === this is a function to prop up the startup menu ===
new_game_button.addEventListener("click", () => {
  start_menu.classList.add("hidden");
  nameModal.style.display = "flex";
});

// === this is a function to start the game CountDown ===
function startCountdown() {
  reset_ball_paddle();
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
      start_game();
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
  game_controls.style.display = `none`;
}
// Add a new function to check if all bricks are cleared
function checkLevelCompletion() {
  if (bricksCache.length === 0) {
    if (currentLevel === 1) {
      transitionToLevel2();
      currentLevel++;
      return;
    } else {
      showVictoryScreen();
      return;
    }
  }
}

// Function to transition to level 2 ====
function transitionToLevel2() {
  alert("Level 1 Complete! Moving to Level 2...");
  reset_ball_paddle();

  create_bricks_level2();
  game_state = "playing";
  toggleCursor(false);
  requestAnimationFrame(update);
}

// === function to show the game over menu ===
function game_over() {
  cancelAnimationFrame(animationFrameId);
  clearInterval(timerInterval);
  document.removeEventListener("keydown", debounce(keyDownHandler));
  document.removeEventListener("keyup", debounce(keyUpHandler));

  game_state = "over";
  arrow_controls = false;
  clearAllOverlays();
  start_menu.classList.add("hidden");
  game_container.style.display = "none";
  score_container.style.display = "block";
  instructions_container.style.display = "none";
  game_controls.style.display = "none";
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
  game_container.style.display = `none`;
  instructions_container.style.display = `none`;
  game_controls.style.display = `none`;

  game_state = "victory";
  arrow_controls = false;
  const victoryOverlay = document.createElement("div");
  victoryOverlay.className = "victory-overlay";

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
  const victoryContent = document.querySelector(".victory-content");
  if (victoryContent) {
    victoryContent.style.display = "none";
  }
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
            <button class="game-button" onclick="showLeaderboard()">Close</button>
        </div>
`;
  document.body.appendChild(leaderboardOverlay);
}

function clearAllOverlays() {
  const overlays = document.querySelectorAll(
    ".victory-overlay, .leaderboard-overlay"
  );
  overlays.forEach((overlay) => (overlay.style.display = "none"));
}

function restartGame() {
  clearAllOverlays();
  const bricks = document.querySelectorAll(".brick");
  bricks.forEach((brick) => brick.classList.add("hidden"));
  create_bricks();
  reset_game();
  startCountdown();
}

document.addEventListener("DOMContentLoaded", startMenu);
document.addEventListener("DOMContentLoaded", () => {
  toggleCursor(false);
});

function toggleCursor(show) {
  game_container.style.cursor = show ? "default" : "none";
}

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
