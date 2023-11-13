<template>
  <div>
    <Row class="mb-20px">
      <Col :span="layout.left">显示名称</Col>
      <Col :span="layout.right">
        <Switch
          v-model:checked="controlConfig.displayName"
          checked-children="开"
          un-checked-children="关"
          @change="handleShowName"
        />
      </Col>
    </Row>
    <Row class="mb-20px">
      <Col :span="layout.left">显示日期</Col>
      <Col :span="layout.right">
        <Switch
          v-model:checked="controlConfig.displayDate"
          checked-children="开"
          un-checked-children="关"
          @change="handleShowDate"
        />
      </Col>
    </Row>
    <!-- <Row class="mb-20px">
      <Col :span="layout.left">显示星期</Col>
      <Col :span="layout.right">
        <Switch
          v-model:checked="controlConfig.displayWeek"
          checked-children="开"
          un-checked-children="关"
        />
      </Col>
    </Row> -->
    <Row class="mb-20px">
      <Col :span="layout.left">日期格式</Col>
      <Col :span="layout.right">
        <Select
          v-model:value="controlConfig.dateFormat"
          class="w-full"
          placeholder="请选择日期格式"
          :options="dateFormatsSelect"
          @change="changeDate"
        />
      </Col>
    </Row>
    <Row class="mb-20px">
      <Col :span="layout.left">时间格式</Col>
      <Col :span="layout.right">
        <Select
          v-model:value="controlConfig.timeFormat"
          class="w-full"
          placeholder="请选择时间格式"
          :options="timeFormatsSelect"
          @change="changeTime"
        />
      </Col>
    </Row>
    <Row class="mb-20px">
      <Col :span="layout.left">OSD属性</Col>
      <Col :span="layout.right">
        <Select
          :options="osdAttrSelect"
          v-model:value="controlConfig.osdAttribute"
          class="w-full"
          placeholder="请选择OSD属性"
          @change="changeOsdAttr"
        />
      </Col>
    </Row>
    <Row class="mb-20px">
      <Col :span="layout.left">字体大小</Col>
      <Col :span="layout.right">
        <Select
          v-model:value="controlConfig.fontSize"
          class="w-full"
          placeholder="请选择字体大小"
          :options="fontSizesSelect"
          @change="changeFontSize"
        />
      </Col>
    </Row>
    <Row>
      <Col :span="layout.left">字体颜色</Col>
      <Col :span="layout.right">
        <!-- <Select class="w-full" placeholder="请选择字体颜色" /> -->
        <Vue3ColorPicker
          :isWidget="false"
          v-model:pureColor="controlConfig.fontColor"
          v-model:gradientColor="gradientColor"
          format="rgb"
          :disableAlpha="true"
          @pureColorChange="changeColor"
        />
      </Col>
    </Row>
  </div>
</template>
<script lang="ts" setup>
  import { ref, watch } from 'vue';
  // components
  import { Row, Col, Select, Switch } from 'ant-design-vue';
  import { osdAttrConfig } from '../config';
  // service
  import { getOsdConfig } from '/@/api/system';

  const props = defineProps({
    details: {
      type: Object,
    },
  });
  const emits = defineEmits([
    'showName',
    'showDate',
    'changeColor',
    'changeFontSize',
    'changeOsdAttr',
    'changeDate',
    'changeTime',
  ]);
  const layout = { left: 7, right: 14 };
  const osdAttrSelect = ref([]);
  const fontSizesSelect = ref([]);
  const dateFormatsSelect = ref([]);
  const timeFormatsSelect = ref([]);
  const controlConfig = ref<any>({
    displayName: true,
    fontColor: 'red',
    dateFormat: undefined,
    displayDate: true,
    displayWeek: undefined,
    fontSize: undefined,
    osdAttribute: undefined,
    timeFormat: undefined,
  });
  const gradientColor = ref('linear-gradient(0deg, rgba(0, 0, 0, 1) 0%, rgba(0, 0, 0, 1) 100%)');

  // 获取选项配置 前端固定写死暂不用调接口获取
  getSelectConfig();
  async function getSelectConfig() {
    const result = await getOsdConfig();
    osdAttrSelect.value = result.osdAttributes.map((item) => {
      return { label: osdAttrConfig[item], value: item };
    });
    fontSizesSelect.value = result.fontSizes.map((item) => {
      return { label: item, value: item };
    });
    dateFormatsSelect.value = result.dateFormats.map((item) => {
      return { label: item, value: item };
    });
    timeFormatsSelect.value = result.timeFormats.map((item) => {
      return { label: item, value: item };
    });
  }

  watch(
    () => props.details,
    (newVal) => {
      controlConfig.value = newVal;
    },
  );

  function handleShowDate(e) {
    emits('showDate', e);
  }
  function handleShowName(e) {
    emits('showName', e);
  }
  function changeDate(e) {
    console.log(e);
    emits('changeDate', e);
  }
  function changeTime(e) {
    console.log(e);
    emits('changeTime', e);
  }
  function changeOsdAttr(e) {
    console.log(e);
    emits('changeOsdAttr', e);
  }
  function changeFontSize(e) {
    console.log(e);
    emits('changeFontSize', e);
  }
  function changeColor(e) {
    console.log(e);
    emits('changeColor', e);
  }
</script>
<style lang="less" scoped>
  .input-number {
    min-width: unset;
    width: 100%;
  }
</style>
