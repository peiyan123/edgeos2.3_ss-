import { BasicColumn } from '/@/components/Table';
import { FormSchema } from '/@/components/Form';
import { Badge } from 'ant-design-vue';

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
    dataIndex: 'id',
    title: '通道号',
  },
  {
    dataIndex: 'name',
    title: '通道名称',
  },
  {
    dataIndex: 'operatorType',
    title: '设备类型',
  },
  {
    dataIndex: 'healthStatus',
    title: '状态',
    customRender: ({ record }) => {
      return record.healthStatus ? (
        <Badge status="success" text="在线" />
      ) : (
        <Badge status="error" text="离线" />
      );
    },
  },
  {
    dataIndex: 'functionStatus',
    title: '录制状态',
    customRender: ({ record }) => {
      return record.functionStatus == 1 ? (
        <Badge status="success" text="开启" />
      ) : (
        <Badge status="error" text="关闭" />
      );
    },
  },
];
export const columnsTask: BasicColumn[] = [
  {
    dataIndex: 'channel',
    title: '通道号',
  },
  {
    dataIndex: 'channelName',
    title: '通道名称',
  },
  {
    dataIndex: 'operatorType',
    title: '设备类型',
  },
  {
    dataIndex: 'taskName',
    title: '当前任务',
  },
  {
    dataIndex: 'createTime',
    title: '创建时间',
  },
];
export const searchColumns: BasicColumn[] = [
  {
    dataIndex: 'serialNumber',
    title: '序号',
  },
  {
    dataIndex: 'model',
    title: '设备型号',
  },
  {
    dataIndex: 'name',
    title: '通道名称',
  },
  {
    dataIndex: 'operatorType',
    title: '设备类型',
  },
];

export const manualAddFormSchema: FormSchema[] = [
  {
    field: 'name',
    label: '通道名称',
    component: 'Input',
    required: true,
    itemProps: {
      labelCol: { span: 5 },
      wrapperCol: { span: 16 },
    },
  },
  {
    field: 'operatorType',
    label: '通道类型',
    component: 'RadioGroup',
    required: true,
    itemProps: {
      labelCol: { span: 5 },
      wrapperCol: { span: 16 },
    },
    componentProps: {
      options: [
        { label: 'IPC', value: 'IPC' },
        { label: 'NVR', value: 'NVR' },
        { label: 'HDMI', value: 'HDMI' },
      ],
    },
  },
  {
    field: 'rtspUrl',
    label: 'RTSP地址',
    component: 'Input',
    required: true,
    itemProps: {
      labelCol: { span: 5 },
      wrapperCol: { span: 16 },
    },
  },
];

export const editChannelFormSchema: FormSchema[] = [
  {
    field: 'id',
    label: '通道号',
    component: 'Input',
    required: true,
    componentProps: {
      disabled: true,
    },
    itemProps: {
      labelCol: { span: 5 },
      wrapperCol: { span: 16 },
    },
  },
  {
    field: 'name',
    label: '通道名称',
    component: 'Input',
    required: true,
    itemProps: {
      labelCol: { span: 5 },
      wrapperCol: { span: 16 },
    },
  },

  {
    field: 'ipAddress',
    label: 'IP地址',
    component: 'Input',
    required: true,
    componentProps: {
      disabled: true,
    },
    itemProps: {
      labelCol: { span: 5 },
      wrapperCol: { span: 16 },
    },
  },
  {
    field: 'operatorType',
    label: '设备类型',
    component: 'RadioGroup',
    required: true,
    componentProps: {
      disabled: true,
      options: [
        { value: 'HDMI', label: '视频' },
        { value: 'AUDIO', label: '音频' },
      ],
    },
    itemProps: {
      labelCol: { span: 5 },
      wrapperCol: { span: 16 },
    },
  },
];
export const taskSchema: FormSchema[] = [
  {
    field: 'taskName',
    label: '任务名称',
    component: 'Input',
    required: true,
    itemProps: {
      labelCol: { span: 5 },
      wrapperCol: { span: 16 },
    },
    rules: [
      {
        pattern: /^[a-zA-Z0-9_\u4e00-\u9fa5-]+$/,
        message: '允许汉字、英文、数字、下划线、中划线',
      },
      { max: 120 },
    ],
  },
];
