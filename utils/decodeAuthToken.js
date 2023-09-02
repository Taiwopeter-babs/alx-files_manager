/**
 * Decodes the token from the `Authorization` header key
 * @param {*} request request object
 * @returns an resolved promise object containing the decoded string
 * i.e user's `email` and `password`, otherwise an empty object
 */
export default function decodeAuthToken(request) {
  return new Promise((resolve, reject) => {
    // get `Authorization` header
    const authValue = request.get('authorization');
    if (!authValue) return reject(new Error('Header absent'));

    // get the token
    const [authType, base64Str] = authValue.split(' ');
    // console.log(authType, base64Str);
    if (authType !== 'Basic' || base64Str === '' || !base64Str) {
      return reject(new Error('Header value error'));
    }
    // extract user credentials
    const userCredentials = Buffer.from(base64Str.toString(), 'base64').toString('utf8');
    if (!userCredentials.includes(':')) {
      return reject(new Error('Header value error'));
    }
    // v
    const [email, password] = userCredentials.split(':');

    return resolve({ email, password });
  });
}
