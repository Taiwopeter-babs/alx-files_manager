import { expect } from 'chai';
import request from 'request';

describe('redis and mongodb status tests', () => {
  it('should test true responses for redis and mongodb statuses', (done) => {
    request(
      {
        method: 'GET',
        uri: 'http://0.0.0.0:5000/status',
      },
      (error, response, body) => {
        expect(response.statusCode).to.be.equal(200);
        expect(JSON.parse(body)).to.deep.equal({ redis: true, db: true });
        done();
      },
    );
  });

  it('should test the stats', (done) => {
    request(
      {
        method: 'GET',
        uri: 'http://0.0.0.0:5000/stats',
      },
      (error, response, body) => {
        expect(response.statusCode).to.be.equal(200);
        expect(JSON.parse(body)).to.haveOwnProperty('users');
        expect(JSON.parse(body)).to.haveOwnProperty('files');
        done();
      },
    );
  });
});
