<template>
  <div>
    <div class="bg-gray-100 p-15px">
      <span>注意</span>
      <div class="mt-5px">当通过搜索方式无法获取设备列表时，可通过手动添加的方式来添加通道。</div>
    </div>
    <div class="px-300px mt-80px">
      <BasicForm @register="registerForm" />
      <div class="flex justify-center">
        <div>
          <Button @click="cancel">取消</Button>
          <Button type="primary" class="ml-10px" @click="handleSubmit">添加</Button>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
  // components
  import { useForm, BasicForm } from '/@/components/Form';
  import { Button } from 'ant-design-vue';
  // configs
  import { manualAddFormSchema } from '../config';
  // services
  import { addDevice } from '/@/api/device';
  //hooks
  import { useMessage } from '/@/hooks/web/useMessage';

  const emits = defineEmits(['cancel']);
  const { createMessage } = useMessage();
  const [registerForm, { validate }] = useForm({
    schemas: manualAddFormSchema,
    labelWidth: 80,
    showActionButtonGroup: false,
    baseColProps: { span: 24 },
    colon: true,
  });

  function cancel() {
    emits('cancel');
  }

  async function handleSubmit() {
    const result = await validate();
    await addDevice([result]);
    createMessage.success('添加成功');
    cancel();
  }
</script>
<style lang="less" scoped></style>
