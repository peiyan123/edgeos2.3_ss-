<template>
  <BasicModal
    width="1000px"
    title="预览"
    class="upload-preview-modal"
    v-bind="$attrs"
    @register="register"
    :canFullscreen="true"
    :showOkBtn="false"
    :destroyOnClose="true"
    :after-close="afterClose"
    :after-fullscreen="afterFullscreen"
  >
    <div class="bg-dark-500 relative" :class="fullClass">
      <Video
        :url="url"
        :isNotMute="isNotMute"
        :hasVideo="hasVideo"
        :is-play-back="isPlayBack"
        :is-playing="isPlaying"
        ref="videoRef"
      />
      <img v-if="type === 'audio'" class="w-full h-full absolute top-0" :src="musicGif" alt="" />
      <span v-if="isPlayBack" class="absolute top-0 right-1 text-white"
        >当前速率：X{{ currentRate }}</span
      >
    </div>
    <div v-if="isPlayBack" class="mt-5px">
      <TimerPlayer
        @quickLeft="quickLeft"
        @quickRight="quickRight"
        @play="handlePlay"
        @quick-left="handleLeft"
        @quick-right="handleRight"
        @timeChange="handleTimeChange"
        ref="timerPlayerRef"
        :wsMessage="wsMessage"
        :baseSeconds="baseSeconds"
      />
    </div>
    <div class="w-1/3" v-if="type === 'audio'">
      <VolumeSlider :volume="50" @change="handleVolume" @change-muted="handleChangeMuted" />
    </div>
  </BasicModal>
