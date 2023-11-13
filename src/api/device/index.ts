import { defHttp } from '/@/utils/http/axios';

enum Api {
  DeviceSearch = '/api/device/scan/',
  AddDevice = '/api/device/save',
  DevcieList = '/api/device/getChannelList',
  DevcieDel = '/api/device/deleteChannel',
  StartRecord = '/api/record/start_record',
  StopRecord = '/api/record/stop_record',
}

export const getDeviceSearch = (params) => {
  return defHttp.get({ url: Api.DeviceSearch + params.type });
};

export const addDevice = (params) => {
  return defHttp.post({ url: Api.AddDevice, params });
};

export const deviceList = (params) => {
  return defHttp.post({ url: Api.DevcieList, params });
};
export const taskList = (params) => {
  return defHttp.get({ url: '/api/setting/file/getTaskList', params });
};
export const editTask = (params) => {
  return defHttp.post({ url: '/api/setting/file/updateTask', params });
};
export const addTask = (params) => {
  return defHttp.post({ url: '/api/setting/file/saveTask ', params });
};
export const delDevice = (params) => {
  return defHttp.delete({ url: Api.DevcieDel, params }, { joinParamsToUrl: true });
};

export const startRecord = (params) => {
  return defHttp.post({ url: Api.StartRecord, params });
};

export const stopRecord = (params) => {
  return defHttp.post({ url: Api.StopRecord, params });
};
