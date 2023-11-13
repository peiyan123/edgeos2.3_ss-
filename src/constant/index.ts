export const IPREGEX =
  /^((25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)\.){3}(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)$/;

export const SUBMASKREGEX =
  /^(128.0.0.0|192.0.0.0|224.0.0.0|240.0.0.0|248.0.0.0|252.0.0.0|254.0.0.0|255.0.0.0|255.128.0.0|255.192.0.0|255.224.0.0|255.240.0.0|255.248.0.0|255.252.0.0|255.254.0.0|255.255.0.0|255.255.128.0|255.255.192.0|255.255.224.0|255.255.240.0|255.255.248.0|255.255.252.0|255.255.254.0|255.255.255.0|255.255.255.128|255.255.255.192|255.255.255.224|255.255.255.240|255.255.255.248|255.255.255.252|255.255.255.254|255.255.255.255)$/;

export const GATEWAYREGEX = /^(192\.168(\.(\d|([1-9]\d)|(1\d{2})|(2[0-4]\d)|(25[0-5]))){2})$/;

export const origin = ['localhost'].includes(location.hostname)
  ? 'http://10.0.73.81:8888'
  : location.origin;

export const wsHostName = ['localhost'].includes(location.hostname)
  ? '10.0.73.81:8888'
  : location.host;

export const originVideo = ['localhost'].includes(location.hostname)
  ? 'http://10.0.73.81:28888'
  : location.protocol + '//' + location.hostname;
