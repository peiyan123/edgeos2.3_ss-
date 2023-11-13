<template>
  <BasicModal
    width="800px"
    title="预览"
    class="upload-preview-modal"
    v-bind="$attrs"
    @register="register"
    :canFullscreen="false"
    @ok="handleOk"
  >
    <BasicForm @register="registerForm"
  /></BasicModal>
</template>
<script lang="ts" setup>
  import { ref } from 'vue';
  // components
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { BasicForm, useForm } from '/@/components/Form';
  // config
  import { editChannelFormSchema } from '../config';
  // service
  import { addDevice } from '/@/api/device';

  const emits = defineEmits(['success', 'register']);
  const editData = ref();
  const [registerForm, { validate, setFieldsValue }] = useForm({
    schemas: editChannelFormSchema,
    labelWidth: 80,
    showActionButtonGroup: false,
    baseColProps: { span: 24 },
    colon: true,
  });
  const [register, { closeModal }] = useModalInner((data: any) => {
    setFieldsValue(data);
    editData.value = data;
  });

  async function handleOk() {
    const data = await validate();
    await addDevice([{ ...editData.value, ...data }]);
    closeModal();
    emits('success');
  }
</script>
<style lang="less" scoped></style>
