<template>
  <div>
    <div class="mb-20px">
      <Row align="middle" :gutter="20" class="my-20px">
        <Col class="w-100px">通道号:</Col>
        <Col
          ><Select
            class="w-200px"
            v-model:value="channelId"
            placeholder="请选择视频通道号"
            :options="channelList"
            @change="handleChangeChannel"
        /></Col>
      </Row>
      <Row align="middle" :gutter="20" class="mb-20px">
        <Col class="w-100px">通道名称:</Col>
        <Col
          ><Input
            :disabled="true"
            v-model:value="channelName"
            class="w-200px"
            placeholder="展示视频通道名称"
        /></Col>
      </Row>
      <Row align="middle" :gutter="20">
        <Col>算法开启:</Col>
        <Col
          ><Switch v-model:checked="isAlgoOpen" checked-children="开" un-checked-children="关"
        /></Col>
      </Row>
    </div>
    <div class="bg-gray-100 p-20px">
      <div class="flex items-center mb-10px">
        <!-- <Button v-if="!isDrawing" class="mr-15px" ghost type="primary" @click="handleDrawRect"
          >分析区域绘制</Button
        > -->
        <Button class="mr-15px" type="primary" v-if="isDrawing" @click="clearDraw">清除</Button>
        <Button class="mr-15px" type="primary" v-if="isDrawing" @click="saveDraw">保存</Button>
        <span>支持矩形区域绘制</span>
      </div>
      <div class="flex">
        <div style="width: 50%" class="mr-50px bg-dark-500">
          <AreaRule :url="url" :algo-config="algoDetails" />
        </div>
        <div style="width: 20%">
          <div class="font-bold mb-10px">标签操作</div>
          <div class="flex">
            <Tooltip title="添加标签">
              <Button
                :disabled="tagList.length === 10"
                class="mr-10px"
                type="primary"
                shape="circle"
                @click="handleAddTag"
                ><template #icon><PlusOutlined /></template
              ></Button>
            </Tooltip>
            <Tooltip title="删除标签">
              <Button class="mr-10px" type="primary" shape="circle" @click="handleDelTag"
                ><template #icon><MinusOutlined /></template
              ></Button>
            </Tooltip>
            <Tooltip title="编辑标签">
              <Button class="mr-10px" type="primary" shape="circle" @click="handleEditTag"
                ><template #icon><FormOutlined /></template
              ></Button>
            </Tooltip>
          </div>
          <div class="mt-20px">
            <p v-for="(item, index) in tagList" :key="index"
              ><Button
                class="w-130px"
                :type="currentSelectTag == item.id ? 'primary' : 'default'"
                @click="handleSelectTag(item)"
                ><div class="overflow-ellipsis truncate" :title="item.name">
                  {{
                    item.name === 'Xi_Tong_Shi_Jian_Shi_Bie_Kuang' ? '系统时间识别框' : item.name
                  }}</div
                ></Button
              ></p
            >
          </div>
        </div>
        <div style="width: 30%">
          <AlgoConfig :type="type" :algo-config="splDetails" />
        </div>
      </div>
      <Button :disabled="saveBtnDisabled" class="mt-20px" type="primary" @click="handleSave"
        >保存并应用</Button
      >
    </div>
    <AddTagModal @register="registerModal" @success="handleTagSuccess" />
  </div>
