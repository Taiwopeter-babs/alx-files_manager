// import dbClient from './utils/db';
const mime = require('mime-types');
const imageThumbnail = require('image-thumbnail');

// imageThumbnail('/home/taiwop/alan.jpg', { width: 500 })
//   .then((thumbnail) => { console.log(thumbnail); });

// console.log(mime.lookup('image.js'));
const base64Code = Buffer.from('test@email.com:testpassword').toString('base64');
console.log(base64Code);

const generatedBase64 = 'dGVzdEBlbWFpbC5jb206dGVzdHBhc3N3b3Jk';
// console.log(Buffer.from(generatedBase64, 'base64').toString('utf-8'));
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
