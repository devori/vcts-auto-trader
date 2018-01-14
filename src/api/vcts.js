import axios from 'axios';
import env from '../env';
import logger from '../util/logger';

const VCTS_PRIVATE_BASE_URL = `${env.VCTS_BASE_URL}/api/v1/private`;
const VCTS_PUBLIC_BASE_URL = `${env.VCTS_BASE_URL}/api/v1/public`;

export function findUser(accountId) {
    let url = `${VCTS_PRIVATE_BASE_URL}/users/${accountId}`;
    return axios.get(url)
        .then(() => ({id: accountId}))
        .catch(() => null);
}

export function getExchangeInfo(market) {
    return axios.get(`${VCTS_PUBLIC_BASE_URL}/markets/${market}/exchange-info`)
        .then(res => res.data)
        .catch(() => {});
}

export function getTickers(market, base, vcType) {
    let url = `${VCTS_PUBLIC_BASE_URL}/markets/${market}/tickers`;
    if (base) {
        url += `/${base}`;
    }
    if (vcType) {
        url += `/${vcType}`;
    }
    return axios.get(url)
        .then(res => res.data)
        .catch(() => {
        });
}

export function getAssets(accountId, market, base, vcType) {
    let url = `${VCTS_PRIVATE_BASE_URL}/users/${accountId}/markets/${market}/assets`;
    if (base) {
        url += `/${base}`;
    }
    if (vcType) {
        url += `/${vcType}`;
    }
    return axios.get(url)
        .then(res => res.data)
        .catch(() => {
        });
}

export function buy(accountId, market, base, vcType, units, rate) {
    const url = `${VCTS_PRIVATE_BASE_URL}/users/${accountId}/markets/${market}/assets/${base}/${vcType}`;
    logger.info(`[VCTS API] buy - ${url} ${units}(units), ${rate}(rate)`);
    return axios.post(url, {
        rate,
        units
    }).then(res => res.data).catch((e) => {
        logger.error(e);
    });
}

export function sell(accountId, market, base, vcType, units, rate) {
    const url = `${VCTS_PRIVATE_BASE_URL}/users/${accountId}/markets/${market}/assets/${base}/${vcType}`;
    logger.info(`[VCTS API] sell - ${url} ${units}(units), ${rate}(rate)`);
    return axios.delete(url, {
        data: {
            rate,
            units
        }
    }).then(res => res.data).catch((e) => {
        logger.error(e);
    });
}

export function syncAssets(accountId, market, base, vcType) {
    let url = `${VCTS_PRIVATE_BASE_URL}/users/${accountId}/markets/${market}/assets/${base}/${vcType}`;
    return axios.put(url, null, {
        params: {mode: 'sync'}
    }).catch(() => {
    });
}
