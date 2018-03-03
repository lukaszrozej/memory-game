const table = document.querySelector('.table');

table.addEventListener('click', function(event) {
  if (event.target.nodeName === 'LI') {
    const card = event.target;
    console.log('Card was clicked', card);
  }
});