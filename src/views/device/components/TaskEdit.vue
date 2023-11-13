<template>
  <BasicModal
    width="500px"
    :title="isEdit ? '编辑' : '创建'"
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
  import { editChannelFormSchema, taskSchema } from '../config';
  // service
  import { addDevice, addTask, editTask } from '/@/api/device';

  const emits = defineEmits(['success', 'register']);
  const editData = ref();
  const isEdit = ref(false);
  const [register, { closeModal }] = useModalInner((data: any) => {
    isEdit.value = data.isEdit;
    editData.value = data;
    if (data.isEdit) {
      setFieldsValue(data);
    } else {
      resetFields();
    }
  });
  const [registerForm, { validate, setFieldsValue, resetFields }] = useForm({
    schemas: taskSchema,
    labelWidth: 80,
    showActionButtonGroup: false,
    baseColProps: { span: 24 },
    colon: true,
  });
  async function handleOk() {
    const data = await validate();
    if (isEdit.value) {
      let editParams = {
        taskName: data.taskName,
        id: editData.value.id,
      };
      await editTask(editParams);
    } else {
      let addParams = {
        taskName: data.taskName,
        channel: editData.value.channel,
        operatorType: editData.value.operatorType,
      };
      await addTask(addParams);
    }
    closeModal();
    emits('success');
  }
</script>
<style lang="less" scoped></style>
