import express from 'express';
import bodyParser from 'body-parser';
import privateRouter from './router/private'

const app = express()
app.use(bodyParser.json());
app.use((req, res, next) => {
  console.log(`[${Date()}] ${req.method} ${req.url}`);
  next();
});
app.use('/api/v1/private', privateRouter);
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({
    error: err
  });
});

const PORT = process.env.PORT || 7000;
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`)
});
