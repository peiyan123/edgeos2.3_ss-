import { ErrorMessageMode } from '/#/axios';
import { ContentTypeEnum } from '/@/enums/httpEnum';
import { defHttp } from '/@/utils/http/axios';

/**
 * @description: 获取文件信息
 */
export function getInfo() {
  return defHttp.get<any>({
    url: '/upgrade/upgrade/sysInfo',
  });
}

/**
 * @description: 删除文件
 */
export function delFile() {
  return defHttp.post<any>({
    url: '/upgrade/upgrade/deleteLocalFile',
  });
}

/**
 * @description: 检查文件
 */
export function checkFile(params: any) {
  return defHttp.get<any>(
    {
      url: '/upgrade/upgrade/upload/check',
      params,
    },
    { errorMessageMode: 'none' },
  );
}

/**
 * @description: 检查合并文件
 */
export function checkMergeFile(params: any) {
  return defHttp.get<any>(
    {
      url: '/upgrade/upgrade/upload/merge/check',
      params,
    },
    { errorMessageMode: 'none' },
  );
}

/**
 * @description: 合并文件
 */
export function mergeFile(data: any) {
  return defHttp.post<any>({
    url: '/upgrade/upgrade/upload/merge',
    data,
    headers: {
      'Content-Type': ContentTypeEnum.FORM_DATA,
    },
  });
}

/**
 * @description: 开始升级
 */
export function startUpgrade() {
  return defHttp.get<any>(
    {
      url: '/upgrade/upgrade/updateAction/true',
    },
    { errorMessageMode: 'none' },
  );
}

/**
 * @description: 开始升级
 */
export function reboot() {
  return defHttp.get<any>(
    {
      url: 'upgrade/upgrade/reboot',
    },
    { errorMessageMode: 'none' },
  );
}
