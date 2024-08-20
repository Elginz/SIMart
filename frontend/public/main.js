document.addEventListener('DOMContentLoaded', function() {
    fetch('rnd_krs9nJgzT7WPsAEeas0EXIM26LHX', {
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

    fetch('rnd_krs9nJgzT7WPsAEeas0EXIM26LHX', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ key: 'value' })
    })
    .then(response => response.json())
    .then(data => {
      console.log(data);
      // handle the data
    })
    .catch(error => console.error('Error:', error));

  });
