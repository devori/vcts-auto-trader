import axios from 'axios';
import env from '../env';

const VCTS_PRIVATE_BASE_URL = `${env.VCTS_BASE_URL}/api/v1/private`;
const VCTS_PUBLIC_BASE_URL = `${env.VCTS_BASE_URL}/api/v1/public`;

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
    .catch(() => {});
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
    .catch(() => {});
}

export function buy(accountId, market, base, vcType, rate, units) {
  let url = `${VCTS_PRIVATE_BASE_URL}/users/${accountId}/markets/${market}/assets/${base}/${vcType}`;
  return axios.post(url, {
    rate,
    units
  }).then(res => res.data).catch(() => {});
}

export function sell(accountId, market, base, vcType, rate, units) {
  let url = `${VCTS_PRIVATE_BASE_URL}/users/${accountId}/markets/${market}/assets/${base}/${vcType}`;
  return axios.delete(url, {
    data: {
      rate,
      units
    }
  }).then(res => res.data).catch(() => {});
}
