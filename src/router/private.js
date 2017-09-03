import express from 'express';
import * as looper from '../looper';

const router = express.Router();

router.post('/users/:user/loopers', (req, res) => {
  looper.run(req.params.user).then(() => {
    res.sendStatus(201);
  }).catch(() => {
    res.sendStatus(500);
  });
});

export default router;
