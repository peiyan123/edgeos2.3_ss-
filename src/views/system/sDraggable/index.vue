<template>
  <div
    class="absolute cursor-move"
    ref="dom"
    @mousedown.prevent="handleMouseDown"
    :style="{ left: currentLeft + 'px', top: currentTop + 'px' }"
  >
    <!-- <span class="absolute top-[-20px] left-0 text-red-700"
      >({{ currentLeft }},{{ currentTop }})</span
    > -->
    <slot></slot>
  </div>
</template>
<script lang="ts" setup>
  import { ref, getCurrentInstance, watchEffect } from 'vue';

  const props = defineProps({
    left: {
      type: Number,
      default: 0,
    },
    top: {
      type: Number,
      default: 0,
    },
  });
  const emits = defineEmits(['change']);
  const isMouseDown = ref(false);
  const instance = getCurrentInstance();
  const dom = ref();
  const currentTop = ref(props.top);
  const currentLeft = ref(props.left);
  watchEffect(() => {
    currentLeft.value = props.left;
    currentTop.value = props.top;
  });
  function handleMouseDown(e: any) {
    if (!e) return;
    isMouseDown.value = true;
    // 鼠标按下，计算当前元素距离可视区的距离
    const disX = e.clientX;
    const disY = e.clientY;
    const oldTop = currentTop.value;
    const oldLeft = currentLeft.value;
    const minLeft = 0;
    const maxLeft = instance?.parent?.proxy?.$el.offsetWidth - dom.value.offsetWidth;
    const minTop = 0;
    const maxTop = instance?.parent?.proxy?.$el.offsetHeight - dom.value.offsetHeight;
    document.onmousemove = function (e) {
      let left = e.clientX - disX;
      let top = e.clientY - disY;
      currentTop.value = getFixed(oldTop + top, 0);
      currentLeft.value = getFixed(oldLeft + left, 0);
      if (currentTop.value < minTop) {
        currentTop.value = minTop;
      }
      if (currentTop.value > maxTop) {
        currentTop.value = maxTop;
      }
      if (currentLeft.value > maxLeft) {
        currentLeft.value = maxLeft;
      }
      if (currentLeft.value < minLeft) {
        currentLeft.value = minLeft;
      }
    };
    handleClear();
  }

  function handleClear() {
    isMouseDown.value = false;
    document.onmouseup = () => {
      emits('change', { left: currentLeft.value, top: currentTop.value });
      document.onmousemove = null;
      document.onmouseup = null;
    };
  }

  function getFixed(val = 0, len = 2) {
    return Number(val.toFixed(len));
  }
</script>
<style lang="less" scoped></style>
