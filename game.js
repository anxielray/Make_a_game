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
      ballDX = (Math.random() - 0.5) * 2;
      space_enabled = false;
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

    // Ball & Wall Collisions
    if (ball_x <= 0 || ball_x >= game_container.clientWidth - ball.clientWidth)
      ballDX *= -1;
    if (ball_y <= 0) ballDY *= -1;

    // Ball & Paddle Collision
    if (
      ball_y >= 650 &&
      ball_x >= paddle_x &&
      ball_x <= paddle_x + paddle.clientWidth
    ) {
      ballDY = -Math.abs(ballDY);
      let hitPoint = (ball_x - paddle_x) / paddle.clientWidth;
      ballDX = 3 * (hitPoint - 0.5);
    }

    // Lose a life when ball falls below screen
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

  // Brick Collision - Ensures only one brick is hit
  let bricks = document.querySelectorAll(".brick");
  for (let brick of bricks) {
    let brick_rect = brick.getBoundingClientRect();
    let ball_rect = ball.getBoundingClientRect();
    
    if (ball_rect.left < brick_rect.right && 
        ball_rect.right > brick_rect.left && 
        ball_rect.top < brick_rect.bottom && 
        ball_rect.bottom > brick_rect.top) {
        
        // Calculate the intersection depth
        let intersectX = Math.min(ball_rect.right - brick_rect.left, brick_rect.right - ball_rect.left);
        let intersectY = Math.min(ball_rect.bottom - brick_rect.top, brick_rect.bottom - ball_rect.top);
        
        // Determine bounce direction based on smallest intersection
        if (intersectX < intersectY) {
            ballDX *= -1;
        } else {
            ballDY *= -1;
        }
        
        brick.remove();
        score += 10;
        score_display.textContent = score;
        
        // Check if all bricks are cleared
        if (document.querySelectorAll(".brick").length === 0) {
            showVictoryScreen();
        }
        break;
    }
  }

  // Update ball position
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
  arrow_controls = false;
  start_menu.classList.remove("hidden");
  game_container.style.display = `none`;
  score_container.style.display = `none`;
  instructions_container.style.display = `none`;
}

// === function to show the game over menu ===
function game_over() {
  start_menu.classList.add("hidden");
  game_container.style.display = "none";
  score_container.style.display = "block";
  instructions_container.style.display = "none";
  game_state = "over";
  arrow_controls = false;

  let scores = JSON.parse(localStorage.getItem("scores")) || [];
  scores.push({ name: playerName, score: score, time: gameTimer });
  localStorage.setItem("scores", JSON.stringify(scores));

  const scorelist = document.getElementById("score-list");
  scorelist.innerHTML = `
    <h2>Game Over, ${playerName}!</h2>
    <div style="margin: 20px; padding: 20px; background: rgba(255,255,255,0.1); border-radius: 10px;">
        <p>Your Final Score: ${score}</p>
        <p>Time Played: ${Math.floor(gameTimer / 60)}m ${gameTimer % 60}s</p>
        <p>Bricks Destroyed: ${score / 10}</p>
    </div>
    <h3>High Scores</h3>
  `;

  if (scores.length === 0) {
    scorelist.innerHTML += `<p>No scores yet</p>`;
  } else {
    scores.sort((a, b) => b.score - a.score);
    const topScores = scores.slice(0, 5);
    topScores.forEach((entry, index) => {
      const li = document.createElement("li");
      li.style.color = index === 0 ? "gold" : "white";
      li.style.padding = "10px";
      li.style.margin = "5px";
      li.style.background = "rgba(0,0,0,0.5)";
      li.textContent = `${index + 1}. ${entry.name}: ${entry.score} points (${Math.floor(entry.time / 60)}m ${entry.time % 60}s)`;
      scorelist.appendChild(li);
    });
  }

  scorelist.innerHTML += `
    <button id="restart-button" onclick="start_game()" style="margin: 10px;">Play Again</button>
    <a class="back-button" onclick="startMenu()">Back to Main Menu</a>
  `;
}

document.addEventListener("DOMContentLoaded", startMenu);

// Keep this cleaner version at the end of the file and update it
function updateTimer() {
    const minutes = Math.floor(gameTimer / 60);
    const seconds = gameTimer % 60;
    document.getElementById('timer').textContent = 
        `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function showVictoryScreen() {
    game_state = "victory";
    arrow_controls = false;
    
    // Create victory overlay
    const victoryOverlay = document.createElement("div");
    victoryOverlay.style.position = "absolute";
    victoryOverlay.style.top = "0";
    victoryOverlay.style.left = "0";
    victoryOverlay.style.width = "100%";
    victoryOverlay.style.height = "100%";
    victoryOverlay.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
    victoryOverlay.style.color = "gold";
    victoryOverlay.style.fontSize = "48px";
    victoryOverlay.style.display = "flex";
    victoryOverlay.style.flexDirection = "column";
    victoryOverlay.style.justifyContent = "center";
    victoryOverlay.style.alignItems = "center";
    victoryOverlay.style.zIndex = "1000";
    
    // Create confetti
    for (let i = 0; i < 100; i++) {
        createConfetti(victoryOverlay);
    }
    
    victoryOverlay.innerHTML += `
        <h1>🎉 Congratulations ${playerName}! 🎉</h1>
        <p style="font-size: 24px">You won with ${lives} lives remaining!</p>
        <p style="font-size: 24px">Final Score: ${score}</p>
        <button onclick="startMenu()" style="padding: 10px 20px; margin-top: 20px; font-size: 20px; cursor: pointer;">Back to Menu</button>
    `;
    
    document.body.appendChild(victoryOverlay);
}

function createConfetti(parent) {
    const confetti = document.createElement("div");
    const colors = ["#ff0000", "#00ff00", "#0000ff", "#ffff00", "#ff00ff"];
    
    confetti.style.position = "absolute";
    confetti.style.width = "10px";
    confetti.style.height = "10px";
    confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    confetti.style.left = Math.random() * 100 + "%";
    confetti.style.top = "-10px";
    confetti.style.transform = "rotate(" + (Math.random() * 360) + "deg)";
    
    parent.appendChild(confetti);
    
    const animation = confetti.animate([
        { transform: `translate(0, 0) rotate(0deg)` },
        { transform: `translate(${Math.random() * 200 - 100}px, ${window.innerHeight}px) rotate(${Math.random() * 720}deg)` }
    ], {
        duration: 1000 + Math.random() * 3000,
        easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
    });
    
    animation.onfinish = () => confetti.remove();
}
        