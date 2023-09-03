// import dbClient from './utils/db';

// const waitConnection = () => new Promise((resolve, reject) => {
//   let i = 0;
//   const repeatFct = async () => {
//     await setTimeout(() => {
//       i += 1;
//       if (i >= 10) {
//         reject();
//       } else if (!dbClient.isAlive()) {
//         repeatFct();
//       } else {
//         resolve();
//       }
//     }, 1000);
//   };
//   repeatFct();
// });

// (async () => {
//   console.log(dbClient.isAlive());
//   await waitConnection();
//   console.log(dbClient.isAlive());
//   console.log(await dbClient.nbUsers());
//   console.log(await dbClient.nbFiles());
// })();
// const hexdigit = '5f1e8896c7ba06511e683b25';
// const checkDigit = /[0-9a-fA-F]{6}/g;
// console.log(checkDigit.test('5ed456ght567345gj6523gt'));
