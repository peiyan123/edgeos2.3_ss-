<template>
  <PageWrapper :content-style="{ backgroundColor: '#fff', padding: '30px' }">
    <div class="flex justify-between">
      <Breadcrumb :routes="titleRoutes" />
      <Tooltip title="最大化" placement="bottom" v-if="!isFullscreen">
        <FullscreenOutlined role="full" @click="toggle" />
      </Tooltip>
    </div>
    <Divider />
    <div class="flex">
      <div style="width: 20%; margin-right: 2%">
        <p class="font-bold">视频通道列表</p>
        <div class="p-10px bg-gray-100 mb-10px h-300px overflow-auto">
          <div
            class="flex items-center mb-10px cursor-pointer"
            :class="{ active: currentChannelActive === index }"
            v-for="(item, index) in channelList"
            :key="index"
            @click="handleSelectChannel(item, index)"
          >
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
              <!-- <sound-outlined /> -->
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
              <Slider class="ss-silder" v-model:value="item.volume" @change="handleVolume" />
              <span>{{ item.volume }}</span>
            </div>
          </div>
        </div>
      </div>
      <div style="width: 78%">
        <div class="flex flex-wrap" ref="videoFullRef">
          <div
            class="video-box"
            :class="{
              active: currentVideoActive === index,
              'h-300px': !isFullscreen,
            }"
            v-for="(item, index) in videoArr"
            :key="index"
            @click="handleSelectVideo(item, index)"
          >
            <Video :key-self="index" :activeKey="currentVideoActive" :url="url" />
          </div>
        </div>
        <AiRecognize
          :show-audio="showAiAudio"
          :show-video="showAiVideo"
          :video-data="aiVideoData"
          :audio-data="aiAudioData"
          :currentAudioActive="currentAudioActive"
          ref="aiRecognizeRef"
      /></div>
    </div>
    <Video
      :url="audioUrl"
      :is-play-back="true"
      v-show="false"
      :is-not-mute="true"
      :has-video="false"
      ref="audioPlayerRef"
    />
  </PageWrapper>
</template>
<script lang="ts" setup>
  import { onUnmounted, ref } from 'vue';
  // components
  import { PageWrapper } from '/@/components/Page';
  import AiRecognize from './components/AiRecognize.vue';
  import Video from './components/Video.vue';
  import { Breadcrumb, Divider, Slider, Tooltip } from 'ant-design-vue';
  import { Route } from 'ant-design-vue/lib/breadcrumb/Breadcrumb';
  import { CameraOutlined, SoundOutlined, FullscreenOutlined } from '@ant-design/icons-vue';
  import Icon from '/@/components/Icon';
  // hooks
  import mitt from '/@/utils/mitt';
  import { createPlayerContext } from './useContext';
  import { useFullscreen, useWebSocket } from '@vueuse/core';
  // service
  import { deviceList } from '/@/api/device';
  import dayjs from 'dayjs';
  // utils
  import { debounce } from 'lodash-es';
  import { origin, wsHostName } from '/@/constant';

  const routesMonitor = [
    {
      path: '',
      breadcrumbName: '视频监控',
    },
  ];
  const videoFullRef = ref();
  const { toggle, isFullscreen } = useFullscreen(videoFullRef);
  const titleRoutes = ref<Route[]>(routesMonitor);
  const playerEmitter = mitt();
  createPlayerContext({ playerEmitter });
  const currentChannelActive = ref(-1);
  const currentAudioActive = ref(-1);
  const channelList = ref<any>([]);
  const url = ref();
  const currentVideoActive = ref(-1);
  const videoArr = ref<any>([{ id: null }, { id: null }, { id: null }, { id: null }]);
  const audioArr = ref<any>([]);
  const audioUrl = ref();
  const audioPlayerRef = ref();
  const aiVideoData = ref<any>([]);
  const aiAudioData = ref<any>([]);
  const aiRecognizeRef = ref();
  const showAiVideo = ref(false);
  const showAiAudio = ref(false);

  getVideoChannelList();
  async function getVideoChannelList() {
    const result = await deviceList({ operatorType: 'HDMI' });
    channelList.value = result;
    // const rtmpUrl = result[0].rtmpUrl;
    // url.value = rtmpUrl.replace(new URL(rtmpUrl).origin, origin);
  }

  getAudioChannelList();
  async function getAudioChannelList() {
    const result = await deviceList({ operatorType: 'AUDIO' });
    audioArr.value = result.map((item) => {
      return {
        ...item,
        volume: 50,
      };
    });
  }

  async function handleDateChange(_: any, dateString: string) {
    const start = dayjs(dateString).startOf('day').valueOf();
    const end = dayjs(dateString).endOf('day').valueOf();
    console.log(start, end);
  }

  function handleSelectVideo(item, index) {
    currentVideoActive.value = index;
    const curSelectedChannel = channelList.value[currentChannelActive.value];
    if (curSelectedChannel) {
      videoArr.value[currentVideoActive.value].id = curSelectedChannel.serialNumber;
      videoArr.value[currentVideoActive.value].name = curSelectedChannel.name;
    }
  }

  function handleMuted(item) {
    if (item.isMuted) {
      audioPlayerRef.value.instance.cancelMute();
    } else {
      audioPlayerRef.value.instance.mute();
    }
    item.isMuted = !item.isMuted;
  }

  const handleVolume = debounce((volume) => {
    const v = volume / 100;
    console.log(v);
    audioPlayerRef.value.instance.setVolume(v);
  }, 500);

  function handleSelectChannel(item, index) {
    if (currentChannelActive.value === -1 && currentVideoActive.value !== -1) {
    } else {
      currentVideoActive.value = currentVideoActive.value === 3 ? 0 : currentVideoActive.value + 1;
    }
    currentChannelActive.value = index;
    url.value = item.rtmpUrl.replace(new URL(item.rtmpUrl).origin, origin);
    videoArr.value[currentVideoActive.value].id = item.serialNumber;
    videoArr.value[currentVideoActive.value].name = item.name;
    showAiVideo.value = true;
  }

  function handleSelectAudio(item, index) {
    currentAudioActive.value = index;
    audioUrl.value = item.rtmpUrl.replace(new URL(item.rtmpUrl).origin, origin);
    showAiAudio.value = true;
  }

  // websocket
  const { close } = useWebSocket(
    `${location.protocol.includes('s') ? 'wss' : 'ws'}://${wsHostName}/api/ai/event`,
    {
      heartbeat: {
        message: 'ping',
        interval: 30000,
      },
      autoReconnect: {
        retries: 3,
        delay: 1000,
        onFailed() {
          // alert('Failed to connect WebSocket after 3 retries');
        },
      },
      onMessage: (_: WebSocket, event: MessageEvent) => {
        if (!aiRecognizeRef.value.aiSwitch) return;
        const message = JSON.parse(event.data);
        if (message.aiType == 0) {
          videoArr.value.map((item, index) => {
            if (item.id === message.channel) {
              aiVideoData.value[index] = {
                channel: message.channel,
                content: message.content,
                channelName: item.name,
              };
            }
          });
        } else {
          audioArr.value.map((item, index) => {
            if (item.serialNumber === message.channel) {
              aiAudioData.value[index] = message;
            }
          });
        }
      },
    },
  );

  onUnmounted(() => {
    playerEmitter.clear();
    close();
  });
</script>
<style lang="less" scoped>
  @import url('index.less');
</style>
