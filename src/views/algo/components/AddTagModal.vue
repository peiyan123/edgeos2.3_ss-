<template>
  <BasicModal
    v-bind="$attrs"
    @register="register"
    :title="'添加标签'"
    width="600px"
    :canFullscreen="false"
    @ok="handleOk"
  >
    <BasicForm class="pt-90px" @register="registerForm">
      <template #tagName="{ model, field }">
        <!-- <Select
          mode="multiple"
          allow-clear
          v-model:value="model[field]"
          placeholder="请选择通道名称进行搜索"
          :options="channelNameList"
        /> -->

        <Select
          v-model:value="model[field]"
          :show-search="true"
          :not-found-content="null"
          :showArrow="false"
          :filter-option="true"
          :autoClearSearchValue="false"
          @search="handleSearch"
          @blur="handleBlur"
          @change="handleChange"
        >
          <Select.Option v-for="(item, index) in list" :key="index" :value="item">
            {{ item }}</Select.Option
          >
        </Select>
      </template>
    </BasicForm>
  </BasicModal>
</template>
<script lang="ts" setup>
  // components
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { BasicForm, useForm } from '/@/components/Form';
  import { Select } from 'ant-design-vue';
  import { ref } from 'vue';
  const emits = defineEmits(['register', 'success']);
  const [registerForm, { validate, resetFields, setFieldsValue }] = useForm({
    schemas: [
      {
        field: 'name',
        label: '名称',
        component: 'Select',
        required: true,
        itemProps: {
          labelCol: { span: 5 },
          wrapperCol: { span: 16 },
        },
        rules: [{ max: 50 }],
        slot: 'tagName',
      },
    ],
    labelWidth: 80,
    showActionButtonGroup: false,
    baseColProps: { span: 24 },
    colon: true,
  });
  const list = ref(['系统时间识别框']);
  const tagName = ref('');
  const [register, { closeModal }] = useModalInner(({ name }) => {
    if (name) {
      setFieldsValue({ name });
    } else {
      resetFields();
    }
  });

  async function handleOk() {
    const values = await validate();
    emits(
      'success',
      values.name === '系统时间识别框' ? 'Xi_Tong_Shi_Jian_Shi_Bie_Kuang' : values.name,
    );
    closeModal();
  }
  function handleSearch(value) {
    handleChange(value);
  }
  function handleChange(value) {
    // if (list.value.indexOf(value) == -1) {
    //   list.value.push(value);
    // }
    if (value) {
      tagName.value = value;
    }
    setFieldsValue({
      name: value != null && value != '' ? value : [],
    });
  }
  function handleBlur(e) {
    if (e.target.value) {
      //判断数组里有没输入的值 如果没有再赋值
      if (list.value.indexOf(e.target.value) == -1) {
        list.value.push(e.target.value);
        setTimeout(() => {
          setFieldsValue({
            name: tagName.value,
          });
        }, 100);
      }
    }
  }
</script>
<style lang="less" scoped></style>
