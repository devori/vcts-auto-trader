import express from 'express';
import * as looper from '../looper';

const router = express.Router();

router.post('/users/:user/auto-traders/:market', (req, res) => {
  let interval = req.query.interval ? Number(req.query.interval) : 1000 * 60 * 5;
  looper.run(req.params.user, req.params.market, interval).then(() => {
    res.sendStatus(201);
  }).catch((err) => {
    res.status(500).json({
      error: err
    });
  });
});

router.get('/users/:user/auto-traders', (req, res) => {
  res.json(looper.list(req.params.user));
});

router.delete('/users/:user/auto-traders/:market', (req, res) => {
  looper.stop(req.params.user, req.params.market);
  res.sendStatus(200);
});

export default router;
