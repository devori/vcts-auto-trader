import express from 'express';
import bodyParser from 'body-parser';
import supertest from 'supertest';
import sinon from 'sinon';
import { expect, should } from 'chai';
import privateRouter from '../../src/router/private';
import * as looper from '../../src/looper';

describe('router/private', function () {
  const USER = 'TEST_USER_NAME';
  const MARKET = 'poloniex';
  const INTERVAL = 1000 * 60 * 5;
  let app;
  describe('run', () => {
    before(() => {
      sinon.stub(looper, 'run')
        .withArgs(USER, MARKET, {
          interval: INTERVAL * 1000,
          unitsPerPurchase: 0.01
        }).onCall(0).resolves({})
          .onCall(1).resolves({})
          .onCall(2).resolves({})
          .onCall(3).rejects();
      app = express();
      app.use(bodyParser.json());
      app.use('/', privateRouter);
      app.use((err, req, res, next) => {
        res.status(500).json({
          error: err
        });
      });
    });
    after(() => {
      looper.run.restore();
    })
    it('should return 201 when it call', done => {
      supertest(app)
        .post(`/users/${USER}/auto-traders/${MARKET}`)
        .send({
          interval: INTERVAL,
          unitsPerPurchase: 0.01
        })
        .expect(201)
        .end((err, res) => {
          if (err) {
            expect.fail('', '', err);
            return;
          }
          done();
        });
    });
    it('should return 201 when it call without interval', done => {
      supertest(app)
        .post(`/users/${USER}/auto-traders/${MARKET}`)
        .send({
          interval: INTERVAL,
          unitsPerPurchase: 0.01
        })
        .expect(201)
        .end((err, res) => {
          if (err) {
            expect.fail('', '', err);
            return;
          }
          done();
        });
    });
    it('should return 500 when without unitsPerPurchase', done => {
      supertest(app)
        .post(`/users/${USER}/auto-traders/${MARKET}`)
        .send({
          interval: INTERVAL
        })
        .expect(500)
        .end((err, res) => {
          if (err) {
            expect.fail('', '', err);
            return;
          }
          done();
        });
    });
  });
  describe('list', () => {
    before(() => {
      sinon.stub(looper, 'list')
        .withArgs(USER).returns({ poloniex: { interval: 1234 } });
    });
    after(() => {
      looper.list.restore();
    })
    it('should return auto-traders when it call', done => {
      supertest(app)
      .get(`/users/${USER}/auto-traders`)
      .expect(200)
      .end((err, res) => {
        if (err) {
          expect.fail('', '', err);
          return;
        }
        expect(res.body[MARKET]).to.exist;
        expect(res.body[MARKET].interval).to.equal(1.234);
        done();
      });
    });
  });
  describe('stop', () => {
    let mockLooper;
    before(() => {
      mockLooper = sinon.mock(looper);
    });
    after(() => {
      mockLooper.restore();
    })
    it('should be called looper.stop when it call', done => {
      let expectation = mockLooper.expects('stop').withArgs(USER, MARKET).once();
      supertest(app)
      .delete(`/users/${USER}/auto-traders/${MARKET}`)
      .expect(200)
      .end((err, res) => {
        if (err) {
          expect.fail('', '', err);
          return;
        }
        expectation.verify();
        done();
      });
    });
  });
});
