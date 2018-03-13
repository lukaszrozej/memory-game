let processingClick = false;
let previousCard = undefined;
let numberOfMoves = 0;
let numberOfCards = 8;
let numberOfMatched = 0;

const cards = document.querySelectorAll('.card');

const movesCounter = document.querySelector('.moves-counter');
const stars = document.querySelectorAll('.star');
const winModal = document.querySelector('.modal');
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
    const cardId = decks[1].cards[order[i]];
    cards[i].dataset.card = order[i].toString();
    cards[i].innerHTML = `
      <div class="back">
        <svg class="icon">
          <use xlink:href="svg/sprites.svg#question-mark"></use>
        </svg>
      </div>
      <div class="front">
        <svg class="icon">
          <use xlink:href="svg/sprites.svg#${cardId}"></use>
        </svg>
      </div>`;
  }
}

function initGame() {
  if (processingClick) return;
  const order = generateRandomOrder(numberOfCards)
  dealCards(order);

  previousCard = undefined;
  numberOfMoves = 0;
  numberOfCards = 8;
  numberOfMatched = 0;

  timer.stop();
  timer.reset();
  updateScorePanel(numberOfMoves);
}

initGame();

function addDecksToChooseModal(decks) {
  const fragment = document.createDocumentFragment();
  decks.forEach(function(deck, index) {
    const option = document.createElement('option');
    option.value = index;
    option.textContent = deck.name;
    fragment.appendChild(option);
  });
  document.querySelector('.decks').appendChild(fragment);
}

addDecksToChooseModal(decks);

document.querySelector('.decks').addEventListener('change', function(event) {
  console.log(this.value);
})

playAgainButton.addEventListener('click', function() {
  winModal.classList.add('choose');
});

document.querySelector('.play').addEventListener('click', function() {
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
  return new Promise(function(resolve) {
    function handleAnimationEnd(event) {
      card.removeEventListener('animationend', handleAnimationEnd);
      resolve();
    }
    card.addEventListener('animationend', handleAnimationEnd);
    card.classList.add('matched');
  });
}

function signalNoMatch(card) {
  return new Promise(function(resolve) {
    function handleAnimationEnd(event) {
      card.removeEventListener('animationend', handleAnimationEnd);
      card.classList.remove('not-matched');
      resolve();
    }
    card.addEventListener('animationend', handleAnimationEnd);
    card.classList.add('not-matched');
  });
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

function updateScorePanel(numberOfMoves) {
  movesCounter.textContent = numberOfMoves;
  const numberOfStars = starsFromMoves(numberOfMoves);
  if (numberOfStars === 3) {
    stars.forEach(star => star.classList.remove('lost'));
    return;
  }
  stars[numberOfStars].classList.add('lost');
}

function showWinMessage() {
  finalMovesSpan.textContent = numberOfMoves.toString();
  finalStarsSpan.textContent = starsFromMoves(numberOfMoves).toString();
  finalTime.textContent = timer.value().toString();
  winModal.classList.add('show');
}

function hideWinMessage() {
  winModal.classList.remove('show');
}

table.addEventListener('click', async function(event) {
  const currentCard = event.target.closest('.card');
  if (!currentCard || cardIsFlipped(currentCard) || processingClick) return;

  processingClick = true;
  if (!timer.isRunning()) {
    timer.start();
  }

  await showCard(currentCard);
  if (previousCard) {
    if (cardsMatch(currentCard, previousCard)) {
      numberOfMatched++;
      await Promise.all([
        markAsMatched(currentCard),
        markAsMatched(previousCard)
      ]);
      if (numberOfMatched === numberOfCards) {
        timer.stop();
        showWinMessage();
      }
    } else {
      await Promise.all([
        signalNoMatch(currentCard),
        signalNoMatch(previousCard)
      ]);
      hideCard(currentCard);
      hideCard(previousCard);
    }
    previousCard = undefined;
  } else {
    previousCard = currentCard;
    numberOfMoves++;
    updateScorePanel(numberOfMoves);
  }
  processingClick = false;
});