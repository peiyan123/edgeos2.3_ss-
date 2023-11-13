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
    :min-height="540"
    @cancel="handelCancel"
  >
    <div class="bg-dark-500 relative" :class="fullClass">
      <Hls
        :data="files"
        :cur-time="currentTime"
        :cur-seconds="curSeconds"
        :is-playing="isPlaying"
        :playback-rate="playbackRate"
        ref="hlsRef"
        :isJump="isJump"
        :index="index"
        :flvUrl="flvUrl"
        :currentDate="currentDate"
        :type="type"
        @timeLineStatus="getTimeLineStatus"
      />
      <img v-if="type === 'audio'" class="w-full h-full absolute top-0" :src="musicGif" alt="" />
    </div>
    <div class="mt-5px">
      <TimerPlayer
        @play="handlePlay"
        @quickLeft="quickLeft"
        @quickRight="quickRight"
        @timeChange="handleTimeChange"
        @playback-rate="handlePlaybackRate"
        @jumpTime="handleJumpTime"
        ref="timerPlayerRef"
        :allTime="allTime"
        :type="type"
        :isPlaying="isPlaying"
        :auto-play="true"
        :cur-max-seconds="curMaxSeconds"
      />
    </div>
    <div class="w-1/3" v-if="type === 'audio'">
      <VolumeSlider :volume="100" @change="handleVolume" @change-muted="handleChangeMuted" />
    </div>
  </BasicModal>
