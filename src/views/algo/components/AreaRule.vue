<template>
  <div class="relative h-500px">
    <Video class="absolute" :url="url" />
    <div class="h-full w-full absolute z-20 top-0" ref="detectionRef"></div>
  </div>
</template>
<script lang="ts" setup>
  import { onMounted, ref, watch } from 'vue';
  // components
  import Video from './Video.vue';
  // utils
  import { DetectionScene } from '../../../thundersoft/ai-mark';
  // import png from '/@/assets/images/holo-road.jpg';
  import png from '/@/assets/images/png.png';
  // hooks
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useTrain } from '../useTrain';
  import { useTrainContext } from '../useContext';

  const props = defineProps({
    algoConfig: {
      type: Object,
    },
    url: {
      type: String,
    },
  });
  let detectionScene;
  const detectionRef = ref();
  const { createMessage } = useMessage();
  const { colorRgb } = useTrain();
  const { drawEmitter } = useTrainContext();
  const points = ref();
  const shapeStore = ref<any>([]);
  const currentTagId = ref(); // 记录当前选中的tag
  const color = colorRgb('#40a9ff');

  function initDetection(base64url: string) {
    detectionScene = new DetectionScene(detectionRef.value, base64url, []);
    initMark();
    if (props.algoConfig?.ocr) {
      // renderPolyon(props.algoConfig.rois);
      shapeStore.value = props.algoConfig?.ocr.map((item, index) => {
        return { ...item, id: index };
      });
      setRectData(shapeStore.value);
    }
  }

  watch(
    () => props.algoConfig,
    (newVal) => {
      if (!newVal) return;
      clearAllGraph();
      closeALlGraph();
      if (newVal.ocr) {
        // renderPolyon(newVal.rois);
        shapeStore.value = newVal.ocr.filter((item) => {
          return item.x_left;
        });
        setRectData(shapeStore.value);
      }
    },
  );

  // 清除所有图形
  function clearAllGraph() {
    if (!detectionScene) return;
    detectionScene.setPolygonData([]);
  }

  function closeALlGraph() {
    if (!detectionScene) return;
    detectionScene.closePolygonMarkMode();
  }

  function initMark() {
    detectionScene.markCanvas.notifyMessage.subscribe(() => {
      createMessage.info('最多绘制4个检测区域');
    });
    detectionScene.markCanvas.notifyCheckPoint.subscribe(({ point, shape, option }) => {
      handleCheckPoint({ point, shape, option });
    });
    detectionScene.markCanvas.shapeSegmentationDrawEndEvent.subscribe((option, shape) => {
      handlecheckPolygon(option, shape);
    });
    detectionScene.markCanvas.shapeSegmentationDrawSuccessEvent.subscribe(() => {
      createMessage.success('多边形绘制成功');
    });
    detectionScene.markCanvas.shapeDetectionCreateSuccess.subscribe((shape) => {
      const bool = shapeStore.value.some((a) => {
        return a.id === currentTagId.value;
      });
      const offsetHeight = detectionRef.value.offsetHeight;
      const offsetWidth = detectionRef.value.offsetWidth;
      if (bool) {
        setRectData(shapeStore.value);
      } else {
        const a = {
          id: currentTagId.value,
          label: shape.label,
          x_left: ((shape.minX / offsetWidth) * 100).toFixed(0),
          y_left: ((shape.minY / offsetHeight) * 100).toFixed(0),
          x_right: ((shape.maxX / offsetWidth) * 100).toFixed(0),
          y_right: ((shape.maxY / offsetHeight) * 100).toFixed(0),
        };
        shapeStore.value.push(a);
      }
    });
    detectionScene.deleteShapeEvent.subscribe((shape) => {
      shapeStore.value = shapeStore.value.filter((item) => {
        return item.id !== shape.tagId;
      });
    });
  }

  // 回显矩形
  function setRectData(data) {
    const offsetHeight = detectionRef.value.offsetHeight;
    const offsetWidth = detectionRef.value.offsetWidth;
    const result = data.map((item) => {
      return {
        label: item.label === 'Xi_Tong_Shi_Jian_Shi_Bie_Kuang' ? '系统时间识别框' : item.label,
        color,
        tagId: item.id,
        pointSource: [
          { x: (item.x_left * offsetWidth) / 100, y: (item.y_left * offsetHeight) / 100 },
          { x: (item.x_right * offsetWidth) / 100, y: (item.y_left * offsetHeight) / 100 },
          { x: (item.x_right * offsetWidth) / 100, y: (item.y_right * offsetHeight) / 100 },
          { x: (item.x_left * offsetWidth) / 100, y: (item.y_right * offsetHeight) / 100 },
        ],
      };
    });
    detectionScene.setDataElse(result);
  }

  // TODO 重组检查点请求数据结构
  function handleReqData(points) {
    const offsetHeight = detectionRef.value.offsetHeight;
    const offsetWidth = detectionRef.value.offsetWidth;
    return points.map((item) => {
      return {
        roiX: Number(((item.source.x / offsetWidth) * 100).toFixed(0)),
        roiY: Number(((item.source.y / offsetHeight) * 100).toFixed(0)),
      };
    });
  }
  // 闭合时检测
  async function handlecheckPolygon(option, shape) {
    const checkPoints = handleReqData(points.value);
    try {
      // await checkPolygon({ points: checkPoints, deviceKey: props.deviceId });
    } catch (error) {
      detectionScene.setPolygonData([]);
      createMessage.error('交叉线段无法闭合区域');
    }
  }
  // 检查点api请求
  async function handleCheckPoint({ point, shape, option }) {
    const reqData = [...shape.point, point] as any;
    if (handleReqData(reqData).length > 3) {
      // await checkPoint({ points: handleReqData(reqData), deviceKey: props.deviceId });
      detectionScene.markCanvas.pointSelected = null;
      detectionScene.markCanvas.currentShapeSegmentation.point.push(point);
      points.value = detectionScene.markCanvas.currentShapeSegmentation.point;
      detectionScene.markCanvas.shapeSegmentationDrawAddEvent.next({
        point: point,
        shape: detectionScene.markCanvas.currentShapeSegmentation,
      });
      if (reqData.length === 10) {
        detectionScene.markCanvas.pointSource = null;
        detectionScene.markCanvas.shapeSegmentationDrawSuccessEvent.next({
          option,
          shape: detectionScene.markCanvas.currentShapeSegmentation,
        });
        createMessage.success('多边形绘制成功');
      }
    } else {
      detectionScene.markCanvas.currentShapeSegmentation.point.push(point);
      points.value = detectionScene.markCanvas.currentShapeSegmentation.point;
      detectionScene.markCanvas.shapeSegmentationDrawAddEvent.next({
        point: point,
        shape: detectionScene.markCanvas.currentShapeSegmentation,
      });
    }
  }

  function renderPolyon(data) {
    if (!detectionScene) return;
    const offsetHeight = detectionRef.value.offsetHeight;
    const offsetWidth = detectionRef.value.offsetWidth;
    const result =
      data &&
      data.map((item) => {
        const pointSource = item.points.map((a) => {
          return {
            x: (a.roiX / 100) * offsetWidth,
            y: (a.roiY / 100) * offsetHeight,
          };
        });
        return {
          pointSource,
        };
      });
    setPolygonData(result);
  }

  // 多边形绘制数据
  function setPolygonData(datas) {
    detectionScene.setPolygonData(
      datas &&
        datas.map((data) => {
          let color = '#40a9ff'; // 绘制区域
          return {
            ...data,
            color: colorRgb(color),
            label: '',
          };
        }),
    );
  }

  function savePolygonData() {
    if (!detectionScene) return;
    const allPolygons = detectionScene.getPolygonData();
    const offsetHeight = detectionRef.value.offsetHeight;
    const offsetWidth = detectionRef.value.offsetWidth;
    const polygonData = allPolygons.map((a) => {
      const points = a.point.map((b) => {
        return {
          roiX: Number(((b.x / offsetWidth) * 100).toFixed(0)),
          roiY: Number(((b.y / offsetHeight) * 100).toFixed(0)),
        };
      });
      return { points };
    });
    console.log(allPolygons);
    console.log(polygonData);
    return polygonData;
  }

  onMounted(() => {
    initDetection(png);
    drawEmitter.on('polygon', ({ action }) => {
      switch (action) {
        case 'draw':
          createMessage.info(
            '单击左键设置多边形顶点，双击左键完成多边形的闭合。多边形最多支持10条边',
          );
          detectionScene.openPolygonMode({
            color: colorRgb('#40a9ff'),
            type: 'polygon',
          });
          break;
        case 'clear':
          detectionScene.setPolygonData([]);
          detectionScene.closePolygonMarkMode();
          props.algoConfig!.rois = null;
          break;
        case 'save':
          detectionScene.closePolygonMarkMode();
          props.algoConfig!.rois = savePolygonData();
      }
    });
    drawEmitter.on('rect', ({ action, label, id }) => {
      switch (action) {
        case 'draw':
          detectionScene.openMarkMode({
            color: colorRgb('#40a9ff'),
            label,
            tagId: id,
          });
          currentTagId.value = id;
          break;
        case 'clear':
          detectionScene.setDataElse([]);
          detectionScene.closeMarkMode();
          shapeStore.value = [];
          props.algoConfig.ocr = shapeStore.value;
          break;
        case 'clear-item':
          shapeStore.value = shapeStore.value.filter((a) => {
            return a.id != id;
          });
          setRectData(shapeStore.value);
          detectionScene.closeMarkMode();
          break;
        case 'edit':
          shapeStore.value.map((a) => {
            if (a.id == id) {
              a.label = label;
            }
          });
          setRectData(shapeStore.value);
          break;
        case 'save':
          detectionScene.closeMarkMode();
          props.algoConfig.ocr = shapeStore.value;
          break;
      }
    });
  });
</script>
<style lang="less" scoped></style>
