<template>
  <div>
    <Row>
      <Col :span="4" class="bg-gray-100">
        <div class="flex flex-col items-center py-60px">
          <p>
            <Button
              class="w-200px"
              :type="type == 'video' ? 'primary' : 'default'"
              @click="handleVideo"
              >视频设置</Button
            >
          </p>
          <p>
            <Button
              class="w-200px"
              :type="type == 'audio' ? 'primary' : 'default'"
              @click="handleAudio"
              >音频设置</Button
            >
          </p>
          <p>
            <Button
              class="w-200px"
              :type="type == 'record' ? 'primary' : 'default'"
              @click="handleRecord"
              >录制设置</Button
            >
          </p>
        </div>
      </Col>
      <Col :push="1" :span="19" class="bg-gray-100 py-60px">
        <div class="w-2/3 m-auto">
          <BasicForm v-show="type == 'video'" @register="registerFormVideo">
            <template #stream="{ model, field }">
              <Select
                v-model:value="model[field]"
                @select="handleStreamChange"
                :options="streamOptions"
              />
            </template>
            <template #format="{ model, field }">
              <Select v-model:value="model[field]" :options="formatOptions" />
            </template>

            <template #channel="{ model, field }">
              <Select v-model:value="model[field]" :options="channelList" @change="handleSelect" />
            </template>
            <template #status="{ model, field }">
              <Switch v-model="model[field]" />
            </template>
            <template #resolution="{ model, field }">
              <Select v-model:value="model[field]" :options="resolutionOptions" />
              <div v-if="model[field] === '1*1'" style="display: flex; margin-top: 5px">
                <InputNumber :min="2" :max="10000000" v-model:value="resolution1" />*
                <InputNumber :min="2" :max="10000000" v-model:value="resolution2" />
                <Button type="primary" @click="handleResolution">保存</Button>
              </div>
            </template>
            <!-- <template #fps="{ model, field }">
              <Select v-model:value="model[field]" :options="fpsOptions" />
            </template> -->
            <template #bps="{ model, field }">
              <Select v-model:value="model[field]" :options="bpsOptions" />
              <div v-if="model[field] === '1*1'" style="display: flex; margin-top: 5px">
                <InputNumber :min="2" :max="10000000" v-model:value="bps" />
                <Button type="primary" @click="handleBps">保存</Button>
              </div>
            </template>
          </BasicForm>
          <BasicForm v-show="type == 'audio'" @register="registerFormAudio">
            <!-- <template #bps="{ model, field }">
              <Select v-model:value="model[field]" :options="bpsAudioOptions" />
            </template> -->
            <template #track="{ model, field }">
              <Select v-model:value="model[field]" :options="trackOptions" />
            </template>
            <template #frequency="{ model, field }">
              <Select v-model:value="model[field]" :options="frequencyOptions" />
            </template>
            <template #quantization="{ model, field }">
              <Select v-model:value="model[field]" :options="quantizationOptions" />
            </template>
          </BasicForm>
          <BasicForm v-show="type == 'record'" @register="registerFormRecord">
            <template #recordTime="{ model, field }">
              <Select placeholder="请选择" class="w-full" v-model:value="model[field]">
                <Select.Option value="10">10分钟</Select.Option>
                <Select.Option value="20">20分钟</Select.Option>
                <Select.Option value="30">30分钟</Select.Option>
              </Select>
            </template>
            <template #badNum="{ model, field }">
              <span style="margin-left: 15px">异常文件数量</span>
              <Input disabled style="width: 60px; margin-left: 15px" v-model:value="model[field]" />
              <Button
                :disabled="model[field] == 0 || isFixing == 'true'"
                size="small"
                :loading="isFixing == 'true'"
                style="margin-left: 15px"
                type="primary"
                @click="startRepair"
                >开始修复</Button
              >
            </template>
          </BasicForm>
        </div>
        <div class="flex justify-center"
          ><Button type="primary" @click="handleSave">保存并应用</Button></div
        >
      </Col>
    </Row>
  </div>
