/*
 * Display the cards on the page
 *   - shuffle the list of cards using the provided "shuffle" method below
 *   - loop through each card and create its HTML
 *   - add each card's HTML to the page
 */

//  constants
const CARD_SYMBOLS = ["anchor", "bicycle", "bolt", "bomb", "cube", "diamond", "leaf", "paper-plane-o"];

// variables
let allSymbols = [];	// array of 16 symbols (8 pairs), shuffled
let allCards = [];		// array of 16 card nodes
let openCards = [];		// array of the currently open cards
let lockedCards = [];	// array of the cards that have been matched
let moveCount = 0;		// number of moves

// start a new game
initializeAllSymbols();
restartGame();

//////////////////////////////////////////////////////////////////////////
// event handlers
//////////////////////////////////////////////////////////////////////////

const restartBtn = document.querySelector(".restart");
restartBtn.addEventListener('click', restartGame);

const deck = document.querySelector(".deck");
deck.addEventListener('click', handleCardClick);


//////////////////////////////////////////////////////////////////////////
// functions
//////////////////////////////////////////////////////////////////////////

function handleCardClick(event) {

	// if the user clicked on a card...
	const card = event.target;
	if (card.nodeName === "LI") {	// cards are list items

		// if card is already shown, do nothing
		if (cardIsLocked(card) || cardIsOpen(card)) {
			return;
		}

		// add this card to the list of open cards
		addToOpenCardList(card);

		// if there are two open cards...
		if (openCards.length == 2) {

			// if they match (i.e. they have the same icon name)...
			if (openCardsMatch()) {

				// then lock the matched cards in the open position
				lockOpenCards();
			}

			// if they don't match...
			else {

				// remove the cards from the open cards array
				closeOpenCards();
			}

			// picking a pair counts as one move
			incrementMoveCount();
		}

		// if all cards have matched, end the game
		if (lockedCards.length == allCards.length)
		{
			endGame();
		}
	}
}

// return true if this card is locked (i.e. was already matched)
function cardIsLocked(card) {
	for (let i=0; i < lockedCards.length; i++) {
		if (lockedCards[i] === card) {
			return true;
		}
	}
	return false;
}

// return true if this card is open (i.e. attempting to match it)
function cardIsOpen(card) {
	for (let i=0; i < openCards.length; i++) {
		if (openCards[i] === card) {
			return true;
		}
	}
	return false;
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
	setTimeout(updateDisplay, 1500);	// delay a bit before locking matched cards
}

function closeOpenCards() {
	while (openCards.length > 0) {
		let card = openCards.pop();
		card.classList.add("mismatch");
	}
	setTimeout(updateDisplay, 1500);	// delay a bit before hiding mismatched cards
}

function incrementMoveCount() {
	moveCount++;
}

function endGame() {

}

// 	initialize the array of symbols
function initializeAllSymbols() {
	for (let i=0; i<CARD_SYMBOLS.length; i++) {
		allSymbols[2*i] = CARD_SYMBOLS[i];		// use each name twice to make pairs
		allSymbols[2*i+1] = CARD_SYMBOLS[i];
	}
}

// set the html for the card icons based on the shuffled symbol array
function setCardIconHtml() {
	// get array of cards (list items that are childre of "deck")
	const deck = document.querySelector('.deck');
	const cards = deck.children;

	// remove HTML icons from each card and add new ones
	for (let i=0; i<cards.length; i++) {
		const card = cards[i];
		allCards[i] = card;
		const text = allSymbols[i];		// we use each name twice to make pairs
		const icon = card.querySelector("i");
		icon.remove();
		card.insertAdjacentHTML("afterbegin", "<i class='" + "fa fa-" + text  + "'>" );
	}
}

// restart the game: shuffle the deck and reset the cards' icon HTML
function restartGame() {
	moveCount = 0;
	openCards = [];
	lockedCards = [];
	allSymbols = shuffle(allSymbols);
	setCardIconHtml();
	updateDisplay();
}

function clearDisplayClasses() {
	// loop through all cards in our shuffled array, clear all display classes
	for (let i=0; i<allCards.length; i++) {
		const card = allCards[i];
		const classList = card.classList;
		classList.remove("open");
		classList.remove("locked");
		classList.remove("match");
		classList.remove("mismatch");
	}
}

function setDisplayClass(array, className) {
	// loop through all cards in an array, set class
	for (let i=0; i<array.length; i++) {
		const card = array[i];
		const classList = card.classList;
		classList.add(className);
	}
}

function updateScorePanel() {
	let moves = document.querySelector(".moves");
	moves.textContent = moveCount.toString();
}

// update the display of cards
function updateDisplay() {
	clearDisplayClasses();
	setDisplayClass(openCards,"open");
	setDisplayClass(lockedCards,"locked");
	updateScorePanel();
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

/*
 * set up the event listener for a card. If a card is clicked:
 *  - display the card's symbol (put this functionality in another function that you call from this one)
 *  - add the card to a *list* of "open" cards (put this functionality in another function that you call from this one)
 *  - if the list already has another card, check to see if the two cards match
 *    + if the cards do match, lock the cards in the open position (put this functionality in another function that you call from this one)
 *    + if the cards do not match, remove the cards from the list and hide the card's symbol (put this functionality in another function that you call from this one)
 *    + increment the move counter and display it on the page (put this functionality in another function that you call from this one)
 *    + if all cards have matched, display a message with the final score (put this functionality in another function that you call from this one)
 */