</template>
<script lang="ts" setup>
  import { Ref, ref, unref, watch } from 'vue';
  // components
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import Hls from '../../monitor/components/Hls.vue';
  import musicGif from '/@/assets/images/music.gif';
  import TimerPlayer from '../../monitor/components/TimerPlayer.vue';
  import VolumeSlider from '../../device/components/VolumeSlider.vue';
  // services
  // utils
  import dayjs from 'dayjs';
  import { timeFormatUtils } from '../../monitor/config';
  import { useTimeoutFn } from '@vueuse/core';
  import { originVideo } from '/@/constant';
  defineEmits(['register']);
  const props = defineProps({
    type: {
      type: String,
    },
  });
  const isPlaying = ref(false);
  const timerPlayerRef = ref();
  const itemData = ref();
  const currentDate = ref();
  const allTime = ref<any>([]);
  const currentTime = ref<number>(0);
  const playbackRate = ref<number>(1);
  const files = ref();
  const curMaxSeconds = ref<number>(0);
  const curSeconds = ref<number>(0);
  const hlsRef = ref();
  const isJump = ref(false);
  const flvUrl = ref('');
  const index = ref(0);
  const isTimerPlaying = ref(false);

  const fullClass = ref('h-400px');
  const [register] = useModalInner(async (data: any) => {
    currentDate.value = dayjs(data.fileTime);
    itemData.value = data;
    files.value = { params: data.fileList };
    handleAllTime();

    if (props.type !== 'audio') {
      switch (data.ipAddress) {
        case '/dev/video0':
          index.value = 0;
          break;
        case '/dev/video11':
          index.value = 1;
          break;
        case '/dev/video22':
          index.value = 2;
          break;
        case '/dev/video33':
          index.value = 3;
          break;
      }
      flvUrl.value = getUrl(
        originVideo +
          // location.protocol +
          //   '//' +
          //   //location.hostname +
          //   '10.0.73.26' +
          ':20080/record/video0' +
          data.ipAddress +
          '/' +
          currentDate.value.format('YYYY-MM-DD') +
          '.live.flv',
      );
    } else {
      isTimerPlaying.value = true;
    }
  });
  function quickRight() {
    if (isPlaying.value) {
      console.log(curSeconds.value);
      hlsRef.value.jumpTimeFun(curSeconds.value + 10);
      timerPlayerRef.value.setTime(curSeconds.value + 10);
    }
  }
  function quickLeft() {
    if (isPlaying.value) {
      hlsRef.value.jumpTimeFun(curSeconds.value - 10);
      timerPlayerRef.value.setTime(curSeconds.value - 10);
    }
  }
  function handelCancel() {
    curSeconds.value = 0;
    isTimerPlaying.value = false;
  }
  function getTimeLineStatus(status) {
    isTimerPlaying.value = status.isTimerPlaying;
  }
  function getUrl(url) {
    return url
      .replace('/dev/video0', '/hdmiin0')
      .replace('/dev/video11', '/hdmiin1')
      .replace('/dev/video22', '/hdmiin2')
      .replace('/dev/video33', '/hdmiin3');
  }
  function handleAllTime() {
    allTime.value = handleFile(itemData.value.fileList);
    let event: any = [];
    if (itemData.value.eventTime) {
      event = handleEvent(itemData.value.eventTime);
    }
    timerPlayerRef.value.handleEvent([...allTime.value, ...event]);
  }

  async function handlePlay({ isPlay, second }) {
    isPlaying.value = isPlay;
  }
  function handleJumpTime(data) {
    curSeconds.value = data.time;
    if (props.type === 'audio') return;
    hlsRef.value.jumpTimeFun(data.time);
    hlsRef.value.setRecordSpeedFun(data.time);
  }
  async function handleTimeChange({ isPlay, second }) {
    isPlaying.value = isPlay;
    const startTs = currentDate.value.startOf('day').valueOf();
    let selectT = startTs + second * 1000;
    // const num = curSeconds.value - second;
    // if (num > 1 || num < -1) {
    //   // 手动调节时间
    //   isJump.value = true;
    //   isTimerPlaying.value = false;
    // } else {
    //   isJump.value = false;
    //   isTimerPlaying.value = true;
    // }
    curSeconds.value = second;
    currentTime.value = handleSeconds(startTs + second * 1000);
  }
  function handlePlaybackRate({ isPlay, rate }) {
    isPlaying.value = isPlay;
    playbackRate.value = rate;
  }

  // 时间轴显示文件片段
  function handleFile(arr: Array<any>) {
    let colorType = 'A';
    if (props.type === 'audio') {
      colorType = 'D';
    }
    return arr.map((item) => {
      let start = (item.startTime - currentDate.value.startOf('day').valueOf()) / 1000;
      if (start < 0) {
        start = 0;
      }
      let h = timeFormatUtils(Math.floor(start / 60 / 60));
      let m = timeFormatUtils(Math.floor((start - h * 60 * 60) / 60));
      let s = timeFormatUtils(Math.floor(start % 60));
      let end = (item.endTime - currentDate.value.startOf('day').valueOf()) / 1000;
      if (end > 86400) {
        end = 86400;
      }
      let h1 = timeFormatUtils(Math.floor(end / 60 / 60));
      let m1 = timeFormatUtils(Math.floor((end - h1 * 60 * 60) / 60));
      let s1 = timeFormatUtils(Math.floor(end % 60));
      if (end > curMaxSeconds.value) {
        curMaxSeconds.value = end;
      }
      return `${h}${m}${s}-${h1}${m1}${s1}-${colorType}`;
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
    isPlaying.value = false;
    playbackRate.value = 1;
    allTime.value = [];
  }

  const { start } = useTimeoutFn(
    () => {
      timerPlayerRef.value.timeSliderInstance.initAxis(true);
    },
    0,
    { immediate: false },
  );

  async function afterFullscreen(e: Ref<boolean>) {
    start();
    if (e.value) {
      fullClass.value = props.type == 'audio' ? 'h-[calc(100%-140px)]' : 'h-[calc(100%-120px)]';
    } else {
      fullClass.value = 'h-400px';
    }
  }

  function handleSeconds(num) {
    return Math.floor(num);
  }

  function handleVolume(v) {
    if (hlsRef.value.videoRef) {
      hlsRef.value.videoRef.volume = v;
    }
  }

  function handleChangeMuted(e) {
    if (hlsRef.value.videoRef) {
      hlsRef.value.videoRef.muted = e;
    }
  }
</script>
<style lang="less" scoped></style>
