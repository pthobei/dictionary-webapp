const dictUrl = "https://api.dictionaryapi.dev/api/v2/entries/en/";
const randomWordUrl = "https://random-word-api.herokuapp.com/word";
const result = document.getElementById("result");
const sound = document.getElementById("sound");
const search = document.getElementById("search-btn");

//Words for the flashcards
const words = [{ word: "Ephemeral", meanings: "Lasting for a very short time", example: "The ephemeral nature of fashion trends" },

                { word: "Serendipity", meanings: "The occurrence and development of events by chance in a happy or beneficial way", example: "A fortunate stroke of serendipity" },

                { word: "Limerence", meanings: "The state of being infatuated or obsessed with another person, typically experienced involuntarily and characterized by a strong desire for reciprocation of one's feelings", example: "Limerence is a state of mind which results from a romantic attraction to another person combined with an overwhelming, obsessive need to have one's feelings reciprocated" },
              ];

//quiz data
const quizData = [
    { word: "Ebullient", correct: "Cheerful & full of energy", options: ["Calm & quiet", "Cheerful & full of energy", "Lazy", "Dull"] },
    { word: "Obfuscate", correct: "Make something unclear", options: ["Make something unclear", "Clarify", "Simplify", "Ignore"] },
    { word: "Ubiquitous", correct: "Present everywhere", options: ["Rare", "Present everywhere", "Dangerous", "Unknown"] }
];

let currentQuestionIndex = 0;
const questionText = document.getElementById("question");
const optionsContainer = document.getElementById("options");
const resultText = document.getElementById("result");

let currentIndex = 0;
let flipped = false;
const card = document.getElementById("flashcard");

//update the card with the current word

function updateCard() {
    card.textContent = flipped ? words[currentIndex].meanings : words[currentIndex].word;
}

card.addEventListener("click", () => {
    flipped = !flipped;
    updateCard();
});

//get next card

function nextCard() {
    currentIndex = (currentIndex + 1) % words.length;
    flipped = false;
    updateCard();
}

//get previous card

function prevCard() {
    currentIndex = (currentIndex - 1 + words.length) % words.length;
    flipped = false;
    updateCard();
}

//Shuffle the cards and get a random word from the API

function shuffleCards() {
    fetchValidWord();
}

// Recursive function to keep fetching until a valid word is found
function fetchValidWord() {
    fetch(randomWordUrl)
        .then((response) => response.json())
        .then((data) => {
            const randomWord = data[0];
            return fetch(`${dictUrl}${randomWord}`);
        })
        .then((response) => {
            if (!response.ok) {
                // If word not found, try again
                fetchValidWord();
                throw new Error("Word not found, trying another...");
            }
            return response.json();
        })
        .then((data) => {
            const word = data[0].word;
            const meaning = data[0]?.meanings[0]?.definitions[0]?.definition;
            
            if (meaning) {
                card.textContent = `${word}: ${meaning}`;
            } else {
                // Retry if no valid meaning found
                fetchValidWord();
            }
        })
        .catch((error) => {
            console.error(error);
        });
}

// Attach shuffle button functionality
document.getElementById("shuffle-card").addEventListener("click", shuffleCards);

// Event listener attached to the search button
search.addEventListener('click', dictionaryActivity);

function dictionaryActivity() {     
    let inputWord = document.getElementById("input-word").value;
    console.log(inputWord);

    // Fetch the data from the API
    fetch(`${dictUrl}${inputWord}`)
        .then((response) => response.json())
        .then((data) => {
            console.log(data);

            if (data.length > 0) {
                result.innerHTML = `
                    <div class="word">
                        <h3>${inputWord}</h3>
                        <button onclick="playSound()">
                            <i class="fa fa-volume-up" aria-hidden="true"></i>
                        </button>
                    </div>
                    <div class="details">
                        <p>${data[0].meanings[0].partOfSpeech}</p>
                        <p>/${data[0].phonetic}/</p>
                    </div>
                    <p class="word-meaning">
                        ${data[0].meanings[0].definitions[0].definition}
                    </p>
                    <p class="word-ex">
                        ${data[0].meanings[0].definitions[0].example || ""}
                    </p>
                `;

                if (data[0].phonetic && data[0].phonetic.audio) {
                    sound.setAttribute("src", `https:${data[0].phonetic.audio}`);
                }
            } else {
                result.innerHTML = "No definition found!";
            }
        })
        .catch(error => {
            console.error("Error fetching data: ", error);
            result.innerHTML = "Sorry, we couldn't find that word.";
        });
}

function loadQuestion() {
    const q = quizData[currentQuestionIndex];
    questionText.textContent = `What does "${q.word}" mean?`;
    optionsContainer.innerHTML = "";
    q.options.forEach(option => {
        const btn = document.createElement("button");
        btn.textContent = option;
        btn.onclick = () => checkAnswer(btn, option, q.correct);
        optionsContainer.appendChild(btn);
    });
}

function checkAnswer(btn, selected, correct) {
    if (selected === correct) {
        btn.classList.add("correct");
        resultText.textContent = "✅ Correct!";
    } else {
        btn.classList.add("wrong");
        resultText.textContent = "❌ Wrong! The correct answer is: " + correct;
    }
}

function nextQuestion() {
    currentQuestionIndex = (currentQuestionIndex + 1) % quizData.length;
    resultText.textContent = "";
    loadQuestion();
}

loadQuestion(); // Load first question

// Function to play sound
function playSound() {
    sound.play();
}
