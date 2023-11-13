<template>
  <PageWrapper :content-style="{ backgroundColor: '#fff', padding: '30px' }">
    <Breadcrumb :routes="titleRoutes" />
    <Divider />
    <Row>
      <Col :span="8">
        <div class="h-350px relative" ref="cpuRef">
          <span class="absolute text-size-15px font-bold bottom-5px left-80px">单位:%</span>
        </div>
      </Col>
      <Col :span="8">
        <div class="h-350px relative" ref="diskRef">
          <span class="absolute text-size-15px font-bold bottom-5px left-50px">单位:%</span>
        </div>
      </Col>
      <Col :span="8">
        <div class="h-350px relative" ref="memoRef">
          <span class="absolute text-size-15px font-bold bottom-5px left-50px">单位:%</span></div
        >
      </Col>
    </Row>
    <Row>
      <Col :span="8">
        <div class="h-350px relative" ref="ethernetRef"
          ><span class="absolute text-size-15px font-bold bottom-5px left-60px"
            >单位:KB/s</span
          ></div
        >
      </Col>
      <Col :span="8">
        <div class="h-350px relative" ref="fourGRef"
          ><span class="absolute text-size-15px font-bold bottom-5px left-50px"
            >单位:KB/s</span
          ></div
        >
      </Col>
      <Col :span="8">
        <div class="h-350px relative" ref="temperatureRef"
          ><span class="absolute text-size-15px font-bold bottom-5px left-80px">单位:℃</span></div
        >
      </Col>
    </Row>
  </PageWrapper>
</template>
<script lang="ts" setup>
  import { onMounted, onUnmounted, ref } from 'vue';
  // components
  import { PageWrapper } from '/@/components/Page';
  import { Row, Col, Breadcrumb, Divider } from 'ant-design-vue';
  import { cloneDeep, get } from 'lodash-es';
  import * as echarts from 'echarts/core';
  import { SVGRenderer } from 'echarts/renderers';
  import {
    TitleComponent,
    TooltipComponent,
    GridComponent,
    PolarComponent,
    AriaComponent,
    ParallelComponent,
    LegendComponent,
    RadarComponent,
    ToolboxComponent,
    DataZoomComponent,
    VisualMapComponent,
    TimelineComponent,
    CalendarComponent,
    GraphicComponent,
  } from 'echarts/components';
  import {
    BarChart,
    LineChart,
    PieChart,
    MapChart,
    PictorialBarChart,
    RadarChart,
    ScatterChart,
  } from 'echarts/charts';
  // hooks
  import { useEventListener } from '@vueuse/core';
  import dayjs from 'dayjs';

  import {
    cpuOptions,
    diskNames,
    diskOptions,
    ethOptions,
    fourGOptions,
    memoOptions,
    temperatureOptions,
  } from './config';
  import { getSystemInfo } from '/@/api/system';

  echarts.use([
    LegendComponent,
    TitleComponent,
    TooltipComponent,
    GridComponent,
    PolarComponent,
    AriaComponent,
    ParallelComponent,
    BarChart,
    LineChart,
    PieChart,
    MapChart,
    RadarChart,
    SVGRenderer,
    PictorialBarChart,
    RadarComponent,
    ToolboxComponent,
    DataZoomComponent,
    VisualMapComponent,
    TimelineComponent,
    CalendarComponent,
    GraphicComponent,
    ScatterChart,
  ]);

  const titleRoutes = [
    {
      path: '',
      breadcrumbName: '系统运维',
    },
  ];
  const interval = 120;
  const cpuRef = ref();
  const diskRef = ref();
  const memoRef = ref();
  const ethernetRef = ref();
  const fourGRef = ref();
  const temperatureRef = ref();
  const cpuOptionsClone = cloneDeep(cpuOptions);
  const diskOptionsClone = cloneDeep(diskOptions);
  const memoOptionsClone = cloneDeep(memoOptions);
  const ethOptionsClone = cloneDeep(ethOptions);
  const fourGOptionsClone = cloneDeep(fourGOptions);
  const temperatureOptionsClone = cloneDeep(temperatureOptions);
  const timer = ref();
  let cpuChart, diskChart, memoChart, ethChart, fourGChart, temperatureChart;

  useEventListener('resize', () => {
    cpuRef.value.resize();
    diskRef.value.resize();
    memoRef.value.resize();
    ethernetRef.value.resize();
    fourGRef.value.resize();
    temperatureRef.value.resize();
  });

  function setOption(data: any, option: any, nameArr?: Array<string>) {
    data?.forEach((v: string, index: number) => {
      // 确保每个系列都有
      if (!get(option.series, index)) {
        if (nameArr) {
          option.series.push({
            name: nameArr[index],
            data: [],
            type: 'line',
            smooth: true,
            showSymbol: false,
          });
        } else {
          option.series.push({
            data: [],
            type: 'line',
            smooth: true,
            showSymbol: false,
          });
        }
      }
      if (option.series[index].data.length >= interval) {
        option.series[index].data.shift();
        option.series[index].data.push(v);
      } else {
        option.series[index].data.push(v);
      }
    });
  }

  function setOptionXaxis(option: any) {
    if (option.xAxis.data.length >= interval) {
      option.xAxis.data.shift();
      option.xAxis.data.push(dayjs().format('HH:mm:ss'));
    } else {
      option.xAxis.data.push(dayjs().format('HH:mm:ss'));
    }
  }

  async function fetchData() {
    setOptionXaxis(cpuOptionsClone);
    setOptionXaxis(diskOptionsClone);
    setOptionXaxis(memoOptionsClone);
    setOptionXaxis(ethOptionsClone);
    setOptionXaxis(fourGOptionsClone);
    setOptionXaxis(temperatureOptionsClone);

    const result = await getSystemInfo();
    setOption(result?.cpu, cpuOptionsClone);
    cpuChart.setOption(cpuOptionsClone);

    setOption(result?.disk, diskOptionsClone, diskNames);
    diskChart.setOption(diskOptionsClone);

    setOption([result?.memory], memoOptionsClone);
    memoChart.setOption(memoOptionsClone);

    setOption([result?.ethernet?.up, result?.ethernet?.down], ethOptionsClone, ['发送', '接收']);
    ethChart.setOption(ethOptionsClone);

    setOption([result?.monet?.up, result?.monet?.down], fourGOptionsClone, ['发送', '接收']);
    fourGChart.setOption(fourGOptionsClone);

    setOption([result?.temperature], temperatureOptionsClone);
    temperatureChart.setOption(temperatureOptionsClone);
  }

  onMounted(() => {
    cpuChart = echarts.init(cpuRef.value);
    cpuChart.setOption(cpuOptionsClone);
    diskChart = echarts.init(diskRef.value);
    diskChart.setOption(diskOptionsClone);
    memoChart = echarts.init(memoRef.value);
    memoChart.setOption(memoOptionsClone);
    ethChart = echarts.init(ethernetRef.value);
    ethChart.setOption(ethOptionsClone);
    fourGChart = echarts.init(fourGRef.value);
    fourGChart.setOption(fourGOptionsClone);
    temperatureChart = echarts.init(temperatureRef.value);
    temperatureChart.setOption(temperatureOptionsClone);

    timer.value = setInterval(() => {
      fetchData();
    }, 1000);
    fetchData();
  });

  onUnmounted(() => {
    if (timer.value) clearInterval(timer.value);
  });
</script>
<style lang="less" scoped></style>
