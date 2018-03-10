let processingClick = false;
let isPlaying = false;
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
const finalTime = document.querySelector('.final-time');
const playAgainButton = document.querySelector('.play-again');
const restartButton = document.querySelector('.restart');
const table = document.querySelector('.table');

function initializeTimer(element) {
  let startTime = 0;
  let elapsedTime = 0;
  let intervalId;
  let running = false;

  function display() {
      element.textContent = Math.round((Date.now() - startTime) / 1000).toString();
  }

  return {
    isRunning() {
      return running;
    },

    start() {
      startTime = Date.now();
      intervalId = setInterval(display, 1000);
      running = true;
    },

    stop() {
      clearInterval(intervalId);
      running = false;
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
    const cardId = decks[0].cards[order[i]];
    cards[i].dataset.card = order[i].toString();
    cards[i].innerHTML = `
      <div class="back">
        <svg class="icon">
          <use xlink:href="svg/question-mark.svg#question-mark"></use>
        </svg>
      </div>
      <div class="front">
        <svg class="icon">
          <use xlink:href="svg/robots.svg#${cardId}"></use>
        </svg>
      </div>`;
  }
}

function initGame() {
  const order = generateRandomOrder(numberOfCards)
  dealCards(order);

  isPlaying = false;
  previousCard = undefined;
  numberOfMoves = 0;
  numberOfStars = 3;
  numberOfCards = 8;
  numberOfMatched = 0;

  timer.stop();
  timer.reset();
  updateStars();
  updateScorePanel();
}

initGame();

playAgainButton.addEventListener('click', function() {
  initGame();
  hideWinMessage();
});

restartButton.addEventListener('click', initGame);

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function showCard(card) {
  return new Promise(function(resolve) {
    function handleTransisionEnd(event) {
      card.removeEventListener('transitionend', handleTransisionEnd);
      resolve();
    }
    card.addEventListener('transitionend', handleTransisionEnd);
    card.classList.add('show');
  });
}

function hideCard(card) {
  card.classList.remove('show', 'matched');
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

function cardIsFlipped(card) {
  return card.classList.contains('show');
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
  finalTime.textContent = timer.value().toString();
  winModal.classList.add('show');
}

function hideWinMessage() {
  winModal.classList.remove('show');
}

table.addEventListener('click', async function(event) {
  const currentCard = event.target.closest('.card');
  if (!currentCard || cardIsMatched(currentCard) || processingClick) return;

  processingClick = true;
  if (!timer.isRunning()) {
    timer.start();
  }

  if (cardIsFlipped(currentCard)) return;

  await showCard(currentCard);
  if (previousCard) {
    if (cardsMatch(currentCard, previousCard)) {
      numberOfMatched++;
      markAsMatched(currentCard);
      markAsMatched(previousCard);
    } else {
      await sleep(1000);
      hideCard(currentCard);
      hideCard(previousCard);
    }
    previousCard = undefined;
  } else {
    previousCard = currentCard;
    numberOfMoves++;
    updateScorePanel();
    updateStars();
  }
  if (numberOfMatched === numberOfCards) {
    isPlaying = false;
    timer.stop();
    showWinMessage();
  }
  processingClick = false;
});