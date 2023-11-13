<template>
  <div>
    <Row align="middle" v-if="['HDMI'].includes(type)" class="mb-10px">
      <Col :span="layout.left">输入编码格式</Col>
      <Col :span="layout.right">
        <!-- <Select placeholder="请选择" class="w-full" v-model:value="controlConfig.voInputFormat">
          <Select.Option value="BGR">BGR</Select.Option>
          <Select.Option value="RGB">RGB</Select.Option>
          <Select.Option value="NV12">NV12</Select.Option>
          <Select.Option value="NV24">NV24</Select.Option>
          <Select.Option value="YUYV">YUYV</Select.Option>
        </Select> -->
        <Input v-model:value="controlConfig.voInputFormat" disabled class="w-full" />
      </Col>
    </Row>
    <Row align="middle" v-if="['HDMI'].includes(type)" class="mb-10px">
      <Col :span="layout.left">输入分辨率</Col>
      <Col :span="layout.right">
        <!-- <Select placeholder="请选择" class="w-full" v-model:value="controlConfig.voInputResolution">
          <Select.Option value="1*1">自定义</Select.Option>
          <Select.Option value="4096*2160">4096*2160</Select.Option>
          <Select.Option value="3840*2160">3840*2160</Select.Option>
          <Select.Option value="2880*1620">2880*1620</Select.Option>
          <Select.Option value="1920*1200">1920*1200</Select.Option>
          <Select.Option value="1920*1080">1920*1080</Select.Option>
          <Select.Option value="1600*1200">1600*1200</Select.Option>
          <Select.Option value="1280*1024">1280*1024</Select.Option>
          <Select.Option value="1280*720">1280*720</Select.Option>
        </Select> -->
        <Input v-model:value="controlConfig.voInputResolution" disabled class="w-full" />
      </Col>
    </Row>
    <Row
      align="middle"
      v-if="['HDMI'].includes(type) && controlConfig.voInputResolution == '1*1'"
      class="mb-10px"
    >
      <Col :span="layout.left" />
      <Col :span="layout.right">
        <InputNumber
          placeholder="请输入"
          v-model:value="voInputResolution1"
          :precision="0"
          :min="1"
          style="width: 80px !important"
          :max="10000"
        />*
        <InputNumber
          placeholder="请输入"
          v-model:value="voInputResolution2"
          :precision="0"
          style="width: 80px !important"
          :min="1"
          :max="10000"
        />
        <Button @click="voInputResolutionChange()">确定</Button>
      </Col>
    </Row>
    <Row align="middle" v-if="['HDMI'].includes(type)" class="mb-10px">
      <Col :span="layout.left">输出分辨率</Col>
      <Col :span="layout.right">
        <!-- <Select
          placeholder="请选择"
          class="w-full"
          v-model:value="controlConfig.voOutputResolution"
        >
          <Select.Option value="1*1">自定义</Select.Option>
          <Select.Option value="4096*2160">4096*2160</Select.Option>
          <Select.Option value="3840*2160">3840*2160</Select.Option>
          <Select.Option value="2880*1620">2880*1620</Select.Option>
          <Select.Option value="1920*1200">1920*1200</Select.Option>
          <Select.Option value="1920*1080">1920*1080</Select.Option>
          <Select.Option value="1600*1200">1600*1200</Select.Option>
          <Select.Option value="1280*1024">1280*1024</Select.Option>
          <Select.Option value="1280*720">1280*720</Select.Option>
        </Select> -->
        <Input v-model:value="controlConfig.voOutputResolution" disabled class="w-full" />
      </Col>
    </Row>
    <Row
      align="middle"
      v-if="['HDMI'].includes(type) && controlConfig.voOutputResolution == '1*1'"
      class="mb-10px"
    >
      <Col :span="layout.left" />
      <Col :span="layout.right">
        <InputNumber
          placeholder="请输入"
          v-model:value="voOutputResolution1"
          :precision="0"
          :min="1"
          style="width: 80px !important"
          :max="10000"
        />*
        <InputNumber
          placeholder="请输入"
          v-model:value="voOutputResolution2"
          :precision="0"
          style="width: 80px !important"
          :min="1"
          :max="10000"
        />
        <Button @click="voOutputResolutionChange()">确定</Button>
      </Col>
    </Row>
    <Row align="middle" v-if="['HDMI'].includes(type)" class="mb-10px">
      <Col class="require" :span="layout.left">输出间隔</Col>
      <Col :span="layout.right">
        <InputNumber
          placeholder="请输入"
          v-model:value="controlConfig.voOutputFps"
          :precision="0"
          :min="1"
          :max="60"
          class="input-number"
        />
      </Col>
    </Row>
    <Row align="middle" v-if="['AUDIO'].includes(type)" class="mb-10px">
      <Col :span="layout.left">识别精度</Col>
      <Col :span="layout.right">
        <Select placeholder="请选择" class="w-full" v-model:value="controlConfig.aoModelType">
          <Select.Option :value="0">0</Select.Option>
          <Select.Option :value="1">1</Select.Option>
          <Select.Option :value="2">2</Select.Option>
        </Select>
      </Col>
    </Row>
  </div>
</template>
<script lang="ts" setup>
  import { ref, watch } from 'vue';
  // components
  import { Row, Col, Select, InputNumber, Button, Input } from 'ant-design-vue';
  import { useTrain } from '../useTrain';
  const props = defineProps({
    algoConfig: {
      type: Object as PropType<any>,
      default: () => {},
    },
    type: { type: String, default: '' },
  });

  const { controlConfig } = useTrain();
  const voInputResolution1 = ref(1);
  const voInputResolution2 = ref(1);
  const voOutputResolution1 = ref(1);
  const voOutputResolution2 = ref(1);

  const layout = { left: 7, right: 14 };
  function voOutputResolutionChange() {
    controlConfig.value.voOutputResolution =
      voOutputResolution1.value + '*' + voOutputResolution2.value;
  }
  function voInputResolutionChange() {
    controlConfig.value.voInputResolution =
      voInputResolution1.value + '*' + voInputResolution2.value;
  }
  watch(
    () => props.algoConfig,
    (newVal) => {
      if (newVal) {
        controlConfig.value = newVal;
        voInputResolution1.value = 1;
        voInputResolution2.value = 1;
        voOutputResolution1.value = 1;
        voOutputResolution2.value = 1;
      }
    },
  );
</script>
<style lang="less" scoped>
  .input-number {
    min-width: unset;
    width: 100%;
  }
  .require {
    &::before {
      display: inline-block;
      margin-right: 4px;
      color: #ff4d4f;
      font-size: 14px;
      font-family: SimSun, sans-serif;
      line-height: 1;
      content: '*';
    }
  }
</style>
