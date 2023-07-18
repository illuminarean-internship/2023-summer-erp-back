import mongoose from 'mongoose';
import request from 'supertest';
import httpStatus from 'http-status';
import chai, { expect } from 'chai';
import app from '../../app.js';
import config from '../config/env.js';
import User from './user.model.js';

chai.config.includeStack = true;

const userData = {
  username: 'user',
  mobileNumber: '1234567890'
};

describe('## User APIs', () => {
  before(async () => {
    if (mongoose.connection.readyState) await mongoose.disconnect();
    await mongoose.connect(config.mongo.testHost);
  });

  beforeEach(async () => {
    const { username, mobileNumber } = userData;
    const user = new User({ username, mobileNumber });
    const savedUser = await user.save();
    const { _id } = savedUser;
    userData._id = _id;
  });

  after(async () => {
    mongoose.models = {};
    mongoose.modelSchemas = {};
    if (mongoose.connection.db) await mongoose.connection.db.dropDatabase();
    if (mongoose.connection.readyState) await mongoose.disconnect();
  });

  afterEach(async () => {
    if (mongoose.connection.db) await mongoose.connection.db.dropDatabase();
  });

  describe('# POST /api/users', () => {
    it('should create a new user', (done) => {
      const { username, mobileNumber } = userData;
      request(app)
        .post('/api/users')
        .send({ username, mobileNumber })
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.username).to.equal(username);
          expect(res.body.mobileNumber).to.equal(mobileNumber);
          done();
        })
        .catch(done);
    });
  });

  describe('# GET /api/users/:userId', () => {
    it('should get user details', (done) => {
      request(app)
        .get(`/api/users/${userData._id}`)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.username).to.equal(userData.username);
          expect(res.body.mobileNumber).to.equal(userData.mobileNumber);
          done();
        })
        .catch(done);
    });

    it('should report error with message - Not found, when user does not exists', (done) => {
      request(app)
        .get('/api/users/56c787ccc67fc16ccc1a5e92')
        .expect(httpStatus.NOT_FOUND)
        .then((res) => {
          expect(res.body.message).to.equal('No such user exists!');
          done();
        })
        .catch(done);
    });
  });

  describe('# PUT /api/users/:userId', () => {
    it('should update user details', (done) => {
      request(app)
        .put(`/api/users/${userData._id}`)
        .send({ username: 'user1', mobileNumber: '1111111111' })
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.matchedCount).to.equal(1);
          expect(res.body.modifiedCount).to.equal(1);
          done();
        })
        .catch(done);
    });
  });

  describe('# GET /api/users/', () => {
    it('should get all users', (done) => {
      request(app)
        .get('/api/users')
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body).to.be.an('array');
          done();
        })
        .catch(done);
    });

    it('should get all users (with limit and skip)', (done) => {
      request(app)
        .get('/api/users')
        .query({ limit: 10, skip: 1 })
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body).to.be.an('array');
          done();
        })
        .catch(done);
    });
  });

  describe('# DELETE /api/users/', () => {
    it('should delete user', (done) => {
      request(app)
        .delete(`/api/users/${userData._id}`)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.deletedCount).to.equal(1);
          done();
        })
        .catch(done);
    });
  });
});
