<template>
  <div class="w-2/3 m-auto p-80px">
    <BasicForm @register="registerForm" v-show="!isReset">
      <template #password>
        <Button @click="isReset = true">重置密码</Button>
      </template>
    </BasicForm>
    <BasicForm @register="registerFormReset" v-show="isReset" />
    <div class="flex justify-center">
      <div>
        <!-- <Button>取消</Button> -->
        <Button type="primary" class="ml-10px" @click="handleSave">保存</Button>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { ref, onMounted } from 'vue';
  // components
  import { useForm, BasicForm } from '/@/components/Form';
  import { Button } from 'ant-design-vue';
  // configs
  import { userformSchema, resetformSchema } from '../config';
  // service
  import { resetPassword } from '/@/api/system';
  // hooks
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useUserStore } from '/@/store/modules/user';

  const userStore = useUserStore();
  const isReset = ref(false);
  const { createMessage } = useMessage();
  const [registerForm, { setFieldsValue, validate }] = useForm({
    schemas: userformSchema,
    labelWidth: 80,
    showActionButtonGroup: false,
    baseColProps: { span: 24 },
    colon: true,
  });
  const [registerFormReset, { validate: validateReset, setFieldsValue: setResetFieldsValue }] =
    useForm({
      schemas: resetformSchema,
      labelWidth: 80,
      showActionButtonGroup: false,
      baseColProps: { span: 24 },
      colon: true,
    });

  async function handleSave() {
    if (isReset.value) {
      const data: any = await validateReset();
      await resetPassword({ username: data.username, password: data.password });
      createMessage.success('保存成功');
      const userInfo = userStore.getUserInfo;
      userStore.setUserInfo({ ...userInfo, realName: data.username });
    } else {
      const data: any = await validate();
      await resetPassword({ username: data.username });
      createMessage.success('保存成功');
      const userInfo = userStore.getUserInfo;
      userStore.setUserInfo({ ...userInfo, realName: data.username });
    }
  }
  onMounted(() => {
    if (userStore.getUserInfo.realName) {
      setFieldsValue({ username: userStore.getUserInfo.realName });
      setResetFieldsValue({ username: userStore.getUserInfo.realName });
    }
  });
</script>
<style lang="less" scoped></style>
