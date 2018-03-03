let previousCard = undefined;
let moves = 0;

const movesCounter = document.querySelector('.moves');

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

function updateScorePanel() {
  movesCounter.textContent = moves;
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
    moves++;
    updateScorePanel();
  }
});