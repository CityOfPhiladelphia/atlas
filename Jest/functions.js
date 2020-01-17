const axios = require('axios');

const functions = {
  add: (num1, num2) => num1 + num2,
  isNull: () => null,
  checkValue: (x) => x,
  fetchUser: () => {
    console.log('test running');
    axios.get('https://jsonplaceholder.typicode.com/users/1')
      .then(function(response) {
        console.log(response);
        return response;
      }
        // res => res.data
        // function() {
        //   console.log('axios did runnnnnn');
        //   return 5;
        // }
        // function(res) {
        //   console.log('axios ran:', res)
        //   return res.data;
        // }
      )
      .catch(err => 'error')
  }
}

module.exports = functions;
