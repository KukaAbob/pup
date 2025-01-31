let currentQuestions = [];
let currentQuestion = 0;
let selectedAnswers = [];
let timeLeft = 30 * 60;
let timer = null;

// DOM элементы
const quizContainer = document.getElementById('quiz-container');
const resultsContainer = document.getElementById('results');
const questionText = document.getElementById('question-text');
const optionsContainer = document.getElementById('options');
const currentQuestionSpan = document.getElementById('current-question');
const timeSpan = document.getElementById('time');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const finishBtn = document.getElementById('finish-btn');
const restartBtn = document.getElementById('restart-btn');

async function loadQuestions() {
    const response = await fetch('questions.json');
    const data = await response.json();
    currentQuestions = getRandomQuestions(data.questions, 20);
    selectedAnswers = new Array(20).fill(null);
    displayQuestion();
}

function getRandomQuestions(questions, count) {
    return [...questions]
        .sort(() => 0.5 - Math.random())
        .slice(0, count);
}

function startTimer() {
    timer = setInterval(() => {
        timeLeft--;
        updateTimer();
        if (timeLeft <= 0) {
            finishQuiz();
        }
    }, 1000);
}

function updateTimer() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    timeSpan.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function displayQuestion() {
    const question = currentQuestions[currentQuestion];
    questionText.textContent = question.question;
    currentQuestionSpan.textContent = currentQuestion + 1;
    
    optionsContainer.innerHTML = '';
    Object.entries(question.options).forEach(([key, value]) => {
        const button = document.createElement('button');
        button.className = `option ${selectedAnswers[currentQuestion] === key ? 'selected' : ''}`;
        button.textContent = `${key}) ${value}`;
        button.onclick = () => selectOption(key);
        optionsContainer.appendChild(button);
    });

    updateNavigation();
}

function selectOption(key) {
    selectedAnswers[currentQuestion] = key;
    displayQuestion();
}

function previousQuestion() {
    if (currentQuestion > 0) {
        currentQuestion--;
        displayQuestion();
    }
}

function nextQuestion() {
    if (currentQuestion < currentQuestions.length - 1) {
        currentQuestion++;
        displayQuestion();
    }
}

function updateNavigation() {
    prevBtn.disabled = currentQuestion === 0;
    if (currentQuestion === currentQuestions.length - 1) {
        nextBtn.style.display = 'none';
        finishBtn.style.display = 'inline-flex';
    } else {
        nextBtn.style.display = 'inline-flex';
        finishBtn.style.display = 'none';
    }
}

function calculateScore() {
    return currentQuestions.reduce((score, question, index) => {
        return score + (selectedAnswers[index] === question.correct ? 1 : 0);
    }, 0);
}

function finishQuiz() {
    clearInterval(timer);
    showResults();
}

function showResults() {
    quizContainer.style.display = 'none';
    resultsContainer.style.display = 'block';

    const score = calculateScore();
    const percentage = (score / 20) * 100;

    document.getElementById('score').textContent = score;
    document.getElementById('percentage').textContent = `${percentage.toFixed(1)}%`;

    const reviewContainer = document.getElementById('review');
    reviewContainer.innerHTML = '';

    currentQuestions.forEach((question, index) => {
        const isCorrect = selectedAnswers[index] === question.correct;
        const reviewItem = document.createElement('div');
        reviewItem.className = `review-item ${isCorrect ? 'correct' : 'incorrect'}`;

        const icon = document.createElement('div');
        icon.innerHTML = isCorrect 
            ? '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="accent"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>'
            : '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f87171" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>';

        const content = document.createElement('div');
        content.className = 'review-content';
        content.innerHTML = `
            <p class="review-question">${index + 1}. ${question.question}</p>
            <p class="review-answer ${isCorrect ? 'correct-text' : 'incorrect-text'}">
                Ваш ответ: ${question.options[selectedAnswers[index]] || 'Не выбран'}
            </p>
            ${!isCorrect ? `
                <p class="review-answer correct-text">
                    Правильный ответ: ${question.options[question.correct]}
                </p>
            ` : ''}
        `;

        reviewItem.appendChild(icon);
        reviewItem.appendChild(content);
        reviewContainer.appendChild(reviewItem);
    });
}

function restartQuiz() {
    currentQuestion = 0;
    selectedAnswers = new Array(currentQuestions.length).fill(null);
    timeLeft = 30 * 60;
    quizContainer.style.display = 'block';
    resultsContainer.style.display = 'none';
    clearInterval(timer);
    startTimer();
    displayQuestion();
}

// Обработчики событий
prevBtn.addEventListener('click', previousQuestion);
nextBtn.addEventListener('click', nextQuestion);
finishBtn.addEventListener('click', finishQuiz);
restartBtn.addEventListener('click', restartQuiz);

// Инициализация викторины
document.addEventListener('DOMContentLoaded', () => {
    loadQuestions();
    startTimer();
    displayQuestion();
});