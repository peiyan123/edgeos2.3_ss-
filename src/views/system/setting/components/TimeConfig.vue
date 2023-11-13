<template>
  <div class="w-2/3 m-auto p-80px">
    <BasicForm @register="registerForm" />
    <div class="flex justify-center">
      <div>
        <!-- <Button>取消</Button> -->
        <Button type="primary" class="ml-10px" @click="handleSave">保存</Button>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
  // components
  import { useForm, BasicForm } from '/@/components/Form';
  import { Button } from 'ant-design-vue';
  // hooks
  import { useMessage } from '/@/hooks/web/useMessage';
  // config
  import { timeConfigSchema } from '../config';
  // service
  import { getStoreConfig, saveStoreConfig } from '/@/api/system';

  const { createMessage } = useMessage();
  const [registerForm, { setFieldsValue, validate }] = useForm({
    schemas: timeConfigSchema,
    labelWidth: 80,
    showActionButtonGroup: false,
    baseColProps: { span: 24 },
    colon: true,
  });

  getData();
  async function getData() {
    const data = await getStoreConfig();
    setFieldsValue(data);
  }

  async function handleSave() {
    const values = await validate();
    await saveStoreConfig(values);
    createMessage.success('保存成功');
  }
</script>
<style lang="less" scoped></style>
