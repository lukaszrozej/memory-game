function startApp(decks) {

  //-----------------------------------------------------------------------------
  // DOM elements

  // Main screen buttons
  const $restartBtn = document.querySelector('.restart-btn')
  const $helpBtn = document.querySelector('.help-btn')

  // Score panel
  const $movesCounter = document.querySelector('.moves-counter');
  const $stars = document.querySelectorAll('.star');
  const $table = document.querySelector('.table');

  // Modal
  const $modal = document.querySelector('.modal');

  // Win message elements
  const $finalMoves = document.querySelector('.final-moves');
  const $finalStars = document.querySelector('.final-stars');
  const $finalTime = document.querySelector('.final-time');

  // Decks select
  const $decks = document.querySelector('.decks');

  // Button in modal
  const $playAgainBtn = document.querySelector('.play-again-btn')
  const $playBtn = document.querySelector('.play-btn')
  const $resumeBtn = document.querySelector('.resume-btn')
  const $chooseADeckBtn = document.querySelector('.choose-a-deck-btn')

  //-----------------------------------------------------------------------------
  // App state variables

  // Represents currently played game
  let game;

  // Currently displayed modal section
  let currentSection = 'help';

  const timer = initializeTimer(document.querySelector('.time'));

  //-----------------------------------------------------------------------------
  // Helper functions

  // Taken from https://stackoverflow.com/a/39914235/2897430
  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  function starsFromMoves(numberOfMoves) {
    const tresholds = [13, 17, 21];
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

  function updateWinMessage(numberOfMoves) {
    $finalMoves.textContent = numberOfMoves.toString();
    $finalStars.textContent = starsFromMoves(numberOfMoves).toString();
    $finalTime.textContent = timer.value().toString();
  }

  // The show function uses await sleep
  // to let the browser change class from currentSection to section
  // and change modal's left position accordingly
  // so that when show class is added
  // transition is applied only to top position
  async function showModal(section) {
    // What should receive focus in each section
    const focusElement = {
      win: $playAgainBtn,
      choose: $decks,
      help: $resumeBtn
    };
    $modal.classList.remove(currentSection);
    $modal.classList.add(section);
    currentSection = section
    if (!$modal.classList.contains('show')) {
      await sleep(200);
      $modal.classList.add('show');
    }
    focusElement[section].focus();
  }

  $decks.innerHTML =
    decks
      .map( (deck, index) => `<option value="${index}">${deck.name}</option>`)
      .join('/n');
  updateSampleCards();

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


  $restartBtn.addEventListener('click', function() {
    showModal('choose');
  });

  $helpBtn.addEventListener('click', function() {
    timer.pause();
    showModal('help');
  });

  $decks.addEventListener('change', function(event) {
    updateSampleCards();
  });

  $modal.addEventListener('click', function(event) {
    switch(event.target) {
      case $chooseADeckBtn:
        $chooseADeckBtn.classList.add('inactive');
        $resumeBtn.classList.remove('inactive');
      case $playAgainBtn:
        showModal('choose');
        break;
      case $playBtn:
        if (game) {
          game.stop();
        }
        game = newGame();
        $modal.classList.remove('show');
        break;
      case $resumeBtn:
        $modal.classList.remove('show');
        timer.resume();
    }
  });


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
      const numberOfStars = starsFromMoves(numberOfMoves);
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
            updateWinMessage(numberOfMoves);
            showModal('win');
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
}

startApp(decks);
