let previousCard = undefined;
let numberOfMoves = 0;

const movesCounter = document.querySelector('.moves-counter');
const stars = document.querySelectorAll('.star');

function isCard(element) {
  return element.classList.contains('card');
}

function showCard(card) {
  card.classList.add('show');
}

function hideCard(card) {
  setTimeout(function() {
    card.classList.remove('show');
  }, 1000);
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
  const numberOfStars = starsFromMoves(numberOfMoves);
  if (numberOfStars > 2) return;
  stars[numberOfStars].classList.add('lost');
}

function updateScorePanel() {
  movesCounter.textContent = numberOfMoves;
}

const table = document.querySelector('.table');

table.addEventListener('click', function(event) {
  const currentCard = event.target;
  if (!isCard(currentCard)) return;
  if (cardIsMatched(currentCard)) return;
  showCard(currentCard);
  if (previousCard) {
    if (cardsMatch(currentCard, previousCard)) {
      markAsMatched(currentCard);
      markAsMatched(previousCard);
    } else {
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
});