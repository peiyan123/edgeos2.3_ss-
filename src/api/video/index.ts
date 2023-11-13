import { IplayControl, Iplaystart } from './model';
import { defHttp } from '/@/utils/http/axios';

enum Api {
  PlayStart = '/api/rec/PlaybackService/PlayStart',
  PlayStop = '/api/rec/PlaybackService/PlayStop',
  PlayControl = '/api/rec/PlaybackService/PlayContrl',
  SearchPlayback = '/api/rec/playback',
}
const timeout = 3 * 60 * 1000;

export const playStartApi = (params: Iplaystart) => {
  return defHttp.post({ url: Api.PlayStart, params, timeout });
};

export const playStopApi = (params) => {
  return defHttp.post({ url: Api.PlayStop, params, timeout });
};

export const playControlApi = (params: IplayControl) => {
  return defHttp.post({ url: Api.PlayControl, params, timeout });
};

export const searchPlaybackApi = (params) => {
  return defHttp.get({ url: Api.SearchPlayback, params, timeout });
};
export const seekRecordStamp = (params) => {
  return defHttp.get(
    {
      url: `/index/api/seekRecordStamp?secret=035c73f7-bb6b-4889-a715-d9eb2d1925cc&vhost=${
        location.protocol + '//' + location.hostname
        // location.protocol + '//10.0.73.26'
      }/&app=record&stream=${params.stream}&stamp=${params.stamp}&schema=rtsp`,
    },
    {
      isTransformResponse: false,
      successMessageMode: 'none',
    },
  );
};
export const setRecordSpeed = (params) => {
  return defHttp.get(
    {
      url: `/index/api/setRecordSpeed?secret=035c73f7-bb6b-4889-a715-d9eb2d1925cc&vhost=${
        location.protocol + '//' + location.hostname
        // location.protocol + '//10.0.73.26'
      }/&app=record&stream=${params.stream}&speed=${params.speed}&schema=rtsp`,
    },
    {
      isTransformResponse: false,
      successMessageMode: 'none',
    },
  );
};
