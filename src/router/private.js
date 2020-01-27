import express from 'express';
import * as looper from '../looper';
import repository from '../repository';

const router = express.Router();

router.post('/users/:user/auto-traders/:market/:base', (req, res, next) => {
    const {
        interval, minUnits, maxUnits, coins, unitRange,
        rule = {
            name: 'default',
            options: {
                rateForPurchase: 0.07,
                rateForSale: 0.07,
            },
        },
    } = req.body;

    if (!interval || interval < 1000 || !minUnits || !maxUnits || !coins || !unitRange) {
        res.sendStatus(500);
        return;
    }

    const {user, market, base} = req.params;
    repository.saveAutoTraderInfo(user, market, base, {
        interval,
        minUnits,
        maxUnits,
        coins,
        rule,
        unitRange,
    });

    looper.run(user, market, base, {
        interval,
        minUnits,
        maxUnits,
        coins,
        rule,
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

    res.json(result);
});

router.delete('/users/:user/auto-traders/:market/:base', (req, res) => {
    const {user, market, base} = req.params;
    looper.stop(user, market, base);
    res.sendStatus(200);
});

export default router;
