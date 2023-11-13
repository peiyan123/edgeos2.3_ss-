import { defHttp } from '/@/utils/http/axios';

enum Api {
  UpdatePassword = '/api/setting/user',
  ResetPassword = '/api/setting/user/reset',
  GetOsd = '/api/setting/osd',
  GetOsdConfig = '/api/setting/osd/dict',
  SaveOsd = '/api/setting/osd',
  GetSystemVideo = '/api/setting/video',
  SaveSystemVideo = '/api/setting/video',
  TimeInfo = '/api/setting/date/timeInfo',
  ToggleNtp = '/api/setting/date/toggleNtp/',
  toggleNew = '/api/setting/date/startAlign',
  DateSet = '/api/setting/date/',
  TimeZone = '/api/setting/date/timeZone/',
  SetNtpServe = '/api/setting/date/ntpServer/',
  SystemMonit = '/api/systemMonitor/info',
  networkConfig = '/api/setting/network',
  getNetwork = '/api/setting/network',
  VideoSelectConfig = '/api/setting/video/dict/',
  AudioSelectConfig = '/api/setting/audio/dict/',
  GetSystemAudio = '/api/setting/audio',
  SaveSystemAudio = '/api/setting/audio',
  StoreConfig = '/api/setting/store',
  Reset = '/api/setting/reset',
}

export const updatePassword = (params) => {
  return defHttp.post({ url: Api.UpdatePassword, params });
};

export const resetPassword = (params) => {
  return defHttp.post({ url: Api.ResetPassword, params });
};

export const getOsdConfig = () => {
  return defHttp.get({ url: Api.GetOsdConfig });
};

export const getOsd = (params) => {
  return defHttp.get({ url: Api.GetOsd, params });
};

export const saveOsd = (params) => {
  return defHttp.post({ url: Api.SaveOsd, params });
};

export const getSystemVideo = (params) => {
  return defHttp.get({ url: Api.GetSystemVideo, params });
};

export const saveSystemVideo = (params) => {
  return defHttp.post({ url: Api.SaveSystemVideo, params });
};

export const getTimeInfo = () => {
  return defHttp.get({ url: Api.TimeInfo });
};

export const toggleNtp = (params) => {
  return defHttp.post({ url: Api.ToggleNtp + params });
};
export const toggleNew = (params) => {
  return defHttp.post({ url: Api.toggleNew, params });
};
export const setDate = (params) => {
  return defHttp.post({ url: Api.DateSet, params });
};

export const timeZone = (params) => {
  return defHttp.post({ url: Api.TimeZone + params });
};

export const setNtpServe = (params) => {
  return defHttp.post({ url: Api.SetNtpServe + params });
};

export const getSystemInfo = () => {
  return defHttp.get({ url: Api.SystemMonit });
};

export const setNetwork = (params) => {
  return defHttp.post({ url: Api.networkConfig, params });
};

export const getNetwork = (params) => {
  return defHttp.get({ url: Api.getNetwork + `/${params}` });
};

export const getVideoSelectConfig = () => {
  return defHttp.get({ url: Api.VideoSelectConfig });
};

export const getSystemAudio = () => {
  return defHttp.get({ url: Api.GetSystemAudio });
};

export const saveSystemAudio = (params) => {
  return defHttp.post({ url: Api.SaveSystemAudio, params });
};

export const getAudioSelectConfig = () => {
  return defHttp.get({ url: Api.AudioSelectConfig });
};

export const saveStoreConfig = (params) => {
  return defHttp.post({ url: Api.StoreConfig, params });
};

export const getStoreConfig = () => {
  return defHttp.get({ url: Api.StoreConfig });
};

export const reset = () => {
  return defHttp.get({ url: Api.Reset });
};
export const setTimeLen = (params) => {
  return defHttp.post(
    {
      url: '/api/record/set_time_len',
      params,
    },
    {
      isTransformResponse: true,
    },
  );
};
export const getStoreConfigetTimeLen = () => {
  return defHttp.post(
    { url: '/api/record/get_record_time_len' },
    {
      isTransformResponse: true,
    },
  );
};
export const startFixingFile = () => {
  return defHttp.post(
    { url: '/api/record/start_fixing_file' },
    {
      isTransformResponse: true,
    },
  );
};
export const getFixingStatus = () => {
  return defHttp.post(
    { url: '/api/record/get_fixing_status' },
    {
      isTransformResponse: true,
    },
  );
};
