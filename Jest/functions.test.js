const functions = require('./functions');
const pvd = require('@philly/pvd/src/main');

test('Adds 2 + 2 to equal 4', () => {
  expect(functions.add(2,2)).toBe(4);
});

test('Should be null', () => {
  expect(functions.isNull()).toBeNull();
});

test('Should be falsy', () => {
  expect(functions.checkValue(null)).toBeFalsy();
});

// Working with async data
// test('User fetched name should be Leanne Graham', () => {
//   console.log('in testtttt, functions.fetchUser');
//   functions.fetchUser()//.then(function(){
//   //   console.log('testtesttesttest')
//   // });
//   // expect.assertions(1);
//   // return functions.fetchUser()
//   //   .then(data => {
//   //     expect(data.name).toEqual('Leanne Graham');
//   //   })
// });
