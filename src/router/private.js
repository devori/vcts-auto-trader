import express from 'express';
import trader from '../trader';

const router = express.Router();

router.post('/users/:user/traders', (req, res) => {
  trader.run().then(() => {
    res.sendStatus(201);
  }).catch(() => {
    res.sendStatus(500);
  });
});

export default router;
