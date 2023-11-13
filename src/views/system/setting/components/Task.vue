<template>
  <Tabs v-model:active-key="tabKey" :destroy-inactive-tab-pane="true">
    <TabPane tab="视频设备" key="HDMI"
      ><VideoTable :isTask="true" :type="tabKey" @pageChange="handlePageChange"
    /></TabPane>
    <TabPane tab="音频设备" key="AUDIO"
      ><AudioTable :isTask="true" :type="tabKey" @pageChange="handlePageChange"
    /></TabPane>
  </Tabs>
</template>
<script lang="ts" setup>
  import { ref, watch, onMounted } from 'vue';
  // components
  import { Tabs, TabPane } from 'ant-design-vue';
  import VideoTable from '../../../device/components/VideoTable.vue';
  import AudioTable from '../../../device/components/AudioTable.vue';
  import AddChannel from '../../../device/components/AddChannel.vue';
  // model
  import { Route } from './model';

  const titleRoutes = ref<Route[]>([
    {
      path: '/device',
      key: 0,
      breadcrumbName: '设备管理',
    },
    {
      path: '',
      key: 1,
      breadcrumbName: '视频设备',
    },
  ]);
  const tabKey = ref('HDMI');
  const pageType = ref(''); // add
  const alreadyAddChannel = ref<any>([]); // 纪录已添加的通道

  watch(
    () => tabKey.value,
    (newVal) => {
      titleRoutes.value[1].breadcrumbName = newVal === 'HDMI' ? '视频设备' : '音频设备';
    },
  );
  function handlePageChange(data: { page: string; type: string; channels: Array<any> }) {
    pageType.value = data.page;
    titleRoutes.value[2] = { path: '', key: 2, breadcrumbName: '添加通道' };
    alreadyAddChannel.value = data.channels;
  }

  function handleRoute(route: Route) {
    if (route.key === 1) {
      pageType.value = '';
      titleRoutes.value.splice(2, 1);
    } else if (route.key === 0) {
      pageType.value = '';
      titleRoutes.value.splice(2, 1);
      tabKey.value = 'HDMI';
    }
  }

  function handleAddCancel() {
    pageType.value = '';
    titleRoutes.value.splice(2, 1);
  }
  onMounted(() => {
    console.log('device');
  });
</script>
<style lang="less" scoped></style>
