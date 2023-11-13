<template>
  <div>
    <div class="flex items-center justify-between my-5px p-5px">
      <div class="flex items-center">
        <span class="font-blod mr-10px">AI识别</span>
        <Switch v-model:checked="aiSwitch" checked-children="开" un-checked-children="关" />
      </div>
      <!-- <RadioGroup v-model:value="aiTypeSwitch">
        <RadioButton value="text">文字识别</RadioButton>
        <RadioButton value="voice">语音识别</RadioButton>
      </RadioGroup> -->
      <div class="flex">
        <span
          class="px-15px h-32px leading-32px border-1 cursor-pointer border-r-0"
          @click="aiTypeSwitch = 'text'"
          :class="aiTypeSwitch === 'text' ? 'border-blue-500 text-blue-500' : 'border-slate-400'"
          >文字识别</span
        >
        <span
          class="px-15px h-32px leading-32px border-1 cursor-pointer"
          @click="aiTypeSwitch = 'voice'"
          :class="aiTypeSwitch === 'voice' ? 'border-blue-500 text-blue-500' : 'border-slate-400'"
          >语音识别</span
        >
      </div>
    </div>
    <div v-if="aiSwitch">
      <div
        v-if="aiTypeSwitch === 'text' && showVideo"
        class="flex p-15px bg-gray-100 max-h-250px overflow-y-auto"
      >
        <div
          class="w-full"
          v-for="(item, index) in videoData"
          :key="index"
          :style="{ display: item?.channelName ? 'block' : 'none' }"
        >
          <div>
            <p class="font-blod">屏幕{{ index + 1 }}</p>
            <p
              ><span>通道号：</span><span>{{ item?.channel }}</span></p
            >
            <p
              ><span>通道名称：</span><span>{{ item?.channelName }}</span></p
            >
            <p v-for="(a, i) in handleData(item?.content)" :key="i"
              ><span>{{ a?.label }}</span
              >：<span>{{ a?.text }}</span></p
            >
          </div>
        </div>
      </div>
      <div
        v-if="aiTypeSwitch !== 'text' && showAudio"
        class="p-15px justify-between bg-gray-100 max-h-250px overflow-y-auto"
      >
        <p
          v-for="(item, index) in audioData"
          :key="index"
          :style="{
            display: currentAudioActive == index || currentAudioActive == -2 ? 'block' : 'none',
          }"
          >音频通道{{ index + 1 }}：{{ item?.content }}</p
        >
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { ref, watch } from 'vue';
  // components
  import { Switch, Radio } from 'ant-design-vue';
  import { isObject } from 'lodash-es';

  const props = defineProps({
    videoData: {
      type: Array<any>,
      default: () => [],
    },
    audioData: {
      type: Array<any>,
      default: () => [],
    },
    showVideo: {
      type: Boolean,
      default: true,
    },
    showAudio: {
      type: Boolean,
      default: true,
    },
    currentAudioActive: {
      type: Number,
      default: -2,
    },
  });
  // TODO:生产环境渲染失败
  // const RadioGroup = Radio.Group;
  // const RadioButton = Radio.Button;

  watch(
    () => props.videoData,
    (val) => {
      console.log(val);
    },
  );
  const aiSwitch = ref(true);
  const aiTypeSwitch = ref('text'); // text,voice

  function calcW() {
    const a = props.videoData.filter((b) => {
      return b.channelName;
    });
    if (a.length == 1) return 'w-full';
    if (a.length == 2) return 'w-1/2';
    if (a.length == 3) return 'w-1/3';
    if (a.length == 4) return 'w-1/4';
  }

  function handleData(data) {
    if (!data) return [];
    if (isObject(data)) {
      return data;
    } else {
      const res = JSON.parse(data);
      return res;
    }
  }

  defineExpose({
    aiSwitch,
    aiTypeSwitch,
  });
</script>
<style lang="less" scoped></style>
