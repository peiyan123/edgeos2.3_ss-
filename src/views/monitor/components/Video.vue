<template>
  <div class="relative h-full">
    <div ref="videoRef"></div>
    <div class="no-sign" v-show="isNoSign">无信号</div>
  </div>
</template>
<script lang="ts" setup>
  import { ref, unref, watch, onMounted, onUnmounted } from 'vue';
  import JessibucaType from '/#/jessibuca';

  const props = defineProps({
    url: {
      type: String,
      default: '',
    },
    activeKey: {
      type: Number,
      default: 0,
    },
    keySelf: {
      type: Number,
    },
    isPlayBack: {
      type: Boolean,
      default: false,
    },
    isNotMute: {
      type: Boolean,
      default: false,
    },
    hasVideo: {
      type: Boolean,
      default: true,
    },
    isPlaying: {
      type: Boolean,
      default: true,
    },
  });
  const videoRef = ref();
  const instance = ref<JessibucaType>();
  const isNoSign = ref(true);

  watch(
    [() => props.url, () => props.activeKey, () => props.isPlaying],
    ([newUrl, newActiveKey, newIsPlaying]) => {
      console.log(newUrl, newActiveKey, newIsPlaying);
      if (!newUrl) {
        if (unref(instance)) {
          unref(instance)?.close();
          isNoSign.value = true;
        }
      }
      if (!props.isPlayBack && newUrl && props.keySelf === newActiveKey) {
        reload(newUrl);
      }
      if (props.isPlayBack && newUrl) {
        // reload(newUrl);
        if (newIsPlaying) {
          if (unref(instance)) {
            unref(instance)?.play(newUrl);
            isNoSign.value = false;
          } else {
            reload(newUrl);
          }
        } else {
          if (unref(instance)) {
            unref(instance)?.pause();
          }
        }
      }
    },
  );
  async function reload(url) {
    if (unref(instance)) {
      await unref(instance)?.destroy();
      isNoSign.value = true;
    }
    instance.value = new JessibucaPro({
      container: videoRef.value,
      useMSE: false,
      useWCS: false,
      videoBuffer: 0.1,
      videoBufferDelay: 0.2,
      useSIMD: true,
      networkDelay: 1,
      isResize: false,
      text: '',
      loadingText: '加载中',
      debug: true,
      showBandwidth: false, // 显示网速
      decoder: '/resource/js/decoder-pro.js',
      operateBtns: {
        fullscreen: props.isPlayBack ? false : true,
        screenshot: false,
        play: props.isPlayBack ? false : true,
        audio: false,
        record: false,
      },
      forceNoOffscreen: false,
      isNotMute: props.isNotMute,
      hasVideo: props.hasVideo,
    });
    unref(instance)?.play(url);
    isNoSign.value = false;
    unref(instance)?.on('play', () => {
      console.log('play');
    });
  }

  onMounted(() => {
    if (props.url && props.keySelf === props.activeKey) {
      reload(props.url);
    }
  });

  onUnmounted(() => {
    if (unref(instance)) {
      unref(instance)?.destroy();
    }
  });
  defineExpose({
    reload,
    instance,
  });
</script>
<style lang="less" scoped>
  .no-sign {
    position: absolute;
    top: 50%;
    left: 50%;
    color: #fff;
  }
</style>
