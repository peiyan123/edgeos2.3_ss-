<template>
  <PageWrapper :content-style="{ backgroundColor: '#fff', padding: '30px' }">
    <div class="flex justify-between">
      <Breadcrumb :routes="titleRoutes" />
      <div>
        <Tooltip title="最大化" placement="bottom" v-if="isFullscreen">
          <FullscreenExitOutlined role="full" @click="handleFullscreen" />
        </Tooltip>
        <Tooltip title="还原" placement="bottom" v-else>
          <FullscreenOutlined role="close" @click="handleFullscreen" />
        </Tooltip>
      </div>
    </div>
    <Divider />
    <div class="flex">
      <div style="width: 20%; margin-right: 2%">
        <div class="mb-15px">
          <p class="font-bold">选择日期</p>
          <DatePicker v-model:value="currentDate" class="w-full" @change="handleDateChange" />
        </div>
        <p class="font-bold">视频通道列表</p>
        <div class="p-10px bg-gray-100 mb-10px h-300px overflow-auto">
          <div class="flex items-center mb-10px" v-for="(item, index) in channelList" :key="index">
            <CameraOutlined />
            <span class="overflow-ellipsis truncate" :title="`【${item.id}】${item.name}`"
              >【{{ item.id }}】{{ item.name }}</span
            >
          </div>
        </div>
        <p class="font-bold">音频通道列表</p>
        <div class="p-10px bg-gray-100 mb-10px h-500px overflow-auto">
          <div class="mb-10px" v-for="(item, index) in audioArr" :key="index">
            <div
              class="flex items-center cursor-pointer"
              :class="{ active: currentAudioActive === index }"
              @click="handleSelectAudio(item, index)"
            >
              <Icon v-if="!item.isMuted" :icon="'iconoir:sound-low'" @click="handleMuted(item)" />
              <Icon
                v-if="item.isMuted"
                :icon="'teenyicons:sound-off-outline'"
                @click="handleMuted(item)"
              />
              <span class="overflow-ellipsis truncate" :title="`【${item.id}】${item.name}`"
                >【{{ item.id }}】{{ item.name }}</span
              >
            </div>
            <div class="flex items-center w-full" v-if="currentAudioActive === index">
              <Slider
                class="ss-silder"
                v-model:value="item.volume"
                @afterChange="
                  (value) => {
                    handleVolume(value, item);
                  }
                "
              />
              <span>{{ item.volume }}</span>
            </div>
          </div>
        </div>
      </div>
      <div style="width: 78%">
        <div ref="videoFullRef">
          <div class="flex flex-wrap">
            <div
              class="video-box relative"
              :class="{
                active: currentVideoActive === index,
                'h-300px': !isFullscreen,
                'h-[calc(50vh-60px)]': isFullscreen,
              }"
              v-for="(item, index) in videoArr"
              :key="index"
              @click="handleSelectVideo(item, index)"
            >
              <Hls
                :data="item"
                :cur-time="currentTime"
                :is-playing="isPlaying"
                :playback-rate="playbackRate"
                :ref="
                  (el) => {
                    item.hlsRef = el;
                  }
                "
                :cur-seconds="curSeconds"
                :isJump="isJump"
                :flvUrl="urlList[index]"
                :index="index"
                :currentDate="currentDate"
                @timeLineStatus="getTimeLineStatus"
              />
              <span class="absolute top-0 right-1 text-white">当前速率：X{{ playbackRate }}</span>
            </div>
          </div>
          <div style="padding-right: 0.8%">
            <TimerPlayer
              @play="handlePlay"
              @quickLeft="quickLeft"
              @quickRight="quickRight"
              @timeChange="handleTimeChange"
              @playback-rate="handlePlaybackRate"
              @jumpTime="handleJumpTime"
              ref="timerPlayerRef"
              :isPlaying="isTimerPlaying"
              :allTime="allTime"
              :curMaxSeconds="curMaxSeconds"
            />
          </div>
        </div>
        <AiRecognize ref="aiRecognizeRef" :video-data="aiVideoData" :audio-data="aiAudioData"
      /></div>
    </div>
    <div v-for="(item, index) in audioArr" :key="index" v-show="false">
      <Hls
        :ref="
          (el) => {
            item.actionRef = el;
          }
        "
        :data="item"
        type="audio"
        :cur-time="currentTime"
        :is-playing="isPlaying"
      />
    </div>
  </PageWrapper>
