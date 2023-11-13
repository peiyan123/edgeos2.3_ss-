<template>
  <Tabs :destroy-inactive-tab-pane="true">
    <TabPane tab="LAN1" key="lan1"><Network type="lan1" /></TabPane>
    <TabPane tab="LAN2" key="lan2"><Network type="lan2" /></TabPane>
  </Tabs>
</template>
<script lang="ts" setup>
  // components
  import { Tabs, TabPane } from 'ant-design-vue';
  import Network from './Network.vue';
</script>
<style lang="less" scoped></style>
