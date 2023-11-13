<template>
  <div class="flex justify-center">
    <div class="text-center">
      <div class="mb-10px">
        <span>注意：</span>
        <span>1.清除设备数据,</span>
        <span>2.清除录制文件,</span>
        <span>3.清除检索数据,</span>
        <span>4.清除算法配置,</span>
        <span>5.清除系统设置</span>
      </div>
      <Button type="primary" @click="handleReset">恢复设置</Button>
    </div>
  </div>
</template>
<script lang="ts" setup>
  // components
  import { Button } from 'ant-design-vue';
  // service
  import { reset } from '/@/api/system';
  // hooks
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useUserStore } from '/@/store/modules/user';

  const { createMessage } = useMessage();

  async function handleReset() {
    await reset();
    createMessage.success('设置成功');
    const userStore = useUserStore();
    userStore.logout(true);
  }
</script>
<style lang="less" scoped></style>
