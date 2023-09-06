import { expect } from 'chai';
import request from 'request';

describe('test for creating a new user: error responses', () => {
  it('should return 400 error for missing email', (done) => {
    request(
      {
        method: 'POST',
        uri: 'http://0.0.0.0:5000/users',
        body: JSON.stringify({}),
        headers: {
          'Content-Type': 'application/json',
        },
      },
      (error, response, body) => {
        expect(response.statusCode).to.be.equal(400);
        expect(JSON.parse(body)).to.deep.equal({ error: 'Missing email' });
        done();
      },
    );
  });

  it('should return 400 error for missing password', (done) => {
    request(
      {
        method: 'POST',
        uri: 'http://0.0.0.0:5000/users',
        body: JSON.stringify({ email: 'test@email.com' }),
        headers: {
          'Content-Type': 'application/json',
        },
      },
      (error, response, body) => {
        expect(response.statusCode).to.be.equal(400);
        expect(JSON.parse(body)).to.deep.equal({ error: 'Missing password' });
        done();
      },
    );
  })
});

describe('test for creating a new user: success', () => {
  // this test is expected to fail; user already exists
  it.skip('should return 201 new user', (done) => {
    request(
      {
        method: 'POST',
        uri: 'http://0.0.0.0:5000/users',
        body: JSON.stringify({ email: 'test@email.com', password: 'testpassword' }),
        headers: {
          'Content-Type': 'application/json',
        },
      },
      (error, response, body) => {
        expect(response.statusCode).to.be.equal(201);
        expect(JSON.parse(body)).to.haveOwnProperty('id');
        expect(JSON.parse(body)).to.haveOwnProperty('email');
        expect(JSON.parse(body).email).to.deep.equal('test@email.com');
        done();
      },
    );
  });

  it('should return 400 error for existing user', (done) => {
    request(
      {
        method: 'POST',
        uri: 'http://0.0.0.0:5000/users',
        body: JSON.stringify({ email: 'test@email.com', password: 'testpassword2' }),
        headers: {
          'Content-Type': 'application/json',
        },
      },
      (error, response, body) => {
        expect(response.statusCode).to.be.equal(400);
        expect(JSON.parse(body)).to.deep.equal({ error: 'Already exist' });
        done();
      },
    );
  })
});

describe('test request for user', () => {
  it('should return code 200 with email and id in response', (done) => {
    request(
      {
        method: 'GET',
        uri: 'http://0.0.0.0:5000/users/me',
        headers: {
          'X-Token': 'ea27e888-981e-4028-8a7a-b0908aa2fd22',
        },
      },
      (error, response, body) => {
        expect(response.statusCode).to.be.equal(200);
        expect(JSON.parse(body)).to.haveOwnProperty('id');
        expect(JSON.parse(body)).to.haveOwnProperty('email');
        done();
      },
    );
  })
})