</template>
<script lang="ts" setup>
  import { onUnmounted, ref } from 'vue';
  // components
  import { PageWrapper } from '/@/components/Page';
  import AiRecognize from './components/AiRecognize.vue';
  import TimerPlayer from './components/TimerPlayer.vue';
  import Hls from './components/Hls.vue';
  import { Breadcrumb, Divider, Slider, DatePicker, Button, Tooltip } from 'ant-design-vue';
  import { Route } from 'ant-design-vue/lib/breadcrumb/Breadcrumb';
  import {
    CameraOutlined,
    FullscreenExitOutlined,
    FullscreenOutlined,
  } from '@ant-design/icons-vue';
  import Icon from '/@/components/Icon';
  // service
  import { deviceList } from '/@/api/device';
  import { searchPlaybackApi } from '/@/api/video';
  // utils
  import dayjs from 'dayjs';
  import { timeFormatUtils } from './config';
  // model
  // hooks
  import { useFullscreen, useTimeoutFn } from '@vueuse/core';
  import { originVideo } from '/@/constant';
  const routesPlayback = [
    {
      path: '',
      breadcrumbName: '本地回放',
    },
  ];
  const videoFullRef = ref();
  const { toggle, isFullscreen } = useFullscreen(videoFullRef);
  const currentDate = ref(dayjs(new Date()));
  const titleRoutes = ref<Route[]>(routesPlayback);
  const timerPlayerRef = ref();
  const channelList = ref<any>([]);
  const isPlaying = ref(false);
  const currentAudioActive = ref(-1);
  const currentVideoActive = ref(-1);
  const videoArr = ref<any>([
    { params: [], url: '', key: null, channelId: null, event: null, hlsRef: null },
    { params: [], url: '', key: null, channelId: null, event: null, hlsRef: null },
    { params: [], url: '', key: null, channelId: null, event: null, hlsRef: null },
    { params: [], url: '', key: null, channelId: null, event: null, hlsRef: null },
  ]);
  const audioArr = ref<any>([]);
  const aiRecognizeRef = ref();
  const aiVideoData = ref<any>([]);
  const aiAudioData = ref<any>([]);
  const allTime = ref<any>([]);
  const currentTime = ref<number>(0);
  const isJump = ref(false);
  const isTimerPlaying = ref(true);
  const urlList = ref([]);
  const playbackRate = ref<number>(1);
  const curMaxSeconds = ref<number>(0);
  const curSeconds = ref<number>(0);

  // 初始加载音视频通道列表以及对应的音视频数据
  init();
  async function init() {
    await Promise.all([getVideoChannelList(), getAudioChannelList()]);
    handleAllTime();
  }
  function quickRight() {
    if (isPlaying.value) {
      console.log(curSeconds.value);
      timerPlayerRef.value.setTime(curSeconds.value + 10);
      timerPlayerRef.value.timeLinePlay();
      videoArr.value.forEach((v) => {
        v.hlsRef.jumpTimeFun(curSeconds.value + 10);
      });
    }
  }
  function quickLeft() {
    if (isPlaying.value) {
      timerPlayerRef.value.setTime(curSeconds.value - 10);
      videoArr.value.forEach((v) => {
        v.hlsRef.jumpTimeFun(curSeconds.value - 10);
      });
    }
  }
  async function getVideoChannelList() {
    const result = await deviceList({ operatorType: 'HDMI' });
    channelList.value = result;
    if (!urlList.value.length) {
      urlList.value = channelList.value.map((v, i) => {
        return (
          originVideo +
          // location.protocol +
          // '//' +
          // location.hostname +
          // '10.0.73.26' +
          ':20080/record/video0/hdmiin' +
          i +
          '/' +
          currentDate.value.format('YYYY-MM-DD') +
          '.live.flv'
        );
      });
    }
    await handleVideoArr();
  }
  function getTimeLineStatus(status) {
    isTimerPlaying.value = status;
  }
  async function handleVideoArr() {
    const channels = channelList.value
      .map((item) => {
        return item.serialNumber;
      })
      .join(',');
    const date = currentDate.value.format('YYYY-MM-DD');
    const res = await searchPlaybackApi({ channels, date, aiType: 'TEXT' });
    // 1684944000000
    // const res = [
    //   {
    //     file: [
    //       {
    //         startTime: '1685376000000',
    //         endTime: '1685376600000',
    //         filePath: 'http://10.0.73.234:18080/vod/1.mp4/index.m3u8',
    //       },
    //       {
    //         startTime: '1685377200000',
    //         endTime: '1685377800000',
    //         filePath: 'http://10.0.73.234:18080/vod/h264_aac_30m.mp4/index.m3u8',
    //       },
    //       {
    //         startTime: '1685461800000',
    //         endTime: '1685463000000',
    //         filePath: 'http://10.0.73.234:18080/vod/h264_aac_30m.mp4/index.m3u8',
    //       },
    //     ],
    //     event: [
    //       {
    //         aiType: 0,
    //         content: '[{"label":"lgj","text":"lgj"}]',
    //         timestamp: '1684944630000',
    //         channel: '',
    //       },
    //     ],
    //   },
    //   {
    //     file: [
    //       {
    //         startTime: '1685378400000',
    //         endTime: '1685379000000',
    //         filePath: 'http://10.0.73.234:18080/vod/2.mp4/index.m3u8',
    //       },
    //       {
    //         startTime: '1685379600000',
    //         endTime: '1685380200000',
    //         filePath: 'http://10.0.73.234:18080/vod/3.mp4/index.m3u8',
    //       },
    //     ],
    //     event: [
    //       {
    //         aiType: 0,
    //         content: '[{"label":"lgj2","text":"lgj2"}]',
    //         timestamp: '1684944900000',
    //         channel: '',
    //       },
    //     ],
    //   },
    // ];
    res.map((item, index) => {
      // TODO: lgj 目前交互实现逻辑上最多支持4个
      if (index > 3) return;
      videoArr.value[index].params = item?.file;
      videoArr.value[index].event = item?.event;
      videoArr.value[index].channelId = channelList.value[index].id;
    });
    urlList.value = channelList.value.map((v, i) => {
      return (
        originVideo +
        // location.protocol +
        // '//' +
        // location.hostname +
        // '10.0.73.26' +
        ':20080/record/video0/hdmiin' +
        i +
        '/' +
        currentDate.value.format('YYYY-MM-DD') +
        '.live.flv'
      );
    });
    isPlaying.value = false;
  }

  async function getAudioChannelList() {
    const result = await deviceList({ operatorType: 'AUDIO' });
    audioArr.value = result.map((item) => {
      return {
        ...item,
        volume: 100,
        actionRef: null,
      };
    });
    await handleAudioArr();
  }

  async function handleAudioArr() {
    const channels = audioArr.value
      .map((item) => {
        return item.serialNumber;
      })
      .join(',');
    const date = currentDate.value.format('YYYY-MM-DD');
    const res = await searchPlaybackApi({ channels, date, aiType: 'VOICE' });
    res.map((item, index) => {
      audioArr.value[index].params = item?.file;
      audioArr.value[index].event = item?.event;
      audioArr.value[index].isMuted = false;
    });
  }

  // 获取所有通道的有数据的时间
  function handleAllTime() {
    const allTimeCache: any = [];
    videoArr.value.map((item) => {
      if (item.params) {
        const time = handleTime(item.params);
        allTimeCache.push(...time);
      }
    });
    audioArr.value.map((item) => {
      if (item.params) {
        const time = handleTime(item.params, 'D');
        allTimeCache.push(...time);
      }
    });
    allTimeCache.sort((a, b) => {
      const c = a.split('-')[0];
      const d = b.split('-')[0];
      return c - d;
    });
    console.log(allTimeCache);
    allTime.value = allTimeCache;
    timerPlayerRef.value.handleEvent(allTime.value);
    isPlaying.value = false;
  }

  async function handleDateChange(_: any, dateString: string) {
    urlList.value = channelList.value.map((v, i) => {
      return (
        originVideo +
        // location.protocol +
        // '//' +
        // // location.hostname +
        // '10.0.73.26' +
        ':20080/record/video0/hdmiin' +
        i +
        '/' +
        currentDate.value.format('YYYY-MM-DD') +
        '.live.flv'
      );
    });
    isPlaying.value = false;
    currentVideoActive.value = -1;
    currentAudioActive.value = -1;
    await Promise.all([handleVideoArr(), handleAudioArr()]);
    handleAllTime();
  }

  async function handleSelectVideo(item, index) {
    currentVideoActive.value = index;
    currentAudioActive.value = -1;
    // 时间条 事件显示 空白时间
    let time: any = [];
    // if (item.params) {
    //   time = time.concat(handleTime(item.params));
    // }
    if (item.event) {
      time = time.concat(handleEvent(item.event));
    }
    timerPlayerRef.value.handleEvent([...allTime.value, ...time]);
  }

  function handleTime(arr: any[], colorType = 'A') {
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

  // 设置进度条事件
  function handleEvent(arr: any[]) {
    return arr.map((item) => {
      let seconds = (item.timestamp - currentDate.value.startOf('day').valueOf()) / 1000;
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

  async function handlePlay({ isPlay, second }) {
    setTimeout(() => {
      const startTs = currentDate.value.startOf('day').valueOf();
      currentTime.value = handleSeconds(startTs + second * 1000);
      isPlaying.value = isPlay;
    }, 500);
  }
  function handleJumpTime(data) {
    curSeconds.value = data.time;
    videoArr.value.forEach((e) => {
      e.hlsRef.jumpTimeFun(data.time);
      e.hlsRef.setRecordSpeedFun(data.time);
    });
  }
  async function handleTimeChange({ isPlay, second }) {
    isPlaying.value = isPlay;
    const startTs = currentDate.value.startOf('day').valueOf();
    let selectT = startTs + second * 1000;
    const num = curSeconds.value - second;
    if (num > 1 || num < -1) {
      // 手动调节时间
      isJump.value = true;
      isTimerPlaying.value = false;
    } else {
      isJump.value = false;
      isTimerPlaying.value = true;
      handleAiData(currentTime.value);
    }
    curSeconds.value = second;
    currentTime.value = handleSeconds(startTs + second * 1000);
  }
  function handlePlaybackRate({ isPlay, rate }) {
    isPlaying.value = isPlay;
    playbackRate.value = rate;
  }

  async function handleSelectAudio(item, index) {
    currentAudioActive.value = index;
    currentVideoActive.value = -1;
    let time: any = [];
    // if (item.params) {
    //   time = time.concat(handleTime(item.params));
    // }
    if (item.event) {
      time = time.concat(handleEvent(item.event));
    }
    timerPlayerRef.value.handleEvent([...allTime.value, ...time]);
  }

  function handleMuted(item) {
    if (item.actionRef?.videoRef) {
      item.actionRef.videoRef.muted = !item.isMuted;
    }
    item.isMuted = !item.isMuted;
  }

  function handleVolume(volume, item) {
    const v = volume / 100;
    if (item.actionRef?.videoRef) {
      item.actionRef.videoRef.volume = v;
    }
  }

  // 处理ai识别数据
  function handleAiData(timestamp) {
    if (!aiRecognizeRef.value.aiSwitch) return;
    videoArr.value.map((item, index) => {
      if (item.event) {
        const data = item.event.find((a) => {
          return timestamp < Number(a.timestamp) + 1000 && timestamp > Number(a.timestamp) - 1000;
        });
        if (data) {
          aiVideoData.value[index] = { ...data, channelName: channelList.value[index].name };
        }
      }
    });
    audioArr.value.map((item, index) => {
      if (item.event) {
        const data = item.event.find((a) => {
          return timestamp < a.timestamp + 1000 && timestamp > a.timestamp - 1000;
        });
        aiAudioData.value[index] = { ...data, channelName: audioArr.value[index].name };
      }
    });
  }

  function handleSeconds(num) {
    return Math.floor(num);
  }

  const { start } = useTimeoutFn(
    () => {
      timerPlayerRef.value.timeSliderInstance.initAxis(true);
    },
    0,
    { immediate: false },
  );

  function handleFullscreen() {
    toggle();
    start();
  }

  onUnmounted(() => {});
</script>
<style lang="less" scoped>
  @import url('index.less');
</style>
