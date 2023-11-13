<template>
  <div>
    <div class="w-1/3 my-30px">
      <Row align="middle" class="mb-10px">
        <Col :span="layout.left">通道号:</Col>
        <Col :span="layout.right"
          ><Select
            class="w-full"
            placeholder="请选择视频通道号"
            v-model:value="formModel.channel"
            :options="channelList"
            @change="handleSelect"
        /></Col>
      </Row>
      <Row align="middle">
        <Col :span="layout.left">通道名称:</Col>
        <Col :span="layout.right"
          ><Input
            :disabled="true"
            v-model:value="formModel.channelName"
            placeholder="展示视频通道名称"
        /></Col>
      </Row>
    </div>
    <div class="bg-gray-100 px-80px py-50px">
      <div class="flex">
        <div style="width: 50%" class="bg-dark-500" ref="videoContainerRef"
          ><OsdAreaRule
            :url="url"
            :show-date="showDate"
            :show-name="showName"
            :date-position="datePosition"
            :name-position="namePosition"
            :name="name"
            :date-format="dateFormat"
            :time-format="timeFormat"
            :font-color="fontColor"
            :font-size="fontSize"
            :osd-attribute="osdAttribute"
            @change-date-pos="changeDatePos"
            @change-name-pos="changeNamePos"
        /></div>
        <div style="width: 40%" class="px-80px"
          ><OsdConfigControl
            :details="osdDetails"
            @show-date="changeShowDate"
            @show-name="changeShowName"
            @change-color="changeColor"
            @change-date="changeDate"
            @change-font-size="changeFontSize"
            @change-osd-attr="changeOsdAttr"
            @change-time="changeTime"
        /></div>
      </div>
      <Button class="mt-40px" type="primary" @click="handleSave">保存并应用</Button>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { reactive, ref } from 'vue';
  // components
  import { Row, Col, Select, Input, Button } from 'ant-design-vue';
  import OsdConfigControl from './OsdConfigControl.vue';
  import OsdAreaRule from './OsdAreaRule.vue';
  // service
  import { deviceList } from '/@/api/device';
  import { getOsd, saveOsd } from '/@/api/system';
  // hooks
  import { useMessage } from '/@/hooks/web/useMessage';
  // utils
  import { origin } from '/@/constant';

  const channelList = ref<any>([]);
  const originalChannelList = ref<any>();
  const layout = { left: 5, right: 16 };
  const formModel = reactive({
    channel: undefined,
    channelName: '',
  });
  const url = ref();
  const osdDetails = ref();
  const videoContainerRef = ref();
  const { createMessage } = useMessage();
  const showName = ref(true);
  const showDate = ref(true);
  const namePosStr = ref('');
  const datePosStr = ref('');
  const namePosition = ref();
  const datePosition = ref();
  //
  const dateFormat = ref();
  const timeFormat = ref();
  const osdAttribute = ref();
  const fontSize = ref();
  const fontColor = ref();
  const name = ref();

  function changeShowDate(e) {
    showDate.value = e;
  }
  function changeShowName(e) {
    showName.value = e;
  }
  function changeColor(e) {
    fontColor.value = e;
  }
  function changeDate(e) {
    dateFormat.value = e;
  }
  function changeTime(e) {
    timeFormat.value = e;
  }
  function changeOsdAttr(e) {
    osdAttribute.value = e;
  }
  function changeFontSize(e) {
    fontSize.value = e;
  }

  getData();
  async function getData() {
    const result = await deviceList({ operatorType: 'HDMI' });
    originalChannelList.value = result;
    channelList.value = result.map((item) => {
      return {
        value: item.id,
        label: item.id,
      };
    });
  }

  function handleSelect(e) {
    formModel.channelName = e;
    const result = originalChannelList.value.find((item) => {
      return item.id === e;
    });
    if (result) {
      formModel.channelName = result.name;
      url.value = result.rtmpUrl.replace(new URL(result.rtmpUrl).origin, origin);
    }
    handleGetDetails();
  }
  // 获取详情
  async function handleGetDetails() {
    const result = await getOsd({ channel: formModel.channel });
    osdDetails.value = result;
    showName.value = result.displayName;
    showDate.value = result.displayDate;
    namePosStr.value = result.namePosition;
    datePosStr.value = result.datePosition;
    dateFormat.value = result.dateFormat;
    timeFormat.value = result.timeFormat;
    osdAttribute.value = result.osdAttribute;
    fontSize.value = result.fontSize;
    name.value = result.channelName;
    const offsetWidth = videoContainerRef.value.offsetWidth;
    const offsetHeight = videoContainerRef.value.offsetHeight;
    if (datePosStr.value) {
      const a = datePosStr.value.split(',');
      const left = (+a[0] * offsetWidth) / 100;
      const top = (+a[1] * offsetHeight) / 100;
      datePosition.value = { left, top };
    }
    if (namePosStr.value) {
      const a = namePosStr.value.split(',');
      const left = (+a[0] * offsetWidth) / 100;
      const top = (+a[1] * offsetHeight) / 100;
      namePosition.value = { left, top };
    }
  }

  async function handleSave() {
    if (!formModel.channel) {
      return createMessage.info('请先选择通道');
    }

    const req = {
      ...osdDetails.value,
      ...formModel,
      namePosition: namePosStr.value,
      datePosition: datePosStr.value,
    };
    console.log(req);
    await saveOsd(req);
    createMessage.success('保存成功');
  }

  function changeNamePos(e) {
    namePosStr.value = e;
  }
  function changeDatePos(e) {
    datePosStr.value = e;
  }
</script>
<style lang="less" scoped></style>
