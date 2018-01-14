import express from 'express';
import bodyParser from 'body-parser';
import privateRouter from './router/private';
import logger from './util/logger';

const app = express();
app.use(bodyParser.json());
app.use((req, res, next) => {
    logger.info(`${req.method} ${req.url}`);
    next();
});
app.use('/api/v1/private', privateRouter);
app.use((err, req, res) => {
    logger.error(err);
    res.status(500).json({
        error: err
    });
});

const PORT = process.env.PORT || 7000;
app.listen(PORT, () => {
    logger.info(`Auto-Trader app listening on port ${PORT}!`);
});