</template>
<script lang="ts" setup>
  import { ref, watchEffect, watch, onUnmounted } from 'vue';
  // components
  import { useForm, BasicForm } from '/@/components/Form';
  import { Row, Col, Button, Select, InputNumber, Input, Switch } from 'ant-design-vue';
  // configs
  import { audioformSchema, recordformSchema, videoformSchema } from '../config';
  import {
    getAudioSelectConfig,
    getSystemVideo,
    getVideoSelectConfig,
    setTimeLen,
    saveSystemVideo,
    getSystemAudio,
    saveSystemAudio,
    getStoreConfigetTimeLen,
    getFixingStatus,
    startFixingFile,
  } from '/@/api/system';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { deviceList } from '/@/api/device';

  const props = defineProps({
    pType: {
      type: String,
      default: 'video',
    },
    pId: {
      type: String,
      default: '',
    },
  });
  console.log(props.pId);
  const type = ref(props.pType);
  const id = ref(props.pId);
  const { createMessage } = useMessage();
  const allVideoConfig = ref([]);
  const bps = ref(1);
  const resolution1 = ref(1);
  const resolution2 = ref(1);
  const timer = ref<NodeJS.Timer | null>(null);
  const isFixing = ref('false');
  watchEffect(async () => {
    type.value = props.pType;
  });

  const [
    registerFormVideo,
    {
      setFieldsValue: setFieldsValueVideo,
      validate: validateVideo,
      updateSchema: updateSchemaVideo,
      getFieldsValue: getFieldsValueVideo,
    },
  ] = useForm({
    schemas: videoformSchema,
    labelWidth: 80,
    showActionButtonGroup: false,
    baseColProps: { span: 24 },
    colon: true,
  });

  const [registerFormAudio, { setFieldsValue, validate }] = useForm({
    schemas: audioformSchema,
    labelWidth: 80,
    showActionButtonGroup: false,
    baseColProps: { span: 24 },
    colon: true,
  });
  const [registerFormRecord, { setFieldsValue: setFieldsValueRecord, validate: validateRecord }] =
    useForm({
      schemas: recordformSchema,
      labelWidth: 80,
      showActionButtonGroup: false,
      baseColProps: { span: 24 },
      colon: true,
    });

  const streamOptions = ref([
    { label: '主码流', value: 'main' },
    { label: '子码流', value: 'minor' },
  ]);
  const formatOptions = ref([]);
  const channelList = ref([]);
  const originalChannelList = ref([]);
  const resolutionOptions = ref([]);
  const bpsOptions = ref([]);
  const fpsOptions = ref([]);
  const trackOptions = ref([]);
  const frequencyOptions = ref([]);
  const quantizationOptions = ref([]);
  const bpsAudioOptions = ref([]);
  // watch(
  //   () => props.pId,
  //   (newVal) => {
  //     console.log(newVal, '999999999999999999');
  //     handleSelect(newVal);
  //   },
  // );
  handleGetVideoConfig();
  async function handleGetVideoConfig() {
    const result = await getVideoSelectConfig();
    allVideoConfig.value = result;
    const data: any = allVideoConfig.value.find((a: any) => {
      return a.stream === 'main';
    });
    formatOptions.value = transformOptions(data.formats);
    resolutionOptions.value = transformOptions(data.resolutions);
    bpsOptions.value = transformOptions(data.bpss);
    // handleStreamChange('main');
  }
  function handleSelect(e) {
    const result = originalChannelList.value.find((item: any) => {
      return item.id === e;
    });
    console.log(result);
    if (result) {
      setFieldsValueVideo({
        channelName: result.name,
      });
      getDetails();
      updateSchemaVideo([
        { field: 'resolution', ifShow: false },
        { field: 'startStatus', ifShow: false },
      ]);
    }
  }
  getChannelListData();
  async function getChannelListData() {
    const result = await deviceList({ operatorType: 'HDMI' });
    originalChannelList.value = result;
    channelList.value = result.map((item) => {
      return {
        value: item.id,
        label: item.id,
      };
    });
    setTimeout(() => {
      if (props.pId) {
        handleSelect(props.pId);
      }
    }, 200);
  }
  function handleBps() {
    if (bps.value === null || bps.value === 1) {
      return createMessage.error('请输入正确的码率');
    }
    setFieldsValueVideo({
      bps: bps.value ? bps.value : 2,
    });
  }
  function handleResolution() {
    console.log(resolution1.value);
    if (
      resolution1.value === null ||
      resolution2.value === null ||
      resolution1.value === 1 ||
      resolution2.value === 1
    ) {
      return createMessage.error('请输入正确的分辨率');
    }
    setFieldsValueVideo({
      resolution:
        (resolution1.value !== null ? resolution1.value : 2) +
        '*' +
        (resolution2.value !== null ? resolution2.value : 2),
    });
  }
  async function startRepair() {
    await startFixingFile();
    createMessage.success('开始修复');
    isFixing.value = 'true';
  }
  async function getStoreConfigetTime() {
    const data = await getStoreConfigetTimeLen();
    setFieldsValueRecord({
      recordTime: (Number(data.max_second) / 60).toString(),
    });
  }
  // getRepair();
  // getFixSta();
  function getRepair() {
    if (timer.value) {
      clearInterval(timer.value);
      timer.value = null;
    } else {
      timer.value = setInterval(async () => {
        getFixSta();
      }, 5000);
    }
  }
  async function getFixSta() {
    const data = await getFixingStatus();
    console.log(data, '99999999');
    isFixing.value = data.is_fixing;
    setFieldsValueRecord({
      badNum: data.broken_file_num,
    });
  }
  onUnmounted(() => {
    clearInterval(timer.value);
    timer.value = null;
  });
  handleGetAudioConfig();
  async function handleGetAudioConfig() {
    const data = await getAudioSelectConfig();
    trackOptions.value = transformOptions(data.tracks);
    quantizationOptions.value = transformOptions(data.quantizations);
    frequencyOptions.value = transformOptions(data.frequencies);
    // bpsAudioOptions.value = transformOptions(data.bpss);
  }

  function handleStreamChange(e) {
    playbackVideo(e);
    const data: any = allVideoConfig.value.find((a: any) => {
      return a.stream === e;
    });
    formatOptions.value = transformOptions(data.formats);
    resolutionOptions.value = transformOptions(data.resolutions);
    resolutionOptions.value.unshift({
      label: '自定义',
      value: '1*1',
    });
    bpsOptions.value = transformOptions(data.bpss);
    bpsOptions.value.unshift({
      label: '自定义',
      value: '1*1',
    });

    if (data.stream === 'main') {
      bpsOptions.value = bpsOptions.value.filter((v: any) => v.label !== '自定义');
    }
    console.log(data, bpsOptions.value);
    // fpsOptions.value = transformOptions(data.fpss);
    updateSchemaVideo([
      { field: 'resolution', ifShow: e === 'minor' },
      { field: 'startStatus', ifShow: e === 'minor' },
    ]);
  }

  function transformOptions(data) {
    return data.map((item) => {
      return { label: item, value: item };
    });
  }

  function handleAudio() {
    type.value = 'audio';
    getDetails();
  }
  function handleRecord() {
    type.value = 'record';
    getDetails();
  }

  function handleVideo() {
    type.value = 'video';
    // getDetails();
  }

  // 获取
  async function getDetails() {
    if (type.value === 'video') {
      playbackVideo('main');
    } else if (type.value === 'record') {
      getStoreConfigetTime();
    } else {
      const result = await getSystemAudio();
      setFieldsValue(result);
    }
  }
  getAudio();
  async function getAudio() {
    const result = await getSystemAudio();
    setFieldsValue(result);
  }
  // 回显视频设置
  async function playbackVideo(stream: 'main' | 'minor') {
    const result = await getSystemVideo({ channel: getFieldsValueVideo().channel || props.pId });
    const res = result.find((a) => {
      return a.stream === stream;
    });
    setFieldsValueVideo(res);
  }

  async function handleSave() {
    if (type.value === 'video') {
      const data = await validateVideo();
      await saveSystemVideo(data);
      createMessage.success('保存成功');
    } else if (type.value === 'audio') {
      const data = await validate();
      await saveSystemAudio(data);
      createMessage.success('保存成功');
    } else {
      const data = await validateRecord();
      let params = {
        max_second: (Number(data.recordTime) * 60).toString(),
      };
      await setTimeLen(params);
      createMessage.success('保存成功');
    }
  }
</script>
<style lang="less" scoped></style>
