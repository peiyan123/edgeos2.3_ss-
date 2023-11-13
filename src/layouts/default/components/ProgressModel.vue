<template>
  <BasicModal
    v-bind="$attrs"
    @register="register"
    title="升级"
    width="500px"
    :canFullscreen="false"
    :footer="null"
    :closable="isSuccess == -1"
    :maskClosable="false"
    :afterClose="handleAfterClose"
  >
    <div class="mt-30px">
      <div v-if="isSuccess == 100">升级成功</div>
      <div v-if="isSuccess == -1">升级失败：升级包错误</div>
      <div class="flex items-center flex-nowrap">
        <span class="whitespace-nowrap">升级进度：</span>
        <Progress :percent="percent" />
      </div>
    </div>
  </BasicModal>
</template>
<script lang="ts" setup>
  import { watch, ref } from 'vue';
  // components
  import { Progress } from 'ant-design-vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  // hooks
  import { useMessage } from '/@/hooks/web/useMessage';
  // services
  import { reboot } from '/@/api/update';

  const props = defineProps({
    percent: {
      type: Number,
      default: 0,
    },
  });

  const { createConfirm } = useMessage();
  const isSuccess = ref(0);
  const [register, { closeModal }] = useModalInner();
  watch(
    () => props.percent,
    (newVal) => {
      if (newVal == 100) {
        isSuccess.value = 100;
        createConfirm({
          title: '系统重启',
          content: '是否立即重启?',
          onOk: () => {
            handleReboot();
          },
          onCancel: () => {
            closeModal();
            location.reload();
          },
          iconType: 'warning',
        });
      } else if (newVal == -1) {
        isSuccess.value = -1;
      }
    },
  );

  async function handleReboot() {
    await reboot();
    closeModal();
  }

  async function handleAfterClose() {
    isSuccess.value = 0;
  }
</script>
<style lang="less" scoped></style>
