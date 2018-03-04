let gameHasStarted = false;
let previousCard = undefined;
let numberOfMoves = 0;
let numberOfStars = 3;
let numberOfCards = 8;
let numberOfMatched = 0;

const cards = document.querySelectorAll('.card');

const movesCounter = document.querySelector('.moves-counter');
const stars = document.querySelectorAll('.star');
const winModal = document.querySelector('.win');
const finalMovesSpan = document.querySelector('.final-moves');
const finalStarsSpan = document.querySelector('.final-stars');
const playAgainButton = document.querySelector('.play-again');

function initializeTimer(element) {
  let startTime = 0;
  let elapsedTime = 0;
  let intervalId;

  function display() {
      element.textContent = Math.round((Date.now() - startTime) / 1000).toString();
  }

  return {
    start() {
      startTime = Date.now();
      intervalId = setInterval(display, 1000);
    },

    stop() {
      clearInterval(intervalId);
      elapsedTime = Math.round((Date.now() - startTime) / 1000);
      element.textContent = elapsedTime.toString();
    },

    reset() {
      element.textContent = '0';
    },

    value() {
      return elapsedTime;
    }
  };
}

const timer = initializeTimer(document.querySelector('.time'));

function generateRandomOrder(n) {
  const order = [...Array(n).keys(), ...Array(n).keys()];
  // shuffle:
  for(let i = order.length-1; i > 0; i--) {
    const j = Math.floor(Math.random() * i);
    const temp = order[i];
    order[i] = order[j];
    order[j] = temp;
  }

  return order;
}

function dealCards(order) {
  for(let i = 0; i < order.length; i++) {
    hideCard(cards[i]);
    cards[i].dataset.card = order[i].toString();
    cards[i].textContent = order[i].toString();
  }
}

function initGame() {
  const order = generateRandomOrder(numberOfCards)
  dealCards(order);

  gameHasStarted = false;
  previousCard = undefined;
  numberOfMoves = 0;
  numberOfStars = 3;
  numberOfCards = 8;
  numberOfMatched = 0;

  timer.reset();
  updateStars();
  updateScorePanel();
}

playAgainButton.addEventListener('click', function() {
  initGame();
  hideWinMessage();
});

function isCard(element) {
  return element.classList.contains('card');
}

function showCard(card) {
  card.classList.add('show');
}

function hideCard(card, options = {delay: false}) {
  if (options.delay) {
    setTimeout(function() {
      card.classList.remove('show', 'matched');
    }, 1000);
  } else {
    card.classList.remove('show', 'matched');
  }
}

function markAsMatched(card) {
  card.classList.add('matched');
}

function cardIsMatched(card) {
  return card.classList.contains('matched');
}

function cardsMatch(card1, card2) {
  return card1.dataset.card === card2.dataset.card;
}

function starsFromMoves(numberOfMoves) {
  const tresholds = [3, 6, 9];
  let i;
  for(i = 0; i < tresholds.length; i++) {
    if (numberOfMoves < tresholds[i]) break;
  }
  return 3 - i;
}

function updateStars() {
  numberOfStars = starsFromMoves(numberOfMoves);
  if (numberOfStars === 3) {
    stars.forEach(star => star.classList.remove('lost'));
    return;
  }
  stars[numberOfStars].classList.add('lost');
}

function updateScorePanel() {
  movesCounter.textContent = numberOfMoves;
}

function showWinMessage() {
  finalMovesSpan.textContent = numberOfMoves.toString();
  finalStarsSpan.textContent = numberOfStars.toString();
  winModal.classList.add('show');
}

function hideWinMessage() {
  winModal.classList.remove('show');
}

const table = document.querySelector('.table');

table.addEventListener('click', function(event) {
  const currentCard = event.target;
  if (!isCard(currentCard)) return;
  if (cardIsMatched(currentCard)) return;

  if (!gameHasStarted) {
    gameHasStarted = true;
    timer.start();
  }

  showCard(currentCard);
  if (previousCard) {
    if (cardsMatch(currentCard, previousCard)) {
      markAsMatched(currentCard);
      markAsMatched(previousCard);
      numberOfMatched++;
    } else {
      hideCard(currentCard, {delay: true});
      hideCard(previousCard, {delay: true});
    }
    previousCard = undefined;
  } else {
    previousCard = currentCard;
    numberOfMoves++;
    updateScorePanel();
    updateStars();
  }
  if (numberOfMatched === numberOfCards) {
    timer.stop();
    showWinMessage();
  }
});