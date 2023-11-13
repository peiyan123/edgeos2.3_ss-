import { defHttp } from '/@/utils/http/axios';

enum Api {
  AlgoDetails = '/api/alg/getDetail',
  SaveAlgo = '/api/alg/saveDetail',
}

export const getAlgoDetails = (params: { algType: string; id: string }) => {
  return defHttp.post({ url: Api.AlgoDetails, params });
};

export const saveAlgoDetails = (params) => {
  return defHttp.post({ url: Api.SaveAlgo, params });
};
