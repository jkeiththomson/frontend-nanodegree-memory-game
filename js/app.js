//////////////////////////////////////////////////////////////////////////
// initialization
//////////////////////////////////////////////////////////////////////////

//  constants
const CARD_SYMBOLS = ["anchor", "bicycle", "bolt", "bomb",
    "cube", "diamond", "leaf", "paper-plane-o"];
const STAR_FACTOR = 12; // number of moves it takes to lower star rating

// variables
let allSymbols = [];        // array of 16 symbols (8 pairs), shuffled
let allCards = [];          // array of 16 card nodes
let openCards = [];         // array of the currently open cards
let lockedCards = [];       // array of the cards that have been matched
let moveCount = 0;          // number of moves
let gameTimer = null;       // elapsed time timer ID
let startTime = null;       // time that this game started

// set up shuffled deck of cards and start a new game
initializeAllSymbols();
restartGame();

//////////////////////////////////////////////////////////////////////////
// event handlers
//////////////////////////////////////////////////////////////////////////
const restartBtn = document.querySelector(".restart");
restartBtn.addEventListener("click", restartGame);

const modalBtn = document.querySelector(".modal-button");
modalBtn.addEventListener("click", restartGame);

const deck = document.querySelector(".deck");
deck.addEventListener("click", handleCardClick, true);


//////////////////////////////////////////////////////////////////////////
// functions
//////////////////////////////////////////////////////////////////////////

function handleCardClick(event) {

    // if the user clicked on a card...
    let card = event.target;
    if (card.nodeName === "I") {    // if they clicked an icon, get parent
        card = card.parentElement;
    }

    if (card.nodeName === "LI") {   // cards are list items

        // if card is already shown, do nothing
        if (cardIsInArray(openCards,card) || cardIsInArray(lockedCards,card)) {
            return;
        }

        // if this is the first card clicked on, start game timer
        if (startTime == null) {
            startGameTimer();
        }

        // add this card to the list of open cards
        addToOpenCardList(card);

        // if there are exactly two open cards...
        if (openCards.length == 2) {

            // count one move
            incrementMoveCount();

            // if the cards match (i.e. they have the same icon name)...
            if (openCardsMatch()) {

                // then lock the matched cards
                lockOpenCards();
            }

            // if they don't match...
            else {

                // remove the cards from the open cards array
                closeOpenCards();
            }
        }

        // if all cards have matched, end the game
        if (lockedCards.length == allCards.length)
        {
            endGame();
        }
    }
}

// add this card to the list of open cards, show it
function addToOpenCardList(card) {
    openCards.push(card);
    updateDisplay();
}

// return true if the two cards in openCards have the same symbol
// (i.e. they have the same icon classes)
function openCardsMatch() {
    if (openCards.length == 2) {
        const icon0 = openCards[0].querySelector("i");
        const icon1 = openCards[1].querySelector("i");
        const list0 = icon0.classList;
        const list1 = icon1.classList;
        for (let i=0; i<list0.length; i++) {
            if (list0[i] != list1[i]) {
                return false;
            }
        }
        return true;
    } else {
        console.log("openCardsMatch: should never get here");
        return false;
    }
}

// move open cards to the locked cards list
function lockOpenCards() {
    while (openCards.length > 0) {
        let card = openCards.pop();
        card.classList.add("match");
        lockedCards.push(card);
    }
    // delay a bit before locking matched cards
    window.setTimeout(updateDisplay, 1500);
}

// remove open cards from the open cards list
function closeOpenCards() {
    while (openCards.length > 0) {
        let card = openCards.pop();
        card.classList.add("mismatch");
    }
    // delay a bit before hiding mismatched cards
    window.setTimeout(updateDisplay, 1500);
}

// count one move, i.e. one pair of cards was urned over
function incrementMoveCount() {
    moveCount++;
    updateScorePanel();
}

// end the game
function endGame() {
    // kill the elapsed time timer
    window.clearInterval(gameTimer);
    gameTimer = null;

    // update the final scores
    updateScorePanel();

    // wait a bit, then show end-of-game modal
    window.setTimeout(function() {
        const container = document.querySelector(".modal-container");
        container.classList.add("show");
    }, 2000);
}

