const apiUrlBase = "https://my-json-server.typicode.com/treblekeys/JSONServer/";
let selectedQuizId = "quiz_1"; 
let currentQuestionIndex = 0;
let quizData = [];
let correctAnswers = 0;
let startTime, timerInterval;

function startQuiz() {
    const studentName = document.querySelector("#name_input").value.trim();
    if (!studentName) {
        alert("Enter your name to start the quiz.");
        return;
    }
    
    document.querySelector("#studentName").textContent = studentName;
    correctAnswers = 0;
    startTime = new Date();
    updateTimer();
    timerInterval = setInterval(updateTimer, 1000);
    
    loadQuizData(selectedQuizId);
}

function selectQuiz(quizId) {
    selectedQuizId = quizId;   
    currentQuestionIndex = 0; 
    startQuiz();
}

async function loadQuizData(quizId) {
    const apiUrl = `${apiUrlBase}${quizId}`;
    const response = await fetch(apiUrl);
    quizData = await response.json();
    renderQuestion();
}

function updateTimer() {
    const elapsedTime = Math.floor((new Date() - startTime) / 1000);
    const minutes = String(Math.floor(elapsedTime / 60)).padStart(2, '0');
    const seconds = String(elapsedTime % 60).padStart(2, '0');
    document.querySelector("#timer").textContent = `${minutes}:${seconds}`;
}

function renderQuestion() {
    if (currentQuestionIndex >= quizData.length) {
        clearInterval(timerInterval); 
        displayResults();
        return;
    }
    const question = quizData[currentQuestionIndex];
    const source = document.querySelector("#quiz_view1").innerHTML;
    const template = Handlebars.compile(source);
    let renderedHtml;
    if (question.type === "multiple-choice") {
        renderedHtml = template({
            question: question.question,
            choices: question.choices.map((choice, index) => ({ choice, index }))
        });
    } else if (question.type === "narrative") {
        renderedHtml = template({
            question: question.question,
            narrative: true
        });
    } else if (question.type === "image-selection") {
        renderedHtml = template({
            question: question.question,
            images: question.images
        });
    }
    document.querySelector("#view_quiz").innerHTML = renderedHtml;
    document.querySelector("#questionCount").textContent = `Question ${currentQuestionIndex + 1} of ${quizData.length}`;
    if (question.type === "multiple-choice") {
        document.querySelectorAll(".choice-btn").forEach((btn, index) => {
            btn.addEventListener("click", () => checkAnswer(question.choices[index]));
        });
    } else if (question.type === "narrative") {
        document.querySelector("#submitNarrative").addEventListener("click", () => {
            const userAnswer = document.querySelector("#narrativeAnswer").value;
            checkAnswer(userAnswer);
        });
    } else if (question.type === "image-selection") {
        document.querySelectorAll(".img-choice").forEach((img, index) => {
            img.addEventListener("click", () => checkAnswer(question.images[index].img_name));
        });
    }
}

function checkAnswer(userAnswer) {
    const question = quizData[currentQuestionIndex];
    
    if (userAnswer === question.correct_answer) {
        correctAnswers++;
        alert("Good work!");
    } else {
        alert(`Incorrect. ${question.explanation}`);
    }

    currentQuestionIndex++;
    renderQuestion();
}

function displayResults() {
    const scorePercentage = (correctAnswers / quizData.length) * 100;
    const studentName = document.querySelector("#studentName").textContent;
    let resultMessage = scorePercentage >= 80 
        ? `Congratulations ${studentName}! You pass the quiz.`
        : `${studentName}, you fail the quiz.`;

    document.querySelector("#view_quiz").innerHTML = `
        <h3>${resultMessage}</h3>
        <p>Your Score: ${correctAnswers} out of ${quizData.length} (${Math.round(scorePercentage)}%)</p>
        <button onclick="startQuiz()" class="btn btn-primary">Re-take Quiz</button>
        <button onclick="location.reload()" class="btn btn-secondary">Return to Main Page</button>
    `;
}
