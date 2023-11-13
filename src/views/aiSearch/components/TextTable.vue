<template>
  <BasicTable @register="registerTable">
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
            <Menu.Item>
              <span @click="handleBatchDownload('csv')">CSV</span>
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
                <Menu.Item>
                  <span @click="handleDownload(record, 'csv')">CSV</span>
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
</template>
<script lang="ts" setup>
  import { ref } from 'vue';
  // components
  import { columns, searchFormSchema, tableData } from '../config';
  import { Breadcrumb, Divider, Button, Select, Dropdown, Menu } from 'ant-design-vue';
  import { DownOutlined } from '@ant-design/icons-vue';
  import { BasicTable, useTable, TableAction } from '/@/components/Table';
  import Preview from '../../videoSearch/components/Preview.vue';
  import { useModal } from '/@/components/Modal';
  // services
  import { delAi, downloadAi, getAiSearch } from '/@/api/search';
  // utils
  import dayjs from 'dayjs';
  import { downloadByData, downloadByUrl2 } from '/@/utils/file/download';
  // hooks
  import { useMessage } from '/@/hooks/web/useMessage';

  const selectKeys = ref<any>([]);
  const { createMessage } = useMessage();
  const [registerModal, { openModal }] = useModal();
  const [registerTable, { reload, getDataSource }] = useTable({
    api: getAiSearch,
    // dataSource: tableData,
    beforeFetch: (params) => {
      if (params.rangeTime) {
        params.startTs = dayjs(params.rangeTime[0]).startOf('day').valueOf();
        params.endTs = dayjs(params.rangeTime[1]).endOf('day').valueOf();
        delete params.rangeTime;
      }
      params.aiType = 'TEXT';
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
      labelWidth: 120,
      autoSetPlaceHolder: true,
      submitButtonOptions: { text: '检索' },
      resetButtonOptions: { color: 'primary' },
      actionColOptions: {
        span: 8,
      },
      colon: true,
    },
    actionColumn: {
      width: 250,
      title: '操作',
      dataIndex: 'action',
      fixed: undefined,
    },
  });

  function handlePreview(item) {
    openModal(true, { ...item, type: 'ai' });
  }
  async function handleDownload(item, type) {
    // const fileList = item.fileList.map((item) => {
    //   return { filePath: item.filePath };
    // });
    // const result = await downloadAi({ fileList });
    // downloadByData(result, 'ai.xlsx');
    const url =
      origin +
      `/api/search/download/batch/ai?channel=${item.channel}&fileTime=${
        item.fileTime
      }&aiType=TEXT&keys=${item.keys ? item.keys : ''}&fileFormat=${type}`;
    console.log(url);
    if (type === 'csv') {
      downloadByUrl2(url, `ai-${item.channel}-${item.fileTime}.${type}`);
    } else {
      downloadByUrl2(url, `ai-${item.channel}-${item.fileTime}.zip`);
    }
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
        `/api/search/download/batch/ai?channel=${a.channel}&fileTime=${
          a.fileTime
        }&aiType=TEXT&keys=${a.keys ? a.keys : ''}&fileFormat=${type}`;
      if (type === 'csv') {
        downloadByUrl2(url, `ai-${a.channel}-${a.fileTime}.${type}`);
      } else {
        downloadByUrl2(url, `ai-${a.channel}-${a.fileTime}.zip`);
      }
    });
    // const result = await downloadAi({ fileList });
    // downloadByData(result, 'ai.xlsx');
  }
  async function handleDel(item) {
    await delAi({
      ids: item.idList,
      aiType: 'TEXT',
      key: item.key,
      channel: [item.channel],
      fileTime: item.fileTime,
    });
    reload();
  }
</script>
<style lang="less" scoped></style>
