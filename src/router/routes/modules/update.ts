import type { AppRouteModule } from '/@/router/types';

import { LAYOUT } from '/@/router/constant';
import { t } from '/@/hooks/web/useI18n';

const algo: AppRouteModule = {
  path: '/update',
  name: 'Update',
  component: LAYOUT,
  redirect: '/update/index',
  meta: {
    hideChildrenInMenu: true,
    icon: 'ant-design:container-outlined',
    title: '升级管理',
    orderNo: 6,
  },
  children: [
    {
      path: 'index',
      name: 'UpdatePackageManage',
      component: () => import('/@/views/update/index.vue'),
      meta: {
        title: '升级管理',
      },
    },
  ],
};

export default algo;