</template>
<script lang="ts" setup>
  import { onMounted, ref } from 'vue';
  // components
  import { Row, Col, Select, Switch, Button, Input, Tooltip } from 'ant-design-vue';
  import { FormOutlined, PlusOutlined, MinusOutlined } from '@ant-design/icons-vue';
  import AlgoConfig from './AlgoConfig.vue';
  import AreaRule from './AreaRule.vue';
  import { useTrainContext } from '../useContext';
  import AddTagModal from './AddTagModal.vue';
  import { useModal } from '/@/components/Modal';
  // service
  import { deviceList } from '/@/api/device';
  import { getAlgoDetails, saveAlgoDetails } from '/@/api/algo';
  // hooks
  import { useMessage } from '/@/hooks/web/useMessage';
  // utils
  import { origin } from '/@/constant';
  import { buildShortUUID } from '/@/utils/uuid';
  import { useRoute } from 'vue-router';

  const props = defineProps({
    algType: {
      type: String,
      default: '',
    },
    type: { type: String },
  });

  const channelList = ref<any>([]);
  const originalChannelList = ref<any>([]);
  const channelName = ref();
  const channelId = ref();
  const isAlgoOpen = ref(false);
  const isDrawing = ref();
  const { drawEmitter } = useTrainContext();
  const url = ref('');
  const algoDetails = ref();
  const splDetails = ref();
  const { createMessage } = useMessage();
  const [registerModal, { openModal }] = useModal();
  const tagList = ref<any>([]);
  const currentSelectTag = ref('');
  const isEdit = ref(false);
  const saveBtnDisabled = ref(false);

  const route = useRoute();
  console.log(route.query);

  async function getData() {
    const result = await deviceList({ operatorType: props.type });
    originalChannelList.value = result;
    channelList.value = result.map((item) => {
      return {
        value: item.id,
        label: item.id,
      };
    });
  }
  function handleChangeChannel(e) {
    const result = originalChannelList.value.find((item) => {
      return item.id === e;
    });
    if (result) {
      channelName.value = result.name;
      url.value = result.rtmpUrl.replace(new URL(result.rtmpUrl).origin, origin);
    }
    handleAlgoDetails();
  }
  function handleDrawPolygon() {
    isDrawing.value = 'polygon';
    drawEmitter.emit(isDrawing.value, { action: 'draw' });
  }
  function handleDrawRect() {
    isDrawing.value = 'rect';
    drawEmitter.emit(isDrawing.value, { action: 'draw' });
  }
  function clearDraw() {
    drawEmitter.emit(isDrawing.value, { action: 'clear' });
    isDrawing.value = '';
    currentSelectTag.value = '';
  }
  function saveDraw() {
    drawEmitter.emit(isDrawing.value, { action: 'save' });
    isDrawing.value = '';
  }

  // 获取算法详情
  async function handleAlgoDetails() {
    const result = await getAlgoDetails({ id: channelId.value, algType: props.algType });
    result.algParam.ocr.map((item) => {
      item.id = buildShortUUID();
    });
    algoDetails.value = result.algParam;
    splDetails.value = result.splParam;
    isAlgoOpen.value = !!algoDetails.value.startStatus;

    tagList.value = result?.algParam.ocr.map((item) => {
      return {
        name: item.label === '系统时间识别框' ? 'Xi_Tong_Shi_Jian_Shi_Bie_Kuang' : item.label,
        id: item.id,
      };
    });
  }

  async function handleSave() {
    if (!channelId.value) {
      return createMessage.info('请先选择通道');
    }
    if (!splDetails.value.voOutputFps) {
      return createMessage.info('请填写输出间隔');
    }
    const ocr = tagList.value.map((item) => {
      const a = algoDetails.value.ocr.find((b) => {
        return b.id == item.id;
      });
      if (a) {
        if (a.label === '系统时间识别框') {
          a.label = 'Xi_Tong_Shi_Jian_Shi_Bie_Kuang';
        }
        return a;
      } else {
        return {
          label: item.name === '系统时间识别框' ? 'Xi_Tong_Shi_Jian_Shi_Bie_Kuang' : item.name,
          id: item.id,
          x_left: null,
          y_left: null,
          x_right: null,
          y_right: null,
        };
      }
    });
    try {
      // if (
      //   ocr
      //     .map((v) => {
      //       return v.label;
      //     })
      //     .find((p) => {
      //       return p === 'Xi_Tong_Shi_Jian_Shi_Bie_Kuang';
      //     })
      // ) {
      //   // 标签里面有系统时间识别 删除别的通道的时间识别标签   后端处理了
      //   findChannel()
      // }
      saveBtnDisabled.value = true;
      await saveAlgoDetails({
        id: channelId.value,
        algParam: { ...algoDetails.value, ocr, startStatus: isAlgoOpen.value ? 1 : 0 },
        splParam: splDetails.value,
      });
      createMessage.success('保存成功');
    } finally {
      saveBtnDisabled.value = false;
    }
  }
  function handleAddTag() {
    if (!channelId.value) {
      return createMessage.info('请先选择通道');
    }
    isEdit.value = false;
    openModal(true, {});
  }

  function handleEditTag() {
    if (currentSelectTag.value) {
      isEdit.value = true;
      const name = tagList.value.find((a) => {
        return a.id == currentSelectTag.value;
      }).name;
      openModal(true, { name });
    } else {
      createMessage.info('请先选择标签');
    }
  }

  function handleDelTag() {
    if (currentSelectTag.value) {
      tagList.value = tagList.value.filter((a) => {
        return a.id != currentSelectTag.value;
      });
      drawEmitter.emit(isDrawing.value, { action: 'clear-item', id: currentSelectTag.value });
      currentSelectTag.value = '';
    } else {
      createMessage.info('请先选择标签');
    }
  }

  function handleTagSuccess(name) {
    if (tagList.value.find((v) => v.name === name)) {
      createMessage.error('标签已存在');
      return;
    }
    if (isEdit.value) {
      tagList.value.map((a) => {
        if (a.id == currentSelectTag.value) {
          a.name = name;
        }
      });
      drawEmitter.emit(isDrawing.value, {
        action: 'edit',
        label: name,
        id: currentSelectTag.value,
      });
      drawEmitter.emit(isDrawing.value, {
        action: 'draw',
        label: name,
        id: currentSelectTag.value,
      });
    } else {
      tagList.value.push({ name, id: buildShortUUID() });
    }
  }

  function handleSelectTag(item) {
    currentSelectTag.value = item.id;
    isDrawing.value = 'rect';
    drawEmitter.emit(isDrawing.value, {
      action: 'draw',
      label: item.name === 'Xi_Tong_Shi_Jian_Shi_Bie_Kuang' ? '系统时间识别框' : item.name,
      id: item.id,
    });
  }

  onMounted(async () => {
    await getData();
    if (route.query.id && route.query.type === 'ocr') {
      channelId.value = route.query.id;
      handleChangeChannel(route.query.id);
    }
  });
</script>

<style lang="less" scoped></style>
