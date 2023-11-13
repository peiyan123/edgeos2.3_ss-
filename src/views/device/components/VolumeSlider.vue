<template>
  <div class="flex items-center">
    <span class="mr-5px">音量</span>
    <Icon
      class="mr-5px cursor-pointer"
      v-if="!isMuted"
      :icon="'iconoir:sound-low'"
      @click="handleMuted"
    />
    <Icon
      class="mr-5px cursor-pointer"
      v-if="isMuted"
      :icon="'teenyicons:sound-off-outline'"
      @click="handleMuted"
    />
    <Slider class="ss-silder" v-model:value="v" @after-change="handleVolume" />
  </div>
</template>
<script lang="ts" setup>
  import { ref } from 'vue';
  // component
  import { Slider } from 'ant-design-vue';
  import Icon from '/@/components/Icon';

  const props = defineProps({
    volume: {
      type: Number,
      default: 0,
    },
  });
  const emits = defineEmits(['change', 'changeMuted']);

  const isMuted = ref(false);

  const v = ref(props.volume);

  function handleVolume(volume) {
    const v = volume / 100;
    emits('change', v);
  }

  function handleMuted() {
    isMuted.value = !isMuted.value;
    emits('changeMuted', isMuted.value);
  }
</script>
<style lang="less" scoped>
  ::v-deep(.ss-silder) {
    width: 60%;

    .ant-slider-rail {
      background-color: #e1e1e1;
    }
  }
</style>
