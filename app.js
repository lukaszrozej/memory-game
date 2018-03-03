
function showCard(card) {
  card.classList.add('show');
}

const table = document.querySelector('.table');

table.addEventListener('click', function(event) {
  if (event.target.nodeName === 'LI') {
    const card = event.target;
    showCard(card);
    console.log('Card was clicked', card);
  }
});