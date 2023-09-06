import { expect } from 'chai';
import request from 'request';

describe('test for uploading files: error responses', () => {
  it('should return 400 error for missing file name', (done) => {
    request(
      {
        method: 'POST',
        uri: 'http://0.0.0.0:5000/files',
        body: JSON.stringify({}),
        headers: {
          'Content-Type': 'application/json',
          'X-Token': 'ea27e888-981e-4028-8a7a-b0908aa2fd22',
        },
      },
      (error, response, body) => {
        expect(response.statusCode).to.be.equal(400);
        expect(JSON.parse(body)).to.deep.equal({ error: 'Missing name' });
        done();
      },
    );
  });

  it('should return 400 error for missing file type', (done) => {
    request(
      {
        method: 'POST',
        uri: 'http://0.0.0.0:5000/files',
        body: JSON.stringify({ name: 'testfile' }),
        headers: {
          'Content-Type': 'application/json',
          'X-Token': 'ea27e888-981e-4028-8a7a-b0908aa2fd22',
        },
      },
      (error, response, body) => {
        expect(response.statusCode).to.be.equal(400);
        expect(JSON.parse(body)).to.deep.equal({ error: 'Missing type' });
        done();
      },
    );
  });

  it('should return 400 error for missing file type: wrong file type', (done) => {
    request(
      {
        method: 'POST',
        uri: 'http://0.0.0.0:5000/files',
        body: JSON.stringify({ name: 'testfile', type: 'video' }),
        headers: {
          'Content-Type': 'application/json',
          'X-Token': 'ea27e888-981e-4028-8a7a-b0908aa2fd22',
        },
      },
      (error, response, body) => {
        expect(response.statusCode).to.be.equal(400);
        expect(JSON.parse(body)).to.deep.equal({ error: 'Missing type' });
        done();
      },
    );
  });

  it('should return 400 error for missing data for types other than folder', (done) => {
    request(
      {
        method: 'POST',
        uri: 'http://0.0.0.0:5000/files',
        body: JSON.stringify({ name: 'testfile', type: 'file' }),
        headers: {
          'Content-Type': 'application/json',
          'X-Token': 'ea27e888-981e-4028-8a7a-b0908aa2fd22',
        },
      },
      (error, response, body) => {
        expect(response.statusCode).to.be.equal(400);
        expect(JSON.parse(body)).to.deep.equal({ error: 'Missing data' });
        done();
      },
    );
  });

  it('should return 400 error for parent not a folder', (done) => {
    request(
      {
        method: 'POST',
        uri: 'http://0.0.0.0:5000/files',
        body: JSON.stringify({
          name: 'testfile',
          type: 'file',
          data: 'SGVsbG8gV2Vic3RhY2shCg==',
          parentId: '64f27b3edba25b56897630bd'
        }),
        headers: {
          'Content-Type': 'application/json',
          'X-Token': 'ea27e888-981e-4028-8a7a-b0908aa2fd22',
        },
      },
      (error, response, body) => {
        expect(response.statusCode).to.be.equal(400);
        expect(JSON.parse(body)).to.deep.equal({ error: 'Parent is not a folder' });
        done();
      },
    );
  })
});

describe('test for creating a new file: success', () => {
  it('should return 201 success code', (done) => {
    request(
      {
        method: 'POST',
        uri: 'http://0.0.0.0:5000/files',
        body: JSON.stringify({
          name: 'testfile',
          type: 'file',
          data: 'SGVsbG8gV2Vic3RhY2shCg==',
        }),
        headers: {
          'Content-Type': 'application/json',
          'X-Token': 'ea27e888-981e-4028-8a7a-b0908aa2fd22',
        },
      },
      (error, response, body) => {
        expect(response.statusCode).to.be.equal(201);
        expect(JSON.parse(body)).to.haveOwnProperty('id');
        expect(JSON.parse(body)).to.haveOwnProperty('userId');
        expect(JSON.parse(body)).to.haveOwnProperty('name');
        expect(JSON.parse(body)).to.haveOwnProperty('type');
        expect(JSON.parse(body).isPublic).to.deep.equal(false);
        expect(JSON.parse(body).parentId).to.deep.equal(0);
        done();
      },
    );
  });

  it('should test a file is retrieved', (done) => {
    request(
      {
        method: 'GET',
        uri: 'http://0.0.0.0:5000/files/64f85856955982229a088741',
        headers: {
          'X-Token': 'ea27e888-981e-4028-8a7a-b0908aa2fd22',
        },
      },
      (error, response, body) => {
        expect(response.statusCode).to.be.equal(200);
        expect(JSON.parse(body)).to.haveOwnProperty('id');
        expect(JSON.parse(body).id).to.deep.equal('64f85856955982229a088741');
        expect(JSON.parse(body)).to.haveOwnProperty('userId');
        expect(JSON.parse(body)).to.haveOwnProperty('name');
        expect(JSON.parse(body)).to.haveOwnProperty('type');
        expect(JSON.parse(body)).to.haveOwnProperty('parentId');
        expect(JSON.parse(body)).to.haveOwnProperty('isPublic');
        done();
      },
    );
  })

  it('should test files retrieved belong to a user and an array is returned', (done) => {
    request(
      {
        method: 'GET',
        uri: 'http://0.0.0.0:5000/files/',
        headers: {
          'X-Token': 'ea27e888-981e-4028-8a7a-b0908aa2fd22',
        },
      },
      (error, response, body) => {
        expect(response.statusCode).to.be.equal(200);
        expect(JSON.parse(body)).to.be.an('array');
        done();
      },
    );
  });

  it('should test for pagination: an empty array is returned', (done) => {
    request(
      {
        method: 'GET',
        uri: 'http://0.0.0.0:5000/files/?page=1',
        headers: {
          'X-Token': 'ea27e888-981e-4028-8a7a-b0908aa2fd22',
        },
      },
      (error, response, body) => {
        expect(response.statusCode).to.be.equal(200);
        expect(JSON.parse(body)).to.be.an('array').to.have.lengthOf(0);
        done();
      },
    );
  });
});

describe('test for publishing and unpublishing files', () => {
  it('should test that a file is published successfully', (done) => {
    request(
      {
        method: 'PUT',
        uri: 'http://0.0.0.0:5000/files/64f85856955982229a088741/publish',
        headers: {
          'X-Token': 'ea27e888-981e-4028-8a7a-b0908aa2fd22',
        },
      },
      (error, response, body) => {
        expect(response.statusCode).to.be.equal(200);
        expect(JSON.parse(body).isPublic).to.deep.equal(true);
        done();
      },
    );
  });

  it('should test that a file is unpublished successfully', (done) => {
    request(
      {
        method: 'PUT',
        uri: 'http://0.0.0.0:5000/files/64f85856955982229a088741/unpublish',
        headers: {
          'X-Token': 'ea27e888-981e-4028-8a7a-b0908aa2fd22',
        },
      },
      (error, response, body) => {
        expect(response.statusCode).to.be.equal(200);
        expect(JSON.parse(body).isPublic).to.deep.equal(false);
        done();
      },
    );
  });
})
