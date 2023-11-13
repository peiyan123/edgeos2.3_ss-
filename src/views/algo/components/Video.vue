<template>
  <div class="relative h-full">
    <div ref="videoRef"></div>
    <div class="no-sign" v-show="isNoSign">无信号</div>
  </div>
</template>
<script lang="ts" setup>
  import { ref, unref, watch, onMounted, onUnmounted } from 'vue';
  import { useTimeoutFn } from '/@/hooks/core/useTimeout';

  const props = defineProps({
    url: {
      type: String,
      default: '',
    },
    isNotMute: {
      type: Boolean,
      default: false,
    },
    hasVideo: {
      type: Boolean,
      default: true,
    },
  });
  const videoRef = ref();
  const instance = ref();
  const isNoSign = ref(true);
  watch(
    () => props.url,
    (newUrl) => {
      if (newUrl) {
        initLoad(newUrl);
      }
    },
  );
  function initLoad(url) {
    console.log(unref(instance));
    if (unref(instance)) {
      unref(instance).destroy();
      isNoSign.value = true;
    }
    useTimeoutFn(() => {
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
          fullscreen: false,
          screenshot: false,
          play: false,
          audio: false,
        },
        forceNoOffscreen: false,
        isNotMute: props.isNotMute,
        hasVideo: props.hasVideo,
      });
      unref(instance).play(url);
      isNoSign.value = false;
    }, 800);
  }

  onMounted(() => {
    if (props.url) {
      initLoad(props.url);
    }
  });

  onUnmounted(() => {
    if (unref(instance)) {
      unref(instance).destroy();
    }
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