//  initialize the array of symbols
function initializeAllSymbols() {
    for (let i=0; i<CARD_SYMBOLS.length; i++) {
        allSymbols[2*i] = CARD_SYMBOLS[i]; // use each name twice (make pairs)
        allSymbols[2*i+1] = CARD_SYMBOLS[i];
    }
}

// set the html for the card icons based on the shuffled symbol array
function setCardIconHtml() {
    // get array of cards (list items that are childre of "deck")
    const deck = document.querySelector(".deck");
    const cards = deck.children;

    // remove HTML icons from each card and add new ones
    for (let i=0; i<cards.length; i++) {
        const card = cards[i];
        allCards[i] = card;
        const text = allSymbols[i];     // we use each name twice to make pairs
        const icon = card.querySelector("i");
        icon.remove();
        card.insertAdjacentHTML("afterbegin",
            "<i class='" + "fa fa-" + text  + "'>" );
    }
}

// start a new game
function restartGame() {
    // hide the end-of-game modal
    const container = document.querySelector(".modal-container");
    container.classList.remove("show");

    // initialize variables
    moveCount = 0;
    openCards = [];
    lockedCards = [];

    // reset timer
    window.clearInterval(gameTimer);
    gameTimer = null;
    startTime = null;

    // shuffle the cards
    allSymbols = shuffle(allSymbols);
    setCardIconHtml();
    updateDisplay();
}

// clear all display classes in array of cards
function clearDisplayClasses() {
    for (let i=0; i<allCards.length; i++) {
        const card = allCards[i];
        const classList = card.classList;
        classList.remove("open");
        classList.remove("locked");
        classList.remove("match");
        classList.remove("mismatch");
    }
}

// return true if card is in an array
function cardIsInArray(array, card) {
    for (let i=0; i<array.length; i++) {
        if (card === array[i]) {
            return true;
        }
    }
    return false;
}

// set display classes of cards in an array
function setDisplayClass(array, className) {
    for (let i=0; i<array.length; i++) {
        const card = array[i];
        const classList = card.classList;
        classList.add(className);
    }
}

function updateScorePanel() {
    // update move count
    const moveStr = moveCount.toString() +
        " move" + (moveCount == 1 ? "" : "s");
    document.querySelector(".moves").innerHTML = moveStr;
    document.querySelector(".modal-moves").innerHTML = moveStr;

    // update stars
    const starContainer = document.querySelector(".stars");
    const stars = starContainer.children;
    const len = stars.length;
    let starCount = 0;
    for (let i=0; i<len; i++) {
        const star = stars[i];
        const icon = star.querySelector("i");
        if (moveCount > STAR_FACTOR * (len - i)) {
            icon.className = "fa fa-star-o";
        } else {
            icon.className = "fa fa-star";
            starCount++;
        }
    }
    const starStr = starCount.toString() +
        " star" + (starCount == 1 ? "" : "s");
    document.querySelector(".modal-stars").innerHTML = starStr;

    // update game timer
    let timeStr = "0:00";
    if (startTime != null) {
        const msec = Date.now() - startTime;
        let secs = Math.floor(msec/1000);
        let mins = Math.floor(secs/60);
        secs = secs % 60;
        timeStr = mins + ":" + (secs < 10 ? "0" : "" ) + secs;
    }
    document.querySelector(".time").innerHTML = timeStr;
    document.querySelector(".modal-time").innerHTML = timeStr;
}

// update the entire display
function updateDisplay() {
    clearDisplayClasses();
    setDisplayClass(openCards,"open");
    setDisplayClass(lockedCards,"locked");
    updateScorePanel();
}

// start the elapsed time game timer
function startGameTimer() {
    startTime = Date.now();
    gameTimer = window.setInterval(updateScorePanel, 1000);
}

// Shuffle function from http://stackoverflow.com/a/2450976
function shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;

    while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}
