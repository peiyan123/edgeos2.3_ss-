<template>
  <div>
    <div class="mb-20px">
      <Row align="middle" :gutter="20" class="my-20px">
        <Col class="w-100px">通道号:</Col>
        <Col
          ><Select
            class="w-200px"
            placeholder="请选择音频通道号"
            :options="channelList"
            v-model:value="channelId"
            @change="handleChange"
        /></Col>
      </Row>
      <Row align="middle" :gutter="20" class="mb-20px">
        <Col class="w-100px">通道名称:</Col>
        <Col
          ><Input
            :disabled="true"
            v-model:value="channelName"
            class="w-200px"
            placeholder="展示视频通道名称"
        /></Col>
      </Row>
      <Row align="middle" :gutter="20">
        <Col>算法开启:</Col>
        <Col
          ><Switch v-model:checked="isAlgoOpen" checked-children="开" un-checked-children="关"
        /></Col>
      </Row>
    </div>
    <div class="bg-gray-100 p-20px">
      <div class="flex">
        <div style="width: 50%" class="mr-50px">
          <img :src="audioImg" alt="" />
        </div>
        <div style="width: 25%">
          <AlgoConfig :type="type" :algo-config="algoDetails" />
        </div>
      </div>
      <Button :disabled="saveBtnDisabled" class="mt-20px" type="primary" @click="handleSave"
        >保存并应用</Button
      >
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { ref, onMounted } from 'vue';
  // components
  import { Row, Col, Select, Switch, Button, Input } from 'ant-design-vue';
  import AlgoConfig from './AlgoConfig.vue';
  import audioImg from '/@/assets/images/u1597.png';
  // service
  import { deviceList } from '/@/api/device';
  import { getAlgoDetails, saveAlgoDetails } from '/@/api/algo';
  // hooks
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useRoute } from 'vue-router';

  const props = defineProps({
    algType: {
      type: String,
      default: '',
    },
    type: { type: String },
  });
  const channelList = ref<any>([]);
  const originalChannelList = ref<any>([]);
  const channelName = ref();
  const channelId = ref();
  const algoDetails = ref();
  const splDetails = ref();
  const saveBtnDisabled = ref(false);
  const { createMessage } = useMessage();

  const route = useRoute();
  console.log(route.query);

  async function getData() {
    const result = await deviceList({ operatorType: props.type });
    originalChannelList.value = result;
    channelList.value = result
      .filter((v) => v.ipAddress === 'rockchipes83881')
      .map((item) => {
        return {
          value: item.id,
          label: item.id,
        };
      });
  }
  const isAlgoOpen = ref(false);

  function handleChange(e) {
    const result = originalChannelList.value.find((item) => {
      return item.id === e;
    });
    if (result) {
      channelName.value = result.name;
    }
    handleAlgoDetails();
  }

  // 获取算法详情
  async function handleAlgoDetails() {
    const result = await getAlgoDetails({ id: channelId.value, algType: props.algType });
    algoDetails.value = result.algParam;
    splDetails.value = result.splParam;
    isAlgoOpen.value = !!algoDetails.value.startStatus;
  }

  async function handleSave() {
    if (!channelId.value) {
      return createMessage.info('请先选择通道');
    }
    try {
      saveBtnDisabled.value = true;
      await saveAlgoDetails({
        id: channelId.value,
        algParam: { ...algoDetails.value, startStatus: isAlgoOpen.value ? 1 : 0 },
        splParam: splDetails.value,
      });
      createMessage.success('保存成功');
    } finally {
      saveBtnDisabled.value = false;
    }
  }

  onMounted(async () => {
    await getData();
    if (route.query.id && route.query.type === 'AUDIO') {
      channelId.value = route.query.id;
      handleChange(route.query.id);
    }
  });
</script>

<style lang="less" scoped></style>
