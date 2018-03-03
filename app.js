let previousCard = undefined;

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

function cardsMatch(card1, card2) {
  return card1.dataset.card === card2.dataset.card;
}

const table = document.querySelector('.table');

table.addEventListener('click', function(event) {
  if (event.target.nodeName === 'LI') {
    const currentCard = event.target;
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
    }
  }
});