//Main.js 

//Wait for DOM to be completely loaded
document.addEventListener('DOMContentLoaded', function() {
    //Send a GET request to the particular URL
    fetch('rnd_krs9nJgzT7WPsAEeas0EXIM26LHX', {
      method: 'GET',
      headers: {
          //Format of request
        'Content-Type': 'application/json',
      },
    })
    //JSON response
    .then(response => response.json())
    .then(data => {
      console.log(data);
      // handle the data
    })
    //error handling for log errors
    .catch(error => console.error('Error:', error));

    //Post request to same URL
    fetch('rnd_krs9nJgzT7WPsAEeas0EXIM26LHX', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
        //Convert data to JSON and add it into the request body
      body: JSON.stringify({ key: 'value' })
    })
        //Parse response
    .then(response => response.json())
    .then(data => {
      console.log(data);
      // handle the data
    })
        //error handling
    .catch(error => console.error('Error:', error));
  });
