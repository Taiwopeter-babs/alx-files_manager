import { expect } from 'chai';
import request from 'request';

describe('test sign-in by generating a new access token', () => {
  it('should return 401 for unacceptable header', (done) => {
    request(
      {
        method: 'GET',
        uri: 'http://0.0.0.0:5000/connect',
        headers: {
          Authorization: 'Basi dGVzdEBlbWFpbC5jb206dGVzdHBhc3N3b3JkMg=',
        },
      },
      (error, response, body) => {
        expect(response.statusCode).to.be.equal(401);
        expect(JSON.parse(body)).to.haveOwnProperty('error');
        expect(JSON.parse(body).error).to.deep.equal('Unauthorized');
        done();
      },
    );
  });

  it('should return 200 for successful sign in', (done) => {
    request(
      {
        method: 'GET',
        uri: 'http://0.0.0.0:5000/connect',
        headers: {
          Authorization: 'Basic dGVzdEBlbWFpbC5jb206dGVzdHBhc3N3b3Jk',
        },
      },
      (error, response, body) => {
        console.log(body);
        expect(response.statusCode).to.be.equal(200);
        expect(JSON.parse(body)).to.haveOwnProperty('token');
        done();
      },
    );
  });

  it.skip('should return 204 for successful sign out/disconnection', (done) => {
    request(
      {
        method: 'GET',
        uri: 'http://0.0.0.0:5000/disconnect',
        headers: {
          'X-Token': 'ea27e888-981e-4028-8a7a-b0908aa2fd22',
        },
      },
      (error, response, body) => {
        expect(response.statusCode).to.be.equal(204);
        done();
      },
    );
  });
});
