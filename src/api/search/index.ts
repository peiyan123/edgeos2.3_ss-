import { defHttp } from '/@/utils/http/axios';

enum Api {
  VideoSearch = '/api/search/video/day',
  AudioSearch = '/api/search/audio/day',
  AiSearch = '/api/search/ai/day',
  AudioDel = '/api/search/audio',
  VideoDel = '/api/search/video',
  AiDel = '/api/search/ai/',
  Download = '/api/search/download/batch',
}
const timeout = 1000 * 60 * 2;

export const downloadVideo = (params) => {
  return defHttp.post(
    { url: Api.Download, params, responseType: 'blob', timeout },
    { isReturnNativeResponse: true },
  );
};

export const downloadAudio = (params) => {
  return defHttp.post(
    { url: Api.Download, params, responseType: 'blob', timeout },
    { isReturnNativeResponse: true },
  );
};

export const downloadAi = (params) => {
  return defHttp.post(
    { url: Api.Download, params, responseType: 'blob', timeout },
    { isReturnNativeResponse: true },
  );
};

export const getVideoSearch = (params) => {
  return defHttp.get({ url: Api.VideoSearch, params });
};

export const getAudioSearch = (params) => {
  return defHttp.get({ url: Api.AudioSearch, params });
};

export const getAiSearch = (params) => {
  return defHttp.get({ url: Api.AiSearch, params });
};

export const delAudio = (params) => {
  return defHttp.post({ url: Api.AudioDel, params });
};

export const delVideo = (params) => {
  return defHttp.post({ url: Api.VideoDel, params });
};

export const delAi = (params) => {
  return defHttp.post({ url: Api.AiDel, params });
};
