import express from 'express';
import * as looper from '../looper';

const router = express.Router();

router.post('/users/:user/auto-traders', (req, res) => {
  looper.run(req.params.user, req.body.market, req.body.interval).then(() => {
    res.sendStatus(201);
  }).catch((err) => {
    res.status(500).json({
      error: err
    });
  });
});

export default router;
