import express from 'express';
import defaultsDeep from 'lodash/defaultsDeep';
import * as looper from '../looper';
import repository from '../repository';

const router = express.Router();

router.post('/users/:user/auto-traders/:market/:base', (req, res, next) => {
    let {interval, coins} = req.body;
    if (!interval || interval < 1000 || !coins) {
        res.sendStatus(500);
        return;
    }

    const {user, market, base} = req.params;
    repository.saveAutoTraderInfo(user, market, base, {
        interval,
        coins,
    });

    looper.run(user, market, base, {
        interval,
        coins,
    }).then(() => {
        res.sendStatus(201);
    }).catch((err) => {
        next(err);
    });
});

router.get('/users/:user/auto-traders', (req, res) => {
    const {user} = req.params;
    const runningTraders = looper.list(user);
    const result = repository.getAutoTraders(user).map(trader => {
        trader.isRunning = runningTraders.some(({market, base}) => market === trader.market && base === trader.base);
        return trader;
    });

    defaultsDeep(result, runningTraders);
    res.json(result);
});

router.delete('/users/:user/auto-traders/:market/:base', (req, res) => {
    const {user, market, base} = req.params;
    looper.stop(user, market, base);
    res.sendStatus(200);
});

export default router;
