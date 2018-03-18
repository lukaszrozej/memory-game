//-----------------------------------------------------------------------------
// DOM elements

const $movesCounter = document.querySelector('.moves-counter');
const $stars = document.querySelectorAll('.star');
const $modal = document.querySelector('.modal');
const $finalMoves = document.querySelector('.final-moves');
const $finalStars = document.querySelector('.final-stars');
const $finalTime = document.querySelector('.final-time');
const $table = document.querySelector('.table');
const $decks = document.querySelector('.decks');
// Buttons:
const $playAgain = document.querySelector('.play-again')
const $resume = document.querySelector('.resume')
const $chooseADeck = document.querySelector('.choose-a-deck')

// It's used to control which button is displayed in help modal
let $buttonInHelpModal = $chooseADeck;

//-----------------------------------------------------------------------------
// Timer

function initializeTimer(element) {
  let startTime = 0;
  let elapsedTime = 0;
  let intervalId;
  let running = false;
  let paused = false;
  let pauseStart;
  let totalPausedTime = 0;

  function display() {
    if (paused) return;
    element.textContent = Math.round((Date.now() - startTime - totalPausedTime) / 1000).toString();
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

    pause() {
      paused = true;
      pauseStart = Date.now();
    },

    resume() {
      totalPausedTime += Date.now() - pauseStart;
      paused = false;
    },

    stop() {
      clearInterval(intervalId);
      running = false;
      elapsedTime = Math.round((Date.now() - startTime - totalPausedTime) / 1000);
      element.textContent = elapsedTime.toString();
    },

    reset() {
      clearInterval(intervalId);
      running = false;
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

function $starsFromMoves(numberOfMoves) {
  const tresholds = [3, 6, 9];
  let i;
  for(i = 0; i < tresholds.length; i++) {
    if (numberOfMoves < tresholds[i]) break;
  }
  return 3 - i;
}

//-----------------------------------------------------------------------------
// Modal

function updateSampleCards() {
  const deckNumber = $decks.value;
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

function initializeModal(decks) {
  $decks.innerHTML =
    decks
      .map( (deck, index) => `<option value="${index}">${deck.name}</option>`)
      .join('/n');
  updateSampleCards();
}

$decks.addEventListener('change', function(event) {
  updateSampleCards();
})

document.querySelector('.play-again').addEventListener('click', function() {
  $modal.classList.add('choose');
  $decks.focus();
});

document.querySelector('.play').addEventListener('click', function() {
  game.stop();
  game = newGame();
  $modal.classList.remove('show');
});

// The following functions use await sleep
// to wait until browser toggles 'choose' class
// and changes 'left' in css accordingly
// so that transition is applied only to top,
// not both to top and left

document.querySelector('.restart').addEventListener('click', async function() {
  $modal.classList.add('choose');
  await sleep(200);
  $modal.classList.add('show');
  $decks.focus();
});

$chooseADeck.addEventListener('click', async function() {
  $chooseADeck.classList.add('inactive');
  $resume.classList.remove('inactive');
  $buttonInHelpModal = $resume;

  $modal.classList.remove('help');
  $modal.classList.add('choose');
  await sleep(200);
  $modal.classList.add('show');
  $decks.focus();
});

$resume.addEventListener('click', function() {
  $modal.classList.remove('show');
  timer.resume();
});

async function showWinMessage(numberOfMoves) {
  $finalMoves.textContent = numberOfMoves.toString();
  $finalStars.textContent = $starsFromMoves(numberOfMoves).toString();
  $finalTime.textContent = timer.value().toString();
  $modal.classList.remove('choose');
  await sleep(200);
  $modal.classList.add('show');
  document.querySelector('.play-again').focus();
}

async function showHelp() {
  timer.pause();
  $modal.classList.remove('choose');
  $modal.classList.add('help');
  await sleep(200);
  $modal.classList.add('show');
  $buttonInHelpModal.focus();
}

//-----------------------------------------------------------------------------
// Game

function newGame() {

  const numberOfCards = 8;

  const openCards = [];
  let numberOfCLicks = 0;
  let numberOfMoves = 0;
  let numberOfMatched = 0;

  // Shuffle:
  const order = [...Array(numberOfCards).keys(), ...Array(numberOfCards).keys()];
  for(let i = order.length-1; i > 0; i--) {
    const j = Math.floor(Math.random() * i);
    [order[i], order[j]] = [order[j], order[i]];
  }
  // Deal:
  const deckNumber = $decks.value;
  $table.innerHTML = order
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


  function updateScore() {
    $movesCounter.textContent = numberOfMoves;
    const numberOfStars = $starsFromMoves(numberOfMoves);
    if (numberOfStars === 3) {
      $stars.forEach(star => star.classList.remove('lost'));
      return;
    }
    $stars[numberOfStars].classList.add('lost');
  }

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
      currentCard.show();
    }
  };

  $table.addEventListener('click', clickHandler);

  return { 
    stop() {
      // To avoid memory leaks
      $table.removeEventListener('click', clickHandler);
    }
  };
}

initializeModal(decks);
let game = newGame();