<template>
  <PageWrapper :content-style="{ backgroundColor: '#fff', padding: '30px' }">
    <Breadcrumb :routes="titleRoutes" />
    <Divider />
    <BasicTable @register="registerTable">
      <template #form-channel="{ model, field }">
        <Select
          mode="multiple"
          allow-clear
          v-model:value="model[field]"
          placeholder="请选择通道号进行搜索"
          :options="channelList"
      /></template>
      <template #form-channelName="{ model, field }">
        <Select
          mode="multiple"
          allow-clear
          v-model:value="model[field]"
          placeholder="请选择通道名称进行搜索"
          :options="channelNameList"
      /></template>
      <template #form-resetBefore>
        <!-- <Button class="mr-10px" type="primary" @click="handleBatchDownload">下载</Button> -->
        <Dropdown>
          <a class="ant-dropdown-link mr-10px">
            下载
            <DownOutlined />
          </a>
          <template #overlay>
            <Menu>
              <Menu.Item>
                <span @click="handleBatchDownload('mp4')">MP4</span>
              </Menu.Item>
              <Menu.Item>
                <span @click="handleBatchDownload('ts')">TS</span>
              </Menu.Item>
            </Menu>
          </template>
        </Dropdown>
      </template>
      <template #bodyCell="{ record, column }">
        <template v-if="column.key === 'action'">
          <div class="flex">
            <Dropdown>
              <a class="ant-dropdown-link">
                下载
                <DownOutlined />
              </a>
              <template #overlay>
                <Menu>
                  <Menu.Item>
                    <span @click="handleDownload(record, 'mp4')">MP4</span>
                  </Menu.Item>
                  <Menu.Item>
                    <span @click="handleDownload(record, 'ts')">TS</span>
                  </Menu.Item>
                </Menu>
              </template>
            </Dropdown>
            <Divider type="vertical" class="action-divider" />
            <TableAction
              :actions="[
                {
                  label: '预览',
                  onClick: handlePreview.bind(null, record),
                },
                // {
                //   label: '下载',
                //   onClick: handleDownload.bind(null, record),
                // },
                {
                  label: '删除',
                  popConfirm: {
                    title: '是否确认删除?',
                    confirm: handleDel.bind(null, record),
                  },
                },
              ]"
            />
          </div>
        </template>
      </template>
    </BasicTable>
    <Preview @register="registerModal" />
  </PageWrapper>
</template>
<script lang="ts" setup>
  import { ref } from 'vue';
  // components
  import { PageWrapper } from '/@/components/Page';
  import { Breadcrumb, Divider, Button, Select, Dropdown, Menu } from 'ant-design-vue';
  import { DownOutlined } from '@ant-design/icons-vue';
  import { BasicTable, useTable, TableAction } from '/@/components/Table';
  import Preview from './components/Preview.vue';
  import { useModal } from '/@/components/Modal';
  // model
  import { Route } from 'ant-design-vue/lib/breadcrumb/Breadcrumb';
  import { columns, searchFormSchema, tableData } from './config';
  // service
  import { getVideoSearch, delVideo, downloadVideo } from '/@/api/search';
  import { deviceList } from '/@/api/device';
  // utils
  import dayjs from 'dayjs';
  import { origin } from '/@/constant';
  import { downloadByData, downloadByUrl, downloadByUrl2 } from '/@/utils/file/download';
  // hooks
  import { useMessage } from '/@/hooks/web/useMessage';

  const titleRoutes = ref<Route[]>([
    {
      path: '/search',
      breadcrumbName: '本地检索',
    },
    {
      path: '',
      breadcrumbName: '视频检索',
    },
  ]);

  const channelList = ref<any>([]);
  const channelNameList = ref<any>([]);
  const { createMessage } = useMessage();
  const [registerModal, { openModal }] = useModal();
  const selectKeys = ref<any>([]);
  const [registerTable, { reload, getDataSource }] = useTable({
    api: getVideoSearch,
    // dataSource: tableData,
    beforeFetch: (params) => {
      if (params.rangeTime) {
        params.startTs = dayjs(params.rangeTime[0]).startOf('day').valueOf();
        params.endTs = dayjs(params.rangeTime[1]).endOf('day').valueOf();
        delete params.rangeTime;
      }
      if (params.channel) {
        params.channel = params.channel.join(',');
      }
      if (params.channelName) {
        params.channelName = params.channelName.join(',');
      }
      return params;
    },
    showIndexColumn: true,
    columns,
    canResize: false,
    rowSelection: {
      onChange: (keys: any) => {
        console.log(keys);
        selectKeys.value = keys;
      },
    },
    clearSelectOnPageChange: true,
    useSearchForm: true,
    formConfig: {
      schemas: searchFormSchema,
      labelWidth: 80,
      autoSetPlaceHolder: true,
      submitButtonOptions: { text: '检索' },
      resetButtonOptions: { color: 'primary' },
      actionColOptions: {
        span: 6,
      },
    },
    actionColumn: {
      width: 250,
      title: '操作',
      dataIndex: 'action',
      fixed: undefined,
    },
  });

  getChannleList();
  async function getChannleList() {
    const result = await deviceList({ operatorType: 'HDMI' });
    channelList.value = result.map((item) => {
      return {
        value: item.serialNumber,
        label: item.id,
      };
    });
    channelNameList.value = result.map((item) => {
      return {
        value: item.name,
        label: item.name,
      };
    });
  }

  async function handlePreview(item) {
    openModal(true, item);
  }

  async function handleDel(item) {
    await delVideo({ ids: item.idList });
    reload();
  }
  async function handleDownload(item, type) {
    // const fileList = item.fileList.map((item) => {
    //   return { filePath: item.filePath };
    // });
    // const result = await downloadVideo({ fileList });
    // downloadByData(result, 'video.xlsx');
    const url =
      origin +
      `/api/search/download/batch?channel=${item.channel}&date=${item.fileTime}&aiType=TEXT&fileFormat=${type}`;
    downloadByUrl2(
      url,
      type === 'mp4'
        ? `video-${item.channel}-${item.fileTime}.zip`
        : `ts-${item.channel}-${item.fileTime}.zip`,
    );
  }

  async function handleBatchDownload(type) {
    if (!selectKeys.value.length) return createMessage.info('请勾选文件');
    // const fileList: any = [];
    const tableData = getDataSource().filter((item: any) => {
      return selectKeys.value.includes(item.key);
    });
    tableData.map((a) => {
      // a.fileList.map((b) => {
      //   fileList.push({ filePath: b.filePath });
      // });
      const url =
        origin +
        `/api/search/download/batch?channel=${a.channel}&date=${a.fileTime}&aiType=TEXT&fileFormat=${type}`;
      downloadByUrl2(
        url,
        type === 'mp4'
          ? `video-${a.channel}-${a.fileTime}.zip`
          : `ts-${a.channel}-${a.fileTime}.zip`,
      );
    });
    // const result = await downloadVideo({ fileList });
    // downloadByData(result, 'video.xlsx');
  }
</script>
<style lang="less" scoped></style>
