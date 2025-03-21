// Variables and DOM elements
const questionElement = document.getElementById("question");
const answersElement = document.getElementById("answers");
const nextButton = document.getElementById("next-btn");
const timerElement = document.getElementById("timer");
const progressFillElement = document.getElementById("progress-fill");
const encouragementMessage = document.getElementById("encouragement-message");
const restartContainer = document.getElementById("restart-container");
const restartButton = document.getElementById("restart-btn");

let currentQuestionIndex = 0;
let correctScore = 0;
let wrongScore = 0;
let timerInterval = null;

// Fetch questions from API
async function fetchQuestions() {
  try {
    const response = await fetch(
      "https://opentdb.com/api.php?amount=10&category=12&difficulty=medium"
    );
    const data = await response.json();
    questions = data.results;
    showQuestion();
  } catch (error) {
    console.error("Error fetching questions:", error);
    questionElement.textContent = "Error loading questions. Please try again.";
  }
}

// Display the current question
function showQuestion() {
  resetState();
  const questionData = questions[currentQuestionIndex];
  questionElement.innerHTML = decodeHTML(questionData.question);

  const answers = [...questionData.incorrect_answers, questionData.correct_answer];
  answers.sort(() => Math.random() - 0.5);

  answers.forEach((answer) => {
    const button = document.createElement("button");
    button.textContent = decodeHTML(answer);
    button.classList.add("answer-btn");
    button.addEventListener("click", () => selectAnswer(button, questionData.correct_answer));
    answersElement.appendChild(button);
  });

  updateProgress();
  startTimer();
}

// Reset the state for the next question
function resetState() {
  answersElement.innerHTML = "";
  nextButton.disabled = true;
  clearInterval(timerInterval);
  timer = 30;
  timerElement.textContent = timer;
}

// Start the countdown timer
function startTimer() {
  timerInterval = setInterval(() => {
    timer--;
    timerElement.textContent = timer;
    if (timer === 0) {
      clearInterval(timerInterval);
      selectAnswer(null, questions[currentQuestionIndex].correct_answer);
    }
  }, 1000);
}

function showEncouragement() {
  encouragementMessage.style.display = "block";
  setTimeout(() => {
    encouragementMessage.style.display = "none";
  }, 2000);
}

function showRestartButton() {
  restartContainer.style.display = "block";
}

// Handle answer selection
function selectAnswer(button, correctAnswer) {
  const buttons = document.querySelectorAll(".answer-btn");
  buttons.forEach((btn) => {
    btn.disabled = true;
    if (decodeHTML(btn.textContent) === correctAnswer) {
      btn.classList.add("correct");
      if (button && decodeHTML(button.textContent) === correctAnswer) {
        correctScore++;
        showEncouragement();
      }
    } else {
      btn.classList.add("wrong");
      btn.style.opacity = 0.6;
    }
  });
  
  // Ensure wrongScore increments when incorrect answer is selected
  if (button && decodeHTML(button.textContent) !== correctAnswer) {
    wrongScore++;
  }

  nextButton.disabled = false;
}

// Update progress bar
function updateProgress() {
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  progressFillElement.style.width = `${progress}%`;
}

// Next question or final score
nextButton.addEventListener("click", () => {
  currentQuestionIndex++;
  if (currentQuestionIndex < questions.length) {
    showQuestion();
  } else {
    showFinalScore();
  }
});

// Display final score
function showFinalScore() {
  questionElement.innerHTML = ` Quiz Complete! <br>Your Score: <strong>${correctScore}</strong> Correct, <strong>${wrongScore}</strong> Wrong.`;
  answersElement.innerHTML = "";
  nextButton.style.display = "none";
  showRestartButton();
}

// Decode HTML entities
function decodeHTML(html) {
  const textArea = document.createElement("textarea");
  textArea.innerHTML = html;
  return textArea.value;
}

// Restart the game
restartButton.addEventListener("click", () => {
  currentQuestionIndex = 0;
  correctScore = 0;
  wrongScore = 0;
  restartContainer.style.display = "none";
  nextButton.style.display = "block";
  fetchQuestions(); // Fetch new questions and restart
});

// Fetch questions on page load
fetchQuestions();