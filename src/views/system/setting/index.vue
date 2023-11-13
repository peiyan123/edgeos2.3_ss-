<template>
  <PageWrapper :content-style="{ backgroundColor: '#fff', padding: '30px' }">
    <Breadcrumb :routes="titleRoutes" />
    <Divider />
    <Tabs :destroy-inactive-tab-pane="true" v-model:active-key="activeKey">
      <TabPane tab="用户设置" key="user"><UserSetting /></TabPane>
      <TabPane tab="OSD设置" key="osd"><OsdSetting /></TabPane>
      <TabPane tab="音视频参数设置" key="video"><VideoConfig :pType="pType" :pId="pId" /></TabPane>
      <TabPane tab="网络设置" key="network"><NetworkTap /></TabPane>
      <TabPane tab="NTP设置" key="ntp"><Ntp /></TabPane>
      <TabPane tab="定时配置" key="timeconfig"><TimeConfig /></TabPane>
      <TabPane tab="出厂设置" key="reset"><Reset /></TabPane>
      <TabPane tab="任务管理" key="task"><Task /></TabPane>
    </Tabs>
  </PageWrapper>
</template>
<script lang="ts" setup>
  import { ref } from 'vue';
  // components
  import { PageWrapper } from '/@/components/Page';
  import { Breadcrumb, Tabs, TabPane, Divider } from 'ant-design-vue';
  import UserSetting from './components/UserSetting.vue';
  import OsdSetting from './components/OsdSetting.vue';
  import VideoConfig from './components/VideoConfig.vue';
  import Ntp from './components/Ntp.vue';
  import NetworkTap from './components/NetworkTap.vue';
  import TimeConfig from './components/TimeConfig.vue';
  import Reset from './components/Reset.vue';
  import Task from './components/Task.vue';
  // model
  import { Route } from 'ant-design-vue/lib/breadcrumb/Breadcrumb';
  // hooks
  import { useRoute } from 'vue-router';

  const titleRoutes = ref<Route[]>([
    {
      path: '/system/setting',
      breadcrumbName: '系统管理',
    },
    {
      path: '',
      breadcrumbName: '系统设置',
    },
  ]);
  const activeKey = ref<any>('user');
  const route = useRoute();
  const pType = ref<any>();
  const pId = ref<any>('');
  if (route.query.key) {
    activeKey.value = route.query.key;
  }
  if (route.query.id) {
    pId.value = route.query.id;
  }
  if (route.query.pType) {
    pType.value = route.query.pType;
  } else {
    pType.value = 'video';
  }
</script>
<style lang="less" scoped></style>
