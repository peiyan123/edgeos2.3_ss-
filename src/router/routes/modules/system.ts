import type { AppRouteModule } from '/@/router/types';

import { LAYOUT } from '/@/router/constant';
import { t } from '/@/hooks/web/useI18n';

const system: AppRouteModule = {
  path: '/system',
  name: 'System',
  component: LAYOUT,
  redirect: '/system/setting',
  meta: {
    hideChildrenInMenu: false,
    icon: 'ant-design:setting-outlined',
    title: '系统管理',
    orderNo: 7,
  },
  children: [
    {
      path: 'monit',
      name: 'MonitPage',
      component: () => import('/@/views/system/monit/index.vue'),
      meta: {
        title: '系统运维',
      },
    },
    {
      path: 'setting',
      name: 'SettingPage',
      component: () => import('/@/views/system/setting/index.vue'),
      meta: {
        title: '系统设置',
      },
    },
  ],
};

export default system;
