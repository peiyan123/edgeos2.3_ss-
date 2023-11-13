import { buildUUID } from '/@/utils/uuid';

export function timeFormatUtils(num) {
  return num >= 10 ? num : '0' + num;
}

export const playId = buildUUID();

export const origin = ['localhost'].includes(location.hostname)
  ? 'http://10.0.73.81:8888'
  : location.origin;

export const originElse = ['localhost'].includes(location.hostname)
  ? 'http://10.0.73.81:18080'
  : location.protocol + '//' + location.hostname + ':18080';

export const wsHostName = ['localhost'].includes(location.hostname)
  ? '10.0.73.81:8888'
  : location.host;

export function transformUrl(url) {
  if (url) {
    return url.replace(new URL(url).origin, origin);
  }
  return url;
  // return url;
}

export function timeTranslateSecondsUtils(seconds) {
  const s = Number(seconds.slice(4));
  const m = Number(seconds.slice(2, 4));
  const h = Number(seconds.slice(0, 2));
  return s + m * 60 + h * 60 * 60;
}
