document.addEventListener('DOMContentLoaded', function() {
    fetch('https://api.render.com/deploy/srv-cqqvurjqf0us7392ui7g?key=uZ52aI91gCc', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    .then(response => response.json())
    .then(data => {
      console.log(data);
      // handle the data
    })
    .catch(error => console.error('Error:', error));
  });
  