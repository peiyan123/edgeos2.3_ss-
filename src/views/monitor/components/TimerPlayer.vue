<template>
  <div id="timeSlider"></div>
  <div class="flex justify-center border border-gray-400 relative">
    <div class="flex items-center">
      <fast-backward-outlined
        class="text-size-30px cursor-pointer operate-hover"
        @click="handleLeft"
      />
      <caret-right-outlined
        class="text-size-30px operate-hover"
        v-if="!isPlay"
        @click="handlePlay"
      />
      <pause-outlined class="text-size-30px operate-hover" v-if="isPlay" @click="handlePlay" />
      <fast-forward-outlined class="text-size-30px operate-hover" @click="handleRight" />
      <div class="ml-30px mt-3px w-80px">
        <Dropdown :trigger="['hover']">
          <a class="ant-dropdown-link"> 速率：{{ rate }} </a>
          <template #overlay>
            <Menu @click="handleMenuClick">
              <Menu.Item :key="0.5">0.5</Menu.Item>
              <Menu.Item :key="1">1</Menu.Item>
              <Menu.Item :key="1.5">1.5</Menu.Item>
              <Menu.Item :key="2">2</Menu.Item>
            </Menu>
          </template>
        </Dropdown>
      </div>
    </div>
    <div class="absolute right-10px top-3px">
      <Tag color="#ff0000" class="ss-ant-tag" />报警<Tag
        color="default"
        class="ss-ant-tag"
      />空白<Tag color="#008000" class="ss-ant-tag" />视频
      <span class="tag-audio">
        <span></span>
      </span>
      音频
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { onMounted, onUnmounted, ref, watch } from 'vue';
  import {
    FastBackwardOutlined,
    CaretRightOutlined,
    PauseOutlined,
    FastForwardOutlined,
  } from '@ant-design/icons-vue';
  import { Tag, Dropdown, Menu } from 'ant-design-vue';
  // utils
  import timeSlider from '/@/timerSlider/components/timeSlider.js';
  import { timeTranslateSecondsUtils } from '../config';
  // hooks
  import { useIntervalFn, useTimeoutFn } from '@vueuse/shared';
  import { useMessage } from '/@/hooks/web/useMessage';

  const props = defineProps({
    allTime: {
      type: Array<any>,
      default: () => [],
    },
    curMaxSeconds: {
      type: Number,
      default: 0,
    },
    autoPlay: {
      type: Boolean,
      default: false,
    },
    isPlaying: {
      type: Boolean,
      default: true,
    },
    type: {
      type: String,
      default: 'video',
    },
  });

  const emits = defineEmits([
    'play',
    'quickLeft',
    'quickRight',
    'timeChange',
    'playbackRate',
    'jumpTime',
  ]);
  const isPlay = ref(false);
  const timeSliderInstance = ref();
  let curChunkIndex: any = -1;
  const rate = ref(1);
  const timeRate = ref(1000);
  const { createMessage } = useMessage();

  function handleMenuClick(e) {
    rate.value = e.key;
    timeRate.value = 1000 / rate.value;
    emits('playbackRate', { isPlay: isPlay.value, rate: rate.value });
  }

  function initTimerSlider() {
    timeSliderInstance.value = new timeSlider('#timeSlider', {
      curDaytimeChunkArray: ['000000-240000-C'],
      presentSeconds: 0,
      timeChunkType: {
        A: 'green',
        B: 'rgb(255,0,0,0.3)',
        C: 'white',
        D: 'rgb(0,0,255,0.3)',
      },
      speed: 1,
      isInitialPlay: false,
      hander: (time, oldTime) => {
        console.log('time', time); // time 当前点击合理时间段的时间
        if (!isInTime(time)) {
          setTime(oldTime);
        } else {
          emits('jumpTime', {
            time: time,
          });
        }
      },
    });
  }

  // 判断点击是否在alltime（有数据）时间段里
  function isInTime(seconds) {
    let isInTimeChunk = false;
    for (let i = 0; i < props.allTime.length; i++) {
      let timeArr = props.allTime[i].split('-');
      let startTimeSecond = timeTranslateSecondsUtils(timeArr[0]);
      let endTimeSecond = timeTranslateSecondsUtils(timeArr[1]);
      if (startTimeSecond <= seconds && seconds <= endTimeSecond) {
        isInTimeChunk = true;
        curChunkIndex = i;
        break;
      }
    }
    return isInTimeChunk;
  }

  function handlePlay() {
    if (!props.allTime.length) return createMessage.info('当前日期无视频可回放');
    isPlay.value = !isPlay.value;
    if (isPlay.value && props.isPlaying) {
      timeLinePlay();
    } else {
      timeLineStop();
    }
    emits('play', { isPlay: isPlay.value, second: timeSliderInstance.value.presentSeconds });
  }
  const { pause, resume, isActive } = useIntervalFn(
    () => {
      if (!props.allTime.length) return;
      const seconds = timeSliderInstance.value.presentSeconds + 1;
      // const endTimeArr = props.allTime[props.allTime.length - 1].split('-');
      // const endSecond = timeTranslateSecondsUtils(endTimeArr[1]);
      console.log(seconds > props.curMaxSeconds);
      if (seconds > props.curMaxSeconds) return handlePlay();
      if (isInTime(seconds)) {
        setTime(seconds);
      } else {
        if (curChunkIndex === -1) {
          const aArr = props.allTime[0];
          let atimeArr = aArr.split('-');
          let a = timeTranslateSecondsUtils(atimeArr[0]);
          curChunkIndex = 0;
          setTime(a);
        } else {
          const bArr = props.allTime[curChunkIndex + 1];
          let btimeArr = bArr.split('-');
          let b = timeTranslateSecondsUtils(btimeArr[0]);
          setTime(b);
        }
      }
      emits('timeChange', {
        isPlay: isPlay.value,
        second: timeSliderInstance.value.presentSeconds,
      });
    },
    timeRate,
    { immediate: false },
  );

  function timeLinePlay() {
    resume();
  }
  function timeLineStop() {
    pause();
  }
  watch(
    () => props.isPlaying,
    () => {
      if (props.isPlaying) {
        timeLinePlay();
      }
    },
  );
  function handleLeft() {
    // if (curChunkIndex === -1) return;
    // pause();
    // const aArr = props.allTime[curChunkIndex];
    // let atimeArr = aArr.split('-');
    // let a = timeTranslateSecondsUtils(atimeArr[0]);
    // const seconds = timeSliderInstance.value.presentSeconds - 10;
    // const diff = a - seconds;
    // if (diff < 0) {
    //   timeSliderInstance.value.presentSeconds = seconds;
    //   resume();
    //   isPlay.value = true;
    //   return;
    // }
    // curChunkIndex = curChunkIndex - 1;
    // if (curChunkIndex === -1) {
    //   timeSliderInstance.value.presentSeconds = seconds;
    //   resume();
    //   isPlay.value = true;
    //   return;
    // }
    // const bArr = props.allTime[curChunkIndex];
    // let btimeArr = bArr.split('-');
    // let b = timeTranslateSecondsUtils(btimeArr[1]);
    // timeSliderInstance.value.presentSeconds = b - Math.abs(diff);
    // resume();
    // isPlay.value = true;
    emits('quickLeft');
  }
  function handleRight() {
    // pause();
    // const seconds = timeSliderInstance.value.presentSeconds + 10;
    // const aArr = props.allTime[curChunkIndex];
    // let atimeArr = aArr.split('-');
    // let a = timeTranslateSecondsUtils(atimeArr[1]);
    // const diff = seconds - a;
    // if (diff < 0) {
    //   timeSliderInstance.value.presentSeconds = seconds;
    //   resume();
    //   isPlay.value = true;
    //   return;
    // }
    // const bArr = props.allTime[curChunkIndex + 1];
    // if (bArr) {
    //   let btimeArr = bArr.split('-');
    //   let b = timeTranslateSecondsUtils(btimeArr[0]);
    //   timeSliderInstance.value.presentSeconds = b + Math.abs(diff);
    // } else {
    //   timeSliderInstance.value.presentSeconds = a - 2; // -2目的解决定时器初始判断
    // }
    // resume();
    // isPlay.value = true;
    emits('quickRight');
  }

  function setTimeLine() {
    timeSliderInstance.value.timeNow = timeSliderInstance.value.secondsTranslateTimeUtils(
      timeSliderInstance.value.presentSeconds,
    );
    timeSliderInstance.value.timeLinePresentDom.innerText = timeSliderInstance.value.timeNow;
    timeSliderInstance.value.setTimeLineLeft();
  }

  function handleEvent(arr, type: 'default' | 'init' = 'default') {
    if (type === 'default') {
      timeSliderInstance.value.timeChunkArray = ['000000-240000-C', ...arr];
    } else {
      timeSliderInstance.value.timeChunkArray = arr;
    }
    timeSliderInstance.value.initTimeChunk();
  }

  function setTime(seconds) {
    timeSliderInstance.value.presentSeconds = seconds;
    setTimeLine();
  }

  function reset() {
    setTime(0);
    isPlay.value = false;
    curChunkIndex = -1;
    rate.value = 1;
    timeRate.value = 1000;
    pause();
  }

  onMounted(() => {
    initTimerSlider();
    if (props.autoPlay) {
      useTimeoutFn(() => {
        handlePlay();
      }, 500);
    }
  });

  onUnmounted(() => {
    isPlay.value = false;
    curChunkIndex = -1;
    rate.value = 1;
    timeRate.value = 1000;
  });

  watch(
    () => props.allTime,
    () => {
      reset();
    },
  );

  defineExpose({
    timeSliderInstance,
    setTime,
    handleEvent,
    reset,
    timeLineStop,
    timeLinePlay,
  });
</script>
<style lang="less" scoped>
  .tag-audio {
    display: inline-block;
    height: 10px;
    width: 10px;
    margin-left: 10px;
    margin-right: 5px;
    position: relative;
    > span {
      width: 10px;
      height: 5px;
      position: absolute;
      bottom: 0;
      background: blue;
    }
  }
  ::v-deep(.ss-ant-tag) {
    margin-left: 10px;
    &.ant-tag {
      height: 10px;
      padding: 0 4px;
    }
  }
  .operate-hover {
    // transition: all 0.2s ease;
    &:hover {
      scale: 1.1;
    }
  }
</style>
<style>
  @import url('/@/timerSlider/statics/css/index.css');
  #timeSlider {
    padding-top: 40px;
    padding-bottom: 15px;
  }
</style>