</template>
<script lang="ts" setup>
  import { Ref, ref, unref } from 'vue';
  // components
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import Video from './Video.vue';
  import musicGif from '/@/assets/images/music.gif';
  import TimerPlayer from '../../monitor/components/TimerPlayer.vue';
  import VolumeSlider from './VolumeSlider.vue';
  // services
  import { playControlApi, playStopApi } from '/@/api/video';
  import { playStartApi } from '/@/api/video';
  // utils
  import { origin, wsHostName } from '/@/constant';
  import { buildUUID } from '/@/utils/uuid';
  import dayjs from 'dayjs';
  import { useWebSocket } from '@vueuse/core';
  import { timeFormatUtils } from '../../monitor/config';

  defineEmits(['register']);
  const props = defineProps({
    type: {
      type: String,
    },
    isNotMute: {
      type: Boolean,
      default: false,
    },
    hasVideo: {
      type: Boolean,
      default: true,
    },
    isPlayBack: {
      type: Boolean,
      default: false,
    },
  });
  const url = ref('');
  const playId = ref();
  const channelId = ref();
  const key = ref();
  const baseSeconds = ref(0);
  const isPlaying = ref(false);
  const wsMessage = ref();
  const timerPlayerRef = ref();
  const itemData = ref();
  const currentDate = ref();
  const socket = ref();
  const currentRate = ref<number>(1);
  const videoRef = ref();
  const fullClass = ref('h-400px');
  const [register] = useModalInner(async (data: any) => {
    if (props.isPlayBack) {
      playId.value = buildUUID();
      itemData.value = data;
      currentDate.value = dayjs(data.fileTime);
      initWebsocket();
      console.log(handleFile(data.fileList));
      const event = [...handleFile(data.fileList), ...handleEvent(data.eventTime)];
      timerPlayerRef.value.handleEvent(event);
    } else {
      url.value = data.url;
    }
  });

  function handlePlay({ isPlay, second }) {
    isPlaying.value = isPlay;
    if (isPlay) {
      handlePlayStart(second);
    } else {
      handlePlayStop();
    }
  }
  function quickRight() {
    console.log('quickRight');
  }
  function quickLeft() {
    console.log('quickLeft');
  }
  async function handleTimeChange({ isPlay, second }) {
    isPlaying.value = isPlay;
    const startTs = currentDate.value.startOf('day').valueOf();
    console.log(startTs, second);
    const position = handleSeconds(startTs + second * 1000);
    await playControlApi({
      playId: playId.value,
      cmdType: 'PLAYCONTRL',
      data: { position, rate: currentRate.value },
    });
  }
  async function handleLeft({ isPlay, second }) {
    isPlaying.value = isPlay;
    if (currentRate.value > 0) {
      currentRate.value = currentRate.value / 2;
      if (currentRate.value < 1) {
        currentRate.value = -2;
      }
    } else {
      currentRate.value = currentRate.value * 2;
      if (currentRate.value < -8) {
        currentRate.value = 1;
      }
    }
    await playControlApi({
      playId: playId.value,
      cmdType: 'PLAYCONTRL',
      data: { rate: currentRate.value },
    });
  }

  async function handleRight({ isPlay, second }) {
    isPlaying.value = isPlay;
    if (currentRate.value > 0) {
      currentRate.value = currentRate.value * 2;
      if (currentRate.value > 8) {
        currentRate.value = 1;
      }
    } else {
      currentRate.value = currentRate.value / 2;
      if (currentRate.value > -2) {
        currentRate.value = 1;
      }
    }
    await playControlApi({
      playId: playId.value,
      cmdType: 'PLAYCONTRL',
      data: { rate: currentRate.value },
    });
  }

  async function handlePlayStart(second) {
    baseSeconds.value = second;
    const startTs = currentDate.value.startOf('day').valueOf();
    const startPlayTime = handleSeconds(startTs + second * 1000);
    const fileNames = unref(itemData).fileList.map((item) => {
      return {
        filename: item.filePath,
        beginTime: item.startTime,
        endTime: item.endTime,
      };
    });
    const result = await playStartApi({
      playId: playId.value,
      cmdType: 'PLAYFILES',
      startPlayTime,
      channels: [
        {
          channelType: unref(itemData).fileType,
          channelId: unref(itemData).channel,
          fileNames,
        },
      ],
    });
    channelId.value = unref(itemData).channel;
    key.value = result[0].previewUrl;
    url.value = result[0].previewUrl.replace(new URL(result[0].previewUrl).origin, origin);
    // url.value = result[0].previewUrl;
  }

  async function handlePlayStop() {
    let req: any = [{ channelId: channelId.value, key: key.value, playId: playId.value }];
    await playStopApi(req);
  }
  // 时间轴显示文件片段
  function handleFile(arr: Array<any>) {
    return arr.map((item) => {
      let start = (item.startTime - currentDate.value.startOf('day').valueOf()) / 1000;
      let h = timeFormatUtils(Math.floor(start / 60 / 60));
      let m = timeFormatUtils(Math.floor((start - h * 60 * 60) / 60));
      let s = timeFormatUtils(Math.floor(start % 60));
      let end = (item.endTime - currentDate.value.startOf('day').valueOf()) / 1000;
      let h1 = timeFormatUtils(Math.floor(end / 60 / 60));
      let m1 = timeFormatUtils(Math.floor((end - h1 * 60 * 60) / 60));
      let s1 = timeFormatUtils(Math.floor(end % 60));
      return `${h}${m}${s}-${h1}${m1}${s1}-A`;
    });
  }

  // 设置时间轴事件
  function handleEvent(arr: any[]) {
    return arr.map((item) => {
      let seconds = (item - currentDate.value.startOf('day').valueOf()) / 1000;
      let h = timeFormatUtils(Math.floor(seconds / 60 / 60));
      let m = timeFormatUtils(Math.floor((seconds - h * 60 * 60) / 60));
      let s = timeFormatUtils(Math.floor(seconds % 60));
      seconds = seconds + 1;
      let h1 = timeFormatUtils(Math.floor(seconds / 60 / 60));
      let m1 = timeFormatUtils(Math.floor((seconds - h1 * 60 * 60) / 60));
      let s1 = timeFormatUtils(Math.floor(seconds % 60));
      return `${h}${m}${s}-${h1}${m1}${s1}-B`;
    });
  }

  async function afterClose() {
    if (props.isPlayBack) {
      handlePlayStop();
      socket.value.close();
    }
    isPlaying.value = false;
    url.value = '';
    baseSeconds.value = 0;
  }

  async function afterFullscreen(e: Ref<boolean>) {
    if (e.value) {
      fullClass.value = props.type == 'audio' ? 'h-[calc(100%-25px)]' : 'h-full';
    } else {
      fullClass.value = 'h-400px';
    }
  }
  // websocket
  function initWebsocket() {
    socket.value = useWebSocket(
      `${location.protocol.includes('s') ? 'wss' : 'ws'}://${wsHostName}/api/mqtt/${playId.value}`,
      {
        heartbeat: {
          message: 'ping',
          interval: 30000,
        },
        autoReconnect: {
          retries: 3,
          delay: 1000,
          onFailed() {},
        },
        onMessage: (_: WebSocket, event: MessageEvent) => {
          const message = JSON.parse(event.data);
          console.log('进度', message);
          wsMessage.value = message[0];
        },
      },
    );
  }

  function handleSeconds(num) {
    return Math.floor(num);
  }

  function handleVolume(v) {
    if (videoRef.value.instance) {
      videoRef.value.instance.setVolume(v);
    }
  }

  function handleChangeMuted(e) {
    if (videoRef.value.instance) {
      if (e) {
        videoRef.value.instance.mute();
      } else {
        videoRef.value.instance.cancelMute();
      }
    }
  }
</script>
<style lang="less" scoped></style>
