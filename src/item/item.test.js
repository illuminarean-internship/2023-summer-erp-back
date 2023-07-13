import mongoose from 'mongoose';
import request from 'supertest';
import httpStatus from 'http-status';
import chai, { expect } from 'chai';
import app from '../../app.js';
import config from '../config/env.js';
import Item from './item.model.js';

chai.config.includeStack = true;

const itemData = {
  modelname: 'Mac1',
  SerialNumber: '1234567890'
};

before(() => {
  if (mongoose.connection.readyState) mongoose.disconnect();
  mongoose.connect(config.mongo.testHost);
});

beforeEach(async () => {
  const { modelname, SerialNumber } = itemData;
  const item = new Item({ modelname, SerialNumber });
  const savedItem = await item.save();
  const { _id } = savedItem;
  itemData._id = _id;
});

after(() => {
  mongoose.models = {};
  mongoose.modelSchemas = {};
  if (mongoose.connection.db) mongoose.connection.db.dropDatabase();
  if (mongoose.connection.readyState) mongoose.disconnect();
});

afterEach(() => {
  if (mongoose.connection.db) mongoose.connection.db.dropDatabase();
});

describe('## Item APIs', () => {
  describe('# POST /api/items', () => {
    it('should create a new item', (done) => {
      const { modelname, SerialNumber } = itemData;
      request(app)
        .post('/api/items')
        .send({ modelname, SerialNumber })
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.modelname).to.equal(modelname);
          expect(res.body.SerialNumber).to.equal(SerialNumber);
          done();
        })
        .catch(done);
    });
  });

  describe('# GET /api/items/:itemId', () => {
    it('should get item details', (done) => {
      request(app)
        .get(`/api/items/${itemData._id}`)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.modelname).to.equal(itemData.modelname);
          expect(res.body.SerialNumber).to.equal(itemData.SerialNumber);
          done();
        })
        .catch(done);
    });

    it('should report error with message - Not found, when user does not exists', (done) => {
      request(app)
        .get('/api/items/56c787ccc67fc16ccc1a5e92')
        .expect(httpStatus.NOT_FOUND)
        .then((res) => {
          expect(res.body.message).to.equal('No such user exists!');
          done();
        })
        .catch(done);
    });
  });

  describe('# PUT /api/items/:itemId', () => {
    it('should update item details', (done) => {
      request(app)
        .put(`/api/items/${itemData._id}`)
        .send({ modelname: 'Mac2', SerialNumber: '1111111111' })
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.matchedCount).to.equal(1);
          expect(res.body.modifiedCount).to.equal(1);
          done();
        })
        .catch(done);
    });
  });

  describe('# GET /api/items/', () => {
    it('should get all items', (done) => {
      request(app)
        .get('/api/items')
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body).to.be.an('array');
          done();
        })
        .catch(done);
    });

    it('should get all items (with limit and skip)', (done) => {
      request(app)
        .get('/api/items')
        .query({ limit: 10, skip: 1 })
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body).to.be.an('array');
          done();
        })
        .catch(done);
    });
  });

  describe('# DELETE /api/items/', () => {
    it('should delete item', (done) => {
      request(app)
        .delete(`/api/items/${userData._id}`)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.deletedCount).to.equal(1);
          done();
        })
        .catch(done);
    });
  });
});
