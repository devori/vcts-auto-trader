import express from 'express';
import bodyParser from 'body-parser';
import supertest from 'supertest';
import sinon from 'sinon';
import {expect, should} from 'chai';
import privateRouter from '../../src/router/private';
import * as looper from '../../src/looper';
import repository from '../../src/repository';

describe('router/private', function () {
    const USER = 'TEST_USER_NAME';
    const MARKET_A = 'a-market';
    const MARKET_B = 'b-market';
    const BASE = 'BTC';
    const INTERVAL = 60 * 5 * 1000;

    let app;

    before(() => {
        sinon.stub(repository, 'saveAutoTraderInfo').returns({});

        app = express();
        app.use(bodyParser.json());
        app.use('/', privateRouter);
        app.use((err, req, res) => {
            res.status(500).json({
                error: err
            });
        });
    });

    after(() => {
        repository.saveAutoTraderInfo.restore();
    });

    describe('run', () => {
        before(() => {
            sinon.stub(looper, 'run')
                .withArgs(USER, MARKET_A, BASE, sinon.match.object)
                .resolves();
        });

        after(() => {
            looper.run.restore();
        });

        it('should return 201 when it call', done => {
            supertest(app)
                .post(`/users/${USER}/auto-traders/${MARKET_A}/${BASE}`)
                .send({
                    interval: INTERVAL,
                    minUnits: 1,
                    maxUnits: 2,
                    coins: 'coins',
                })
                .expect(201)
                .end((err) => {
                    if (err) {
                        expect.fail('', '', err);
                        return;
                    }
                    done();
                });
        });

        it('should call saveAutoTraderInfo when it call', done => {
            supertest(app)
                .post(`/users/${USER}/auto-traders/${MARKET_A}/${BASE}`)
                .send({
                    interval: INTERVAL,
                    minUnits: 1,
                    maxUnits: 2,
                    coins: 'hello',
                    rule: {
                        name: 'hello',
                        options: {
                            rateForPurchase: 0.05,
                            rateForSale: 0.05,
                        },
                    }
                })
                .expect(201)
                .end((err) => {
                    if (err) {
                        expect.fail('', '', err);
                        return;
                    }
                    expect(repository.saveAutoTraderInfo.calledWith(USER, MARKET_A, BASE, {
                        interval: INTERVAL,
                        minUnits: 1,
                        maxUnits: 2,
                        coins: 'hello',
                        rule: {
                            name: 'hello',
                            options: {
                                rateForPurchase: 0.05,
                                rateForSale: 0.05,
                            },
                        }
                    })).to.be.true;
                    done();
                });
        });

        it('should call saveAutoTraderInfo with default rule when it call without rule', done => {
            supertest(app)
                .post(`/users/${USER}/auto-traders/${MARKET_A}/${BASE}`)
                .send({
                    interval: INTERVAL,
                    minUnits: 1,
                    maxUnits: 2,
                    coins: 'hello',
                })
                .expect(201)
                .end((err) => {
                    if (err) {
                        expect.fail('', '', err);
                        return;
                    }
                    expect(repository.saveAutoTraderInfo.calledWith(USER, MARKET_A, BASE, {
                        interval: INTERVAL,
                        minUnits: 1,
                        maxUnits: 2,
                        coins: 'hello',
                        rule: {
                            name: 'default',
                            options: {
                                rateForPurchase: 0.07,
                                rateForSale: 0.07,
                            },
                        }
                    })).to.be.true;
                    done();
                });
        });

        it('should call looper.run with default rule when it call wihtout rule', done => {
            supertest(app)
                .post(`/users/${USER}/auto-traders/${MARKET_A}/${BASE}`)
                .send({
                    interval: INTERVAL,
                    minUnits: 1,
                    maxUnits: 2,
                    coins: 'hello',
                })
                .expect(201)
                .end((err) => {
                    if (err) {
                        expect.fail('', '', err);
                        return;
                    }
                    expect(looper.run.calledWith(USER, MARKET_A, BASE, {
                        interval: INTERVAL,
                        minUnits: 1,
                        maxUnits: 2,
                        coins: 'hello',
                        rule: {
                            name: 'default',
                            options: {
                                rateForPurchase: 0.07,
                                rateForSale: 0.07,
                            }
                        }
                    })).to.be.true;
                    done();
                });
        });

        it('should call looper.run with the rule when it call with rule', done => {
            supertest(app)
                .post(`/users/${USER}/auto-traders/${MARKET_A}/${BASE}`)
                .send({
                    interval: INTERVAL,
                    minUnits: 1,
                    maxUnits: 2,
                    coins: 'hello',
                    rule: {
                        name: 'hello',
                        options: {
                            rateForPurchase: 0.05,
                            rateForSale: 0.05,
                        },
                    },
                })
                .expect(201)
                .end((err) => {
                    if (err) {
                        expect.fail('', '', err);
                        return;
                    }
                    expect(looper.run.calledWith(USER, MARKET_A, BASE, {
                        interval: INTERVAL,
                        minUnits: 1,
                        maxUnits: 2,
                        coins: 'hello',
                        rule: {
                            name: 'hello',
                            options: {
                                rateForPurchase: 0.05,
                                rateForSale: 0.05,
                            },
                        },
                    })).to.be.true;
                    done();
                });
        });

        it('should return 500 when without coins', done => {
            supertest(app)
                .post(`/users/${USER}/auto-traders/${MARKET_A}/${BASE}`)
                .send({
                    interval: INTERVAL,
                    minUnits: 1,
                    maxUnits: 2,
                })
                .expect(500)
                .end((err) => {
                    if (err) {
                        expect.fail('', '', err);
                        return;
                    }
                    done();
                });
        });

        it('should return 500 when without interval', done => {
            supertest(app)
                .post(`/users/${USER}/auto-traders/${MARKET_A}/${BASE}`)
                .send({
                    minUnits: 1,
                    maxUnits: 2,
                    coins: 'hello'
                })
                .expect(500)
                .end((err) => {
                    if (err) {
                        expect.fail('', '', err);
                        return;
                    }
                    done();
                });
        });

        it('should return 500 when interval < 1000', done => {
            supertest(app)
                .post(`/users/${USER}/auto-traders/${MARKET_A}/${BASE}`)
                .send({
                    interval: 999,
                    minUnits: 1,
                    maxUnits: 2,
                    coins: 0.01
                })
                .expect(500)
                .end((err) => {
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
            sinon.stub(repository, 'getAutoTraders').withArgs(USER).returns([
                {
                    market: MARKET_A,
                    base: 'BTC',
                    interval: 300000,
                    coins: 'hello'
                },
                {
                    market: MARKET_A,
                    base: 'ETH',
                    interval: 300000,
                    coins: 'hello2'
                },
                {
                    market: MARKET_B,
                    base: 'BTC',
                    interval: 300000,
                    coins: 'hello3'
                },
            ]);

            sinon.stub(looper, 'list').withArgs(USER).returns([
                {
                    market: MARKET_A,
                    base: 'BTC',
                    interval: 300000,
                    coins: 'hello'
                },
                {
                    market: MARKET_B,
                    base: 'BTC',
                    interval: 300000,
                    coins: 'hello3'
                },
            ]);
        });

        after(() => {
            repository.getAutoTraders.restore();
            looper.list.restore();
        });

        it('should return auto-traders when it call', done => {
            supertest(app)
                .get(`/users/${USER}/auto-traders`)
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        expect.fail('', '', err);
                        return;
                    }
                    const traders = res.body;

                    expect(traders.length).to.equal(3);
                    expect(traders.find(({market, base}) => market === MARKET_A && base === 'BTC').isRunning).to.be.true;
                    expect(traders.find(({market, base}) => market === MARKET_A && base === 'ETH').isRunning).to.be.false;
                    expect(traders.find(({market, base}) => market === MARKET_B && base === 'BTC').isRunning).to.be.true;

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
        });

        it('should be called looper.stop when it call', done => {
            const expectation = mockLooper.expects('stop').withArgs(USER, MARKET_A, BASE).once();
            supertest(app)
                .delete(`/users/${USER}/auto-traders/${MARKET_A}/${BASE}`)
                .expect(200)
                .end((err) => {
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
