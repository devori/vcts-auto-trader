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

export function getBalances(market, base, vcType) {
  let url = `${VCTS_PRIVATE_BASE_URL}/markets/${market}/assets`;
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
