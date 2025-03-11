const dictUrl = "https://api.dictionaryapi.dev/api/v2/entries/en/";
const result = document.getElementById("result");
const sound = document.getElementById("sound");
const search = document.getElementById("search-btn");

const words = [{ word: "Ephemeral", meanings: "Lasting for a very short time", example: "The ephemeral nature of fashion trends" },

                { word: "Serendipity", meanings: "The occurrence and development of events by chance in a happy or beneficial way", example: "A fortunate stroke of serendipity" },

                { word: "Limerence", meanings: "The state of being infatuated or obsessed with another person, typically experienced involuntarily and characterized by a strong desire for reciprocation of one's feelings", example: "Limerence is a state of mind which results from a romantic attraction to another person combined with an overwhelming, obsessive need to have one's feelings reciprocated" },
              ];


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

//Shuffle the cards

function shuffleCards() {
    currentIndex = 0;
    words.sort(() => Math.random() - 0.5);
    flipped = false;
    updateCard();
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

// Function to play sound
function playSound() {
    sound.play();
}
