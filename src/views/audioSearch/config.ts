import dayjs from 'dayjs';
import { BasicColumn, FormSchema } from '/@/components/Table';

export const tableData = [
  { id: 1, a: 'xx', b: 'xx', c: 'xx', d: 'xx' },
  { id: 2, a: 'xx', b: 'xx', c: 'xx', d: 'xx' },
  { id: 3, a: 'xx', b: 'xx', c: 'xx', d: 'xx' },
  { id: 4, a: 'xx', b: 'xx', c: 'xx', d: 'xx' },
  { id: 5, a: 'xx', b: 'xx', c: 'xx', d: 'xx' },
  { id: 6, a: 'xx', b: 'xx', c: 'xx', d: 'xx' },
  { id: 7, a: 'xx', b: 'xx', c: 'xx', d: 'xx' },
  { id: 8, a: 'xx', b: 'xx', c: 'xx', d: 'xx' },
  { id: 9, a: 'xx', b: 'xx', c: 'xx', d: 'xx' },
  { id: 10, a: 'xx', b: 'xx', c: 'xx', d: 'xx' },
  { id: 11, a: 'xx', b: 'xx', c: 'xx', d: 'xx' },
  { id: 12, a: 'xx', b: 'xx', c: 'xx', d: 'xx' },
];

export const columns: BasicColumn[] = [
  {
    dataIndex: 'channel',
    title: '通道号',
  },
  {
    dataIndex: 'channelName',
    title: '通道名称',
  },
  {
    dataIndex: 'fileTime',
    title: '存储日期',
    customRender: ({ text }) => {
      return dayjs(text).format('YYYY.MM.DD');
    },
  },
  {
    dataIndex: 'fileSize',
    title: '文件大小',
    customRender: ({ text }) => {
      if (text) {
        if (text > 1024) {
          return (text / 1024).toFixed(2) + 'GB';
        }
        return text + 'MB';
      }
    },
  },
];

export const searchFormSchema: FormSchema[] = [
  {
    field: 'rangeTime',
    label: '起止日期',
    component: 'RangePicker',
    colProps: {
      span: 6,
    },
    componentProps: {
      style: { width: '100%' },
      showTime: false,
    },
  },
  {
    field: 'channel',
    label: '通道号',
    component: 'Select',
    colProps: {
      span: 6,
    },
    slot: 'channel',
  },
  {
    field: 'channelName',
    label: '通道名称',
    component: 'Select',
    componentProps: {
      placeHolder: '请输入通道名称进行搜索',
    },
    colProps: {
      span: 6,
    },
    slot: 'channelName',
  },
];
