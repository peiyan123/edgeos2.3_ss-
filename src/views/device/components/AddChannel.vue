<template>
  <Tabs>
    <TabPane tab="搜索添加" key="search"
      ><SearchAdd :channels="channels" @cancel="cancel" :type="type"
    /></TabPane>
    <!-- <TabPane v-if="type === 'HDMI'" tab="手动添加" key="manual"
      ><ManualAdd @cancel="cancel"
    /></TabPane> -->
  </Tabs>
</template>
<script lang="ts" setup>
  // components
  import { Tabs, TabPane } from 'ant-design-vue';
  import SearchAdd from './SearchAdd.vue';
  // import ManualAdd from './ManualAdd.vue';

  defineProps({
    type: String,
    channels: Array,
  });
  const emits = defineEmits(['cancel']);

  function cancel() {
    emits('cancel');
  }
</script>
<style lang="less" scoped></style>
