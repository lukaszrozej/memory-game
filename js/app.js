const movesCounter = document.querySelector('.moves-counter');
const stars = document.querySelectorAll('.star');
const winModal = document.querySelector('.modal');
const finalMovesSpan = document.querySelector('.final-moves');
const finalStarsSpan = document.querySelector('.final-stars');
const finalTime = document.querySelector('.final-time');
const table = document.querySelector('.table');

//-----------------------------------------------------------------------------
// Timer

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

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

//-----------------------------------------------------------------------------
// Cards

function getCard(event) {
  const card = event.target.closest('.card');
  if (!card) return undefined;

  return {    
    show() {
      return new Promise(function(resolve) {
        function handleTransisionEnd(event) {
          card.removeEventListener('transitionend', handleTransisionEnd);
          resolve();
        }
        card.addEventListener('transitionend', handleTransisionEnd);
        card.classList.add('show');
      });
    },

    hide() {
      card.classList.remove('show', 'not-matched', 'matched');
    },

    markAs(status) {
      return new Promise(function(resolve) {
        function handleAnimationEnd(event) {
          card.removeEventListener('animationend', handleAnimationEnd);
          resolve();
        }
        card.addEventListener('animationend', handleAnimationEnd);
        card.classList.add(status);
      });
    },

    id() {
      return card.dataset.card;
    },

    isFlipped() {
      return card.classList.contains('show');
    }
  }
}

function starsFromMoves(numberOfMoves) {
  const tresholds = [3, 6, 9];
  let i;
  for(i = 0; i < tresholds.length; i++) {
    if (numberOfMoves < tresholds[i]) break;
  }
  return 3 - i;
}

//-----------------------------------------------------------------------------
// Modal

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

function updateSampleCards() {
  const deckNumber = document.querySelector('.decks').value;
  document.querySelector('.sample-cards').innerHTML = 
    decks[deckNumber]
      .cards
      .slice(0,4)
      .map(card => `
        <li class="card sample show">
          <div class="front">
            <svg class="icon">
              <use xlink:href="svg/sprites.svg#${card}"></use>
            </svg>
          </div>
        </li>`)
      .join('\n');
}

updateSampleCards();

document.querySelector('.decks').addEventListener('change', function(event) {
  updateSampleCards();
})


async function showWinMessage(numberOfMoves) {
  finalMovesSpan.textContent = numberOfMoves.toString();
  finalStarsSpan.textContent = starsFromMoves(numberOfMoves).toString();
  finalTime.textContent = timer.value().toString();
  winModal.classList.remove('choose');
  await sleep(200);
  winModal.classList.add('show');
  document.querySelector('.play-again').focus();
}

function hideWinMessage() {
  winModal.classList.remove('show');
}

document.querySelector('.play-again').addEventListener('click', function() {
  winModal.classList.add('choose');
  document.querySelector('.decks').focus();
});

document.querySelector('.play').addEventListener('click', function() {
  game.stop();
  game = newGame();
  hideWinMessage();
});

document.querySelector('.restart').addEventListener('click', async function() {
  winModal.classList.add('choose');
  // Await to let the browser add 'choose' before 'show'
  // so that only top transition is applied,
  // not both top and left
  await sleep(200);
  winModal.classList.add('show');
  document.querySelector('.decks').focus();
});

//-----------------------------------------------------------------------------
// Game

function dealCards(deckNumber, numberOfCards) {
  // Shuffle:
  const order = [...Array(numberOfCards).keys(), ...Array(numberOfCards).keys()];
  for(let i = order.length-1; i > 0; i--) {
    const j = Math.floor(Math.random() * i);
    [order[i], order[j]] = [order[j], order[i]];
  }
  // Deal:
  table.innerHTML = order
    .map(cardNumber => `
      <li class="card" data-card="${cardNumber}">
        <div class="back">
          <svg class="icon">
            <use xlink:href="svg/sprites.svg#question-mark"></use>
          </svg>
        </div>
        <div class="front">
          <svg class="icon">
            <use xlink:href="svg/sprites.svg#${decks[deckNumber].cards[cardNumber]}"></use>
          </svg>
        </div>
      </li>`)
    .join('\n');
}

function newGame() {

  const numberOfCards = 8;

  const openCards = [];
  let numberOfCLicks = 0;
  let numberOfMoves = 0;
  let numberOfMatched = 0;

  dealCards(document.querySelector('.decks').value, numberOfCards);

  function updateScore() {
    movesCounter.textContent = numberOfMoves;
    const numberOfStars = starsFromMoves(numberOfMoves);
    if (numberOfStars === 3) {
      stars.forEach(star => star.classList.remove('lost'));
      return;
    }
    stars[numberOfStars].classList.add('lost');
  }

  timer.stop();
  timer.reset();
  updateScore();

  async function clickHandler(event) {
    const currentCard = getCard(event);
    if (!currentCard || currentCard.isFlipped()) return;

    if (!timer.isRunning()) {
      timer.start();
    }

    openCards.push(currentCard);
    numberOfCLicks++;

    if (numberOfCLicks % 2 === 0) {
      numberOfMoves++;
      updateScore();
      const previousCard = openCards[numberOfCLicks-2];
      if (currentCard.id() === previousCard.id()) {
        numberOfMatched++;
        await currentCard.show();
        await Promise.all([
          currentCard.markAs('matched'),
          previousCard.markAs('matched')
        ]);
        if (numberOfMatched === numberOfCards) {
          timer.stop();
          showWinMessage(numberOfMoves);
        }
      } else {
        await currentCard.show();
        await Promise.all([
          currentCard.markAs('not-matched'),
          previousCard.markAs('not-matched')
        ]);
        currentCard.hide();
        previousCard.hide();
      }
    } else {
      await currentCard.show();
    }
  };

  table.addEventListener('click', clickHandler);

  function stop() {
    table.removeEventListener('click', clickHandler);
  }

  return { stop: stop };
}

let game = newGame();