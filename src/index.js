import express from 'express';
import bodyParser from 'body-parser';
import privateRouter from './router/private'

const app = express()
app.use(bodyParser.json());
app.use('/api/v1/private', privateRouter);

const PORT = process.env.PORT || 7000;
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`)
});
