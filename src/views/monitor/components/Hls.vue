<template>
  <div class="relative h-full">
    <video v-if="type === 'audio'" class="w-full video-tag" ref="videoRef" autoplay></video>
    <div v-if="type === 'audio'" class="no-sign" v-show="isNoSign">无信号</div>
    <div v-if="type !== 'audio'" class="w-full video-tag" ref="videoRefDiv"></div>
    <div v-if="type !== 'audio'" class="no-sign" v-show="isNoSign">无信号</div>
  </div>
</template>
<script lang="ts" setup>
  import { onMounted, watch, onUnmounted, ref, unref } from 'vue';
  import Hls from 'hls.js';
  import { origin, originElse } from '../config';
  import { seekRecordStamp, setRecordSpeed } from '/@/api/video';
  import { Dayjs } from 'dayjs';
  import { consoleInfo } from '/@/utils/log';
  import { inject } from 'vue';
  import { propTypes } from '/@/utils/propTypes';
  const props = defineProps({
    data: {
      type: Object as PropType<any>,
    },
    curTime: {
      type: Number,
      default: 0,
    },
    curSeconds: {
      type: Number,
      default: 0,
    },
    isPlaying: {
      type: Boolean,
      default: true,
    },
    playbackRate: {
      type: Number,
      default: 1,
    },
    isJump: {
      type: Boolean,
      default: false,
    },
    flvUrl: {
      type: String,
      default: '',
    },
    currentDate: {
      type: Dayjs,
      default: '',
    },
    index: {
      type: Number,
      default: 0,
    },
    type: {
      type: String,
      default: 'video',
    },
  });
  const emits = defineEmits(['timeLineStatus']);
  const isNoSign = ref<boolean>(true);
  const hlsInstance = ref<any>();
  const videoRef = ref<any>();
  const videoRefDiv = ref<any>();
  const url = ref();
  let curStartTime;
  let curfileAllTime;
  // initVideo();
  function initVideo() {
    if (hlsInstance.value) return;
    // emits('timeLineStatus', { isTimerPlaying: false });
    hlsInstance.value = new JessibucaPro({
      container: videoRefDiv.value,
      useMSE: false,
      useWCS: false,
      videoBuffer: 0.5,
      videoBufferDelay: 0.5,
      networkDelay: 1,
      useSIMD: true,
      loadingTimeoutReplayTimes: -1,
      isResize: false,
      text: '',
      loadingText: '加载中',
      debug: true,
      showBandwidth: false, // 显示网速
      decoder: '/resource/js/decoder-pro.js',
      operateBtns: {
        fullscreen: false,
        screenshot: false,
        play: false,
        audio: false,
      },
      forceNoOffscreen: false,
    });
    hlsInstance.value.on('play', function (error) {
      isNoSign.value = false;
      jumpTimeFun();
      setRecordSpeedFun();
    });
  }
  watch(
    () => url.value,
    (newVal) => {
      if (!newVal) return;
      if (props.type !== 'audio') return;
      if (Hls.isSupported()) {
        if (hlsInstance.value) {
          hlsInstance.value.destroy();
          destroyListen();
        }
        hlsInstance.value = new Hls();
        hlsInstance.value.loadSource(newVal);
        hlsInstance.value.attachMedia(videoRef.value);
        createListen();
      } else if (videoRef.value.canPlayType('application/vnd.apple.mpegurl')) {
        videoRef.value.src = newVal;
      }
      isNoSign.value = false;
    },
  );

  // 新回放方案不需要前端回放
  watch(
    () => props.curTime,
    (newVal: any) => {
      if (!props.data?.params) return;
      if (!props.isPlaying) return;
      const result = props.data.params.find((item) => {
        if (newVal < item.endTime && newVal > item.startTime) {
          curStartTime = item.startTime;
          curfileAllTime = (item.endTime - item.startTime) / 1000;
          return true;
        }
      });
      if (result && result.filePath) {
        const a = result.filePath.replace('record/', '');
        url.value = originElse + `/vod/${a}/index.m3u8`;
        try {
          videoRef.value.play();
        } catch (e) {}
      }
    },
  );
  watch(
    () => props.playbackRate,
    (newVal) => {
      if (props.type === 'audio') {
        videoRef.value.playbackRate = newVal;
      } else {
        if (hlsInstance.value && hlsInstance.value.isPlaying()) {
          setRecordSpeedFun();
        }
      }
    },
  );
  watch(
    () => props.currentDate,
    async (newVal) => {
      setTimeout(async () => {
        if (hlsInstance.value) {
          await hlsInstance.value.destroy();
          hlsInstance.value = null;
          isNoSign.value = true;
        }
      }, 200);
    },
  );
  watch(
    () => props.isPlaying,
    async (newVal) => {
      if (!newVal && props.type !== 'video') {
        videoRef.value.pause();
      }
      if (!newVal && hlsInstance.value && props.type === 'video') {
        hlsInstance.value.pause();
      } else {
        if (props.type !== 'audio') {
          await initVideo();
          url.value = props.flvUrl;
          isNoSign.value = false;
          unref(hlsInstance.value).play(props.flvUrl);
        }
      }
    },
  );
  async function jumpTimeFun(time?) {
    let params = {
      stream: `video0/hdmiin${props.index}/${props.currentDate.format('YYYY-MM-DD')}`,
      stamp: time ? time * 1000 : props.curSeconds * 1000,
    };
    await seekRecordStamp(params);
    emits('timeLineStatus', { isTimerPlaying: true });
  }
  async function setRecordSpeedFun() {
    let params = {
      stream: `video0/hdmiin${props.index}/${props.currentDate.format('YYYY-MM-DD')}`,
      speed: props.playbackRate,
    };
    await setRecordSpeed(params);
  }
  function createListen() {
    if (props.type !== 'audio') return;
    videoRef.value.addEventListener('timeupdate', (e: any) => {
      const currentTime = e.target.currentTime;
      const diff = (props.curTime - curStartTime) / 1000;
      // console.log('diff', diff - curfileAllTime, diff);
      if (diff - curfileAllTime >= -1 || diff < 0 || props.curSeconds >= 86399) {
        return destroy();
      }
      if (Math.abs(diff - currentTime) > 1) {
        videoRef.value.currentTime = diff;
      }
    });
  }

  function destroyListen() {
    if (videoRef.value && videoRef.value.ontimeupdate) {
      videoRef.value.ontimeupdate = null;
    }
    // hlsInstance.value.removeAllListeners();
  }

  async function destroy() {
    if (hlsInstance.value) {
      await hlsInstance.value.destroy();
    }
    destroyListen();
    isNoSign.value = true;
    url.value = '';
  }

  onMounted(() => {
    createListen();
  });

  onUnmounted(() => {
    destroy();
  });

  function reset() {
    destroy();
  }

  watch(
    () => props.data?.params,
    () => {
      reset();
    },
  );

  defineExpose({
    videoRef,
    reset,
    jumpTimeFun,
    setRecordSpeedFun,
  });
</script>
<style lang="less" scoped>
  .no-sign {
    position: absolute;
    top: 50%;
    left: 50%;
    color: #fff;
  }
  .video-tag {
    object-fit: fill;
  }
</style>
