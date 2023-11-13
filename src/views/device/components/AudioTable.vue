<template>
  <div>
    <span v-if="!isTask">音频通道</span>
    <div v-if="!isTask" class="flex justify-between mt-10px">
      <Input
        class="w-300px"
        v-model:value="searchVal"
        placeholder="请输入通道号或通道名称"
        @change="handleSearch"
      >
        <template #suffix>
          <SearchOutlined />
        </template>
      </Input>
      <div>
        <span class="mr-10px">已加/上限设备：{{ allTotal }}/2</span>
        <PopConfirmButton title="是否确认删除？" type="primary" @confirm="handleBatchDel"
          >删除通道</PopConfirmButton
        >
        <Button :disabled="allTotal === 2" class="ml-5px" type="primary" @click="handleAdd"
          >添加通道</Button
        >
      </div>
    </div>
    <BasicTable @register="registerTable">
      <template #bodyCell="{ record, column }">
        <template v-if="column.key === 'action'">
          <TableAction
            :actions="[
              {
                label: '试听',
                ifShow: !isTask,
                onClick: handleListen.bind(null, record),
              },
              {
                label: record.functionStatus == 1 ? '关闭录制' : '开启录制',
                ifShow: !isTask,
                onClick: handleRecode.bind(null, record),
              },
              {
                label: '算法配置',
                ifShow: !isTask,
                disabled: record.ipAddress != 'rockchipes83881',
                onClick: handleAlgoConfig.bind(null, record),
              },
              {
                label: '音频配置',
                ifShow: !isTask,
                onClick: handleVideoConfig.bind(null, record),
              },
              {
                label: '编辑',
                onClick: handleEdit.bind(null, record),
                ifShow: isTask,
              },
              {
                label: '创建任务',
                ifShow: isTask,
                onClick: handleCreate.bind(null, record),
              },
              {
                label: '删除',
                ifShow: !isTask,
                popConfirm: {
                  title: '是否确认删除?',
                  confirm: handleDel.bind(null, record),
                },
              },
            ]"
          />
        </template>
      </template>
    </BasicTable>
    <Preview @register="registerModal" type="audio" :hasVideo="false" :isNotMute="true" />
    <ChannelEdit @register="registerEditModal" @success="getData" />
    <TaskEdit @register="registerTaskEditModal" @success="getData" />
  </div>
</template>
<script lang="ts" setup>
  import { ref } from 'vue';
  // components
  import { columns, columnsTask } from '../config';
  import { Input, Button } from 'ant-design-vue';
  import { BasicTable, useTable, TableAction } from '/@/components/Table';
  import PopConfirmButton from '/@/components/Button/src/PopConfirmButton.vue';
  import { SearchOutlined } from '@ant-design/icons-vue';
  import { useRouter } from 'vue-router';
  import { debounce } from 'lodash-es';
  import { useModal } from '/@/components/Modal';
  import ChannelEdit from './ChannelEdit.vue';
  import TaskEdit from './TaskEdit.vue';
  import Preview from './Preview.vue';
  // service
  import { delDevice, deviceList, startRecord, stopRecord, taskList } from '/@/api/device';
  // hooks
  import { useMessage } from '/@/hooks/web/useMessage';
  // utils
  import { origin } from '/@/constant';

  const emits = defineEmits(['pageChange']);
  const props = defineProps({
    type: {
      type: String,
    },
    isTask: {
      type: Boolean,
    },
  });

  const [registerModal, { openModal }] = useModal();
  const [registerEditModal, { openModal: openEditModal }] = useModal();
  const [registerTaskEditModal, { openModal: openTaskModal }] = useModal();
  const router = useRouter();
  const selectKeys = ref<string[]>([]);
  const { createMessage } = useMessage();
  const tableData = ref([]);
  const searchVal = ref('');
  const allTotal = ref<Number>(0);
  const [registerTable, { updateTableDataRecord }] = useTable(
    props.isTask
      ? {
          // api: undefined,
          dataSource: tableData,
          showIndexColumn: false,
          columns: columnsTask,
          clearSelectOnPageChange: true,
          canResize: false,
          rowKey: 'id',
          actionColumn: {
            width: 420,
            title: '操作',
            dataIndex: 'action',
            fixed: undefined,
          },
        }
      : {
          // api: undefined,
          dataSource: tableData,
          showIndexColumn: false,
          columns: columns,
          clearSelectOnPageChange: true,
          canResize: false,
          rowKey: 'id',
          rowSelection: {
            onChange: (keys: any) => {
              console.log(keys);
              selectKeys.value = keys;
            },
          },
          actionColumn: {
            width: 420,
            title: '操作',
            dataIndex: 'action',
            fixed: undefined,
          },
        },
  );

  function handleListen(item) {
    const url = item.rtmpUrl.replace(new URL(item.rtmpUrl).origin, origin);
    openModal(true, {
      url: url,
    });
  }
  async function handleRecode(item) {
    const arr = new URL(item.rtspUrl2).pathname.split('/');
    const a = arr.length - 1;
    const b = arr.length - 2;
    const key = '__defaultVhost__/' + arr[b] + '/' + arr[a];
    if (item.functionStatus == 1) {
      await stopRecord({
        key,
        recordDir: '/userdata/record/',
        recordType: 1,
        maxSecond: 30 * 60,
      });
      // updateTableDataRecord(item.id, { ...item, functionStatus: 0 });
    } else {
      await startRecord({
        key,
        recordDir: '/userdata/record/',
        recordType: 0,
        maxSecond: 30 * 60,
      });
      // updateTableDataRecord(item.id, { ...item, functionStatus: 1 });
    }
    getData();
  }
  function handleAlgoConfig(item) {
    router.push({ name: 'Algo', query: { type: 'AUDIO', id: item.id } });
  }

  function handleVideoConfig() {
    router.push({ name: 'SettingPage', query: { key: 'video', pType: 'audio' } });
  }
  function handleEdit(item) {
    item.isTask = props.isTask;
    item.isEdit = true;
    if (item.isTask) {
      openTaskModal(true, item);
    } else {
      openEditModal(true, item);
    }
  }
  function handleCreate(item) {
    item.isTask = props.isTask;
    item.isEdit = false;
    openTaskModal(true, item);
  }
  async function handleDel(item) {
    await delDevice({ codes: item.id });
    getData();
  }
  async function handleBatchDel() {
    if (!selectKeys.value.length) {
      return createMessage.info('请勾选通道');
    }
    await delDevice({ codes: selectKeys.value.join(',') });
    getData();
    return true;
  }
  function handleAdd() {
    emits('pageChange', {
      page: 'add',
      type: 'audio',
      channels: tableData.value.map((a: any) => a.id),
    });
  }
  const handleSearch = debounce((e) => {
    getData();
  }, 500);

  getData();
  async function getData() {
    if (props.isTask) {
      const result = await taskList({ operatorType: props.type, keyWord: searchVal.value });
      tableData.value = result;
      if (!searchVal.value.trim()) {
        allTotal.value = result.length;
      }
    } else {
      const result = await deviceList({ operatorType: props.type, keyWord: searchVal.value });
      tableData.value = result;
      if (!searchVal.value.trim()) {
        allTotal.value = result.length;
      }
    }
  }
</script>
<style lang="less" scoped></style>
