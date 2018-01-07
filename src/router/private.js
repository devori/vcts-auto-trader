import express from 'express';
import * as looper from '../looper';

const router = express.Router();

router.post('/users/:user/auto-traders/:market', (req, res, next) => {
  let { unitsPerPurchase, interval = 300 } = req.body;
  if (!unitsPerPurchase) {
    res.sendStatus(500);
    return;
  }
  interval *= 1000;
  looper.run(req.params.user, req.params.market, {
    interval,
    unitsPerPurchase,
  }).then(() => {
    res.sendStatus(201);
  }).catch((err) => {
    next(err);
  });
});

router.get('/users/:user/auto-traders', (req, res) => {
  const result = looper.list(req.params.user);
  Object.keys(result).forEach(market => result[market].interval /= 1000);
  res.json(result);
});

router.delete('/users/:user/auto-traders/:market', (req, res) => {
  looper.stop(req.params.user, req.params.market);
  res.sendStatus(200);
});

export default router;
