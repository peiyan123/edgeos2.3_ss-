<template>
  <div>
    <div class="bg-gray-100 p-15px">
      <span>注意</span>
      <div class="mt-5px"
        >点击“开始搜索”可自动扫描出通过HDMI接口已连接的视频设备，选中对应设备并添加，即可完成视频通道的添加。</div
      >
    </div>
    <div class="my-10px flex justify-between">
      <div>
        <Button @click="handleCancel">取消</Button>
        <Button class="ml-10px" type="primary" @click="handleAdd">添加</Button>
      </div>
      <Button type="primary" @click="getData">开始搜索</Button>
    </div>
    <BasicTable @register="registerTable" />
  </div>
</template>
<script lang="ts" setup>
  import { ref } from 'vue';
  // components
  import { useTable, BasicTable } from '/@/components/Table';
  import { searchColumns } from '../config';
  import { Button } from 'ant-design-vue';
  // hooks
  import { useMessage } from '/@/hooks/web/useMessage';
  // services
  import { getDeviceSearch, addDevice } from '/@/api/device';

  const props = defineProps({
    type: {
      type: String,
      default: 'HDMI',
    },
    channels: {
      type: Array,
      default: () => [],
    },
  });
  const emits = defineEmits(['cancel']);
  const { createMessage } = useMessage();
  const selectKeys = ref<string[]>([]);
  const tableData = ref([]);
  const [registerTable] = useTable({
    // api: undefined,
    dataSource: tableData,
    columns: searchColumns,
    canResize: false,
    rowKey: 'serialNumber',
    showIndexColumn: false,
    rowSelection: {
      onChange: (keys: any) => {
        console.log(keys);
        selectKeys.value = keys;
      },
    },
  });

  function handleCancel() {
    emits('cancel');
  }
  // getData();
  async function getData() {
    const result = await getDeviceSearch({ type: props.type });
    tableData.value = result.filter((a) => {
      return !props.channels.includes(a.id);
    });
  }

  async function handleAdd() {
    if (!selectKeys.value.length) return createMessage.info('请勾选通道');
    const result = tableData.value.filter((item: any) =>
      selectKeys.value.includes(item.serialNumber),
    );
    await addDevice(result);
    createMessage.success('添加成功');
    handleCancel();
  }
</script>
<style lang="less" scoped></style>
