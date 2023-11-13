<template>
  <div class="w-full h-400px relative" ref="videoContainerRef">
    <Video class="absolute" :url="url" />
    <SDraggable
      :top="namePosition.top"
      :left="namePosition.left"
      v-if="showName"
      @change="handleTimeChange"
      ><div
        :style="{
          color: fontColor,
          borderColor: fontColor,
          fontSize: fontSize + 'px',
          opacity: opacity,
        }"
        class="min-w-100px border"
        >{{ name }}</div
      ></SDraggable
    >
    <SDraggable
      :top="datePosition.top"
      :left="datePosition.left"
      v-if="showDate"
      @change="handleDateChange"
      ><div
        :style="{
          color: fontColor,
          borderColor: fontColor,
          fontSize: fontSize + 'px',
          opacity: opacity,
        }"
        class="min-w-100px border"
        >{{ date }}</div
      ></SDraggable
    >
  </div>
</template>
<script lang="ts" setup>
  import { ref, watch } from 'vue';
  // components
  import SDraggable from '../../sDraggable/index.vue';
  import Video from '/@/views/algo/components/Video.vue';
  // utils
  import dayjs from 'dayjs';

  const props = defineProps({
    url: {
      type: String,
    },
    showName: {
      type: Boolean,
      default: true,
    },
    showDate: {
      type: Boolean,
      default: true,
    },
    namePosition: {
      type: Object as PropType<{ left: number; top: number }>,
      default: (a) => {
        return { left: 0, top: 0 };
      },
    },
    datePosition: {
      type: Object as PropType<{ left: number; top: number }>,
      default: () => {
        return { left: 0, top: 0 };
      },
    },
    dateFormat: {
      type: String,
    },
    timeFormat: {
      type: String,
    },
    osdAttribute: {
      type: String,
    },
    fontSize: {
      type: String,
      default: '14',
    },
    fontColor: {
      type: String,
      default: 'red',
    },
    name: {
      type: String,
      default: '名称',
    },
  });
  const emits = defineEmits(['changeNamePos', 'changeDatePos']);
  const curDate = dayjs(new Date());
  const date = ref(curDate.format('YYYY-MM-DD HH:mm:ss'));
  const videoContainerRef = ref();
  const opacity = ref(1);

  function handleTimeChange({ top, left }) {
    const offsetWidth = videoContainerRef.value.offsetWidth;
    const offsetHeight = videoContainerRef.value.offsetHeight;
    top = ((top / offsetHeight) * 100).toFixed(0);
    left = ((left / offsetWidth) * 100).toFixed(0);
    emits('changeNamePos', `${left},${top}`);
  }

  function handleDateChange({ top, left }) {
    const offsetWidth = videoContainerRef.value.offsetWidth;
    const offsetHeight = videoContainerRef.value.offsetHeight;
    top = ((top / offsetHeight) * 100).toFixed(0);
    left = ((left / offsetWidth) * 100).toFixed(0);
    emits('changeDatePos', `${left},${top}`);
  }

  watch(
    () => props.osdAttribute,
    (newVal: any) => {
      if (newVal == 0) {
        opacity.value = 0.5;
      } else {
        opacity.value = 1;
      }
    },
  );

  watch([() => props.dateFormat, () => props.timeFormat], ([newDate, newTime]) => {
    if (newDate == 'YYYY-MM-DD') {
      if (newTime == '24H') {
        date.value = curDate.format('YYYY-MM-DD HH:mm:ss');
      } else {
        date.value = curDate.format('YYYY-MM-DD HH:mm:ss A');
      }
    }
    if (newDate == 'MM-DD-YYYY') {
      if (newTime == '24H') {
        date.value = curDate.format('MM-DD-YYYY HH:mm:ss');
      } else {
        date.value = curDate.format('MM-DD-YYYY HH:mm:ss A');
      }
    }
    if (newDate == 'DD-MM-YYYY') {
      if (newTime == '24H') {
        date.value = curDate.format('DD-MM-YYYY HH:mm:ss');
      } else {
        date.value = curDate.format('DD-MM-YYYY HH:mm:ss A');
      }
    }
    if (newDate == 'CHR-YYYY-MM-DD') {
      if (newTime == '24H') {
        date.value = curDate.format('YYYY年MM月DD日 HH:mm:ss');
      } else {
        date.value = curDate.format('YYYY年MM月DD日 HH:mm:ss A');
      }
    }
    if (newDate == 'CHR-MM-DD-YYYY') {
      if (newTime == '24H') {
        date.value = curDate.format('MM月DD日YYYY年 HH:mm:ss');
      } else {
        date.value = curDate.format('MM月DD日YYYY年 HH:mm:ss A');
      }
    }
    if (newDate == 'CHR-DD-MM-YYYY') {
      if (newTime == '24H') {
        date.value = curDate.format('DD日MM月YYYY年 HH:mm:ss');
      } else {
        date.value = curDate.format('DD日MM月YYYY年 HH:mm:ss A');
      }
    }
  });
</script>
<style lang="less" scoped></style>
