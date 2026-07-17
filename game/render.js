// game/render.js
import { state } from './state.js';
import { generateQuestion } from './questions.js';
import { resetAllHistory } from './history.js';

let animationFrameId = null;
let startTimestamp = null;
const TOTAL_GAME_TIME = 60;
let timeLeft = TOTAL_GAME_TIME;

function stopTimer() {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
}

function startTimer() {
  const timerBarFill = document.getElementById('timerBarFill');
  if (!timerBarFill) return;

  if (timerBarFill.parentElement) {
    timerBarFill.parentElement.style.display = 'block';
  }
  const scoreDisplay = document.getElementById('scoreDisplay');
  if (scoreDisplay) {
    scoreDisplay.style.display = 'block';
  }

  timeLeft = TOTAL_GAME_TIME;
  startTimestamp = performance.now();
  timerBarFill.style.width = '100%';
  stopTimer();

  function updateBar() {
    const now = performance.now();
    const elapsedSeconds = (now - startTimestamp) / 1000;
    const remainingSeconds = Math.max(0, TOTAL_GAME_TIME - elapsedSeconds);
    timeLeft = Math.ceil(remainingSeconds);
    const percent = (remainingSeconds / TOTAL_GAME_TIME) * 100;
    timerBarFill.style.width = `${percent}%`;

    if (remainingSeconds <= 0) {
      timerBarFill.style.width = '0%';
      stopTimer();
      endGame();
    } else {
      animationFrameId = requestAnimationFrame(updateBar);
    }
  }

  animationFrameId = requestAnimationFrame(updateBar);
}

function endGame() {
  const timerBarFill = document.getElementById('timerBarFill');
  if (timerBarFill && timerBarFill.parentElement) {
    timerBarFill.parentElement.style.display = 'none';
  }
  const scoreDisplay = document.getElementById('scoreDisplay');
  if (scoreDisplay) {
    scoreDisplay.style.display = 'none';
  }

  const area = document.getElementById('quizArea');
  area.innerHTML = `
    <div class="result-box">
      <h2>Aika loppui!</h2>
      <p class="result-subtext">Tuloksesi:</p>
      <div class="final-score">${state.score.correct} / ${state.score.total}</div>
      <button class="option-btn play-again-btn" id="playAgainBtn">Pelaa uudelleen</button>
    </div>
  `;

  const playAgainBtn = document.getElementById('playAgainBtn');
  if (playAgainBtn) {
    playAgainBtn.addEventListener('click', resetGame);
  }
}

export function resetGame() {
  state.score = { correct: 0, total: 0 };
  state.currentQuestion = null;
  state.answerLocked = false;
  resetAllHistory();
  stopTimer();
  updateScoreDisplay();
  startTimer();
  nextQuestion();
}

export function renderQuestion() {
  const area = document.getElementById('quizArea');
  if (!state.currentQuestion) {
    area.innerHTML = '<p>Ladataan...</p>';
    return;
  }

  const q = state.currentQuestion;
  const optionsHtml = `
    <div class="options-grid">
      ${q.options.map(opt => `
        <button class="option-btn" data-value="${opt}">${opt}</button>
      `).join('')}
    </div>
  `;

  area.innerHTML = `
    <div class="question-container">
      <div class="question-text">${q.question}</div>
    </div>
    ${optionsHtml}
  `;

  // Removed automatic focus to prevent unwanted highlighting
  document.querySelectorAll('.option-btn').forEach(btn => {
    btn.addEventListener('click', () => handleAnswer(btn.dataset.value));
  });
  state.answerLocked = false;
}

function handleAnswer(selected) {
  if (state.answerLocked || timeLeft <= 0) return;
  state.answerLocked = true;

  const q = state.currentQuestion;
  const isCorrect = (selected === q.correct);

  state.score.total++;
  if (isCorrect) state.score.correct++;
  updateScoreDisplay();

  document.querySelectorAll('.option-btn').forEach(btn => {
    btn.disabled = true;
    if (btn.dataset.value === q.correct) {
      btn.classList.add('correct');
    } else if (btn.dataset.value === selected && !isCorrect) {
      btn.classList.add('incorrect');
    }
  });

  if (timeLeft > 0) {
    setTimeout(() => {
      if (timeLeft > 0) nextQuestion();
    }, 500);
  }
}

export function nextQuestion() {
  if (timeLeft <= 0) return;
  const newQuestion = generateQuestion();
  if (!newQuestion) {
    endGame();
    return;
  }
  state.currentQuestion = newQuestion;
  renderQuestion();
}

function updateScoreDisplay() {
  const scoreDisplay = document.getElementById('scoreDisplay');
  if (scoreDisplay) {
    scoreDisplay.innerText = `${state.score.correct} / ${state.score.total}`;
  }
}

export function startGame() {
  startTimer();
  nextQuestion();
}