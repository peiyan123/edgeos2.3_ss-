import { FormSchema } from '/@/components/Form';

export const timeConfigSchema: FormSchema[] = [
  {
    field: 'fileRoot',
    label: '文件存储地址',
    component: 'Input',
    required: false,
    ifShow: false,
    itemProps: {
      labelCol: { span: 5 },
      wrapperCol: { span: 16 },
    },
  },
  {
    field: 'day',
    label: '保存天数',
    component: 'InputNumber',
    required: true,
    componentProps: {
      step: 1,
      precision: 0,
      min: 1,
      max: 30,
    },
    itemProps: {
      labelCol: { span: 5 },
      wrapperCol: { span: 16 },
    },
  },
];

export const userformSchema: FormSchema[] = [
  {
    field: 'username',
    label: '用户名称',
    component: 'Input',
    required: true,
    itemProps: {
      labelCol: { span: 5 },
      wrapperCol: { span: 16 },
    },
    rules: [{ max: 100 }],
  },
  {
    field: 'password',
    label: '密码',
    component: 'Input',
    required: false,
    itemProps: {
      labelCol: { span: 5 },
      wrapperCol: { span: 16 },
    },
    slot: 'password',
  },
];

export const resetformSchema: FormSchema[] = [
  {
    field: 'username',
    label: '用户名',
    component: 'Input',
    required: true,
    itemProps: {
      labelCol: { span: 5 },
      wrapperCol: { span: 16 },
    },
    rules: [{ max: 100 }],
  },
  {
    field: 'password',
    label: '密码',
    component: 'Input',
    required: true,
    itemProps: {
      labelCol: { span: 5 },
      wrapperCol: { span: 16 },
    },
    rules: [
      {
        pattern: /^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]{6,20}$/,
        message: '6~20位数字或字母的组合',
      },
    ],
  },
  {
    field: 'c',
    label: '重复密码',
    component: 'Input',
    required: true,
    itemProps: {
      labelCol: { span: 5 },
      wrapperCol: { span: 16 },
    },
    dynamicRules: ({ values }) => {
      return [
        {
          required: true,
          validator: (_, val) => {
            if (val !== values.password) {
              return Promise.reject('密码不一致');
            }
            if (!val) return Promise.reject('请输入密码');

            return Promise.resolve();
          },
          trigger: ['change', 'blur'],
        },
      ];
    },
  },
];

export const videoformSchema: FormSchema[] = [
  {
    field: 'channel',
    label: '通道号',
    component: 'Select',
    itemProps: {
      labelCol: { span: 5 },
      wrapperCol: { span: 16 },
    },
    slot: 'channel',
  },
  {
    field: 'channelName',
    label: '通道名称',
    component: 'Input',
    itemProps: {
      labelCol: { span: 5 },
      wrapperCol: { span: 16 },
    },
    componentProps: {
      disabled: true,
    },
    // slot: 'channelName',
  },
  {
    field: 'stream',
    label: '码流选择',
    component: 'Select',
    itemProps: {
      labelCol: { span: 5 },
      wrapperCol: { span: 16 },
    },
    slot: 'stream',
  },
  {
    field: 'format',
    label: '编码格式',
    component: 'Select',
    itemProps: {
      labelCol: { span: 5 },
      wrapperCol: { span: 16 },
    },
    slot: 'format',
  },
  {
    field: 'resolution',
    label: '分辨率',
    component: 'Select',
    ifShow: false,
    itemProps: {
      labelCol: { span: 5 },
      wrapperCol: { span: 16 },
    },
    slot: 'resolution',
  },
  // {
  //   field: 'fps',
  //   label: '帧率',
  //   component: 'Select',
  //   itemProps: {
  //     labelCol: { span: 5 },
  //     wrapperCol: { span: 16 },
  //   },
  //   slot: 'fps',
  // },
  {
    field: 'bps',
    label: '码率',
    component: 'Select',
    itemProps: {
      labelCol: { span: 5 },
      wrapperCol: { span: 16 },
    },
    slot: 'bps',
  },
  {
    field: 'startStatus',
    label: '子码流开启',
    component: 'Switch',
    ifShow: false,
    itemProps: {
      labelCol: { span: 5 },
      wrapperCol: { span: 16 },
    },
  },
];

export const audioformSchema: FormSchema[] = [
  {
    field: 'track',
    label: '声道数',
    component: 'Select',
    itemProps: {
      labelCol: { span: 5 },
      wrapperCol: { span: 16 },
    },
    slot: 'track',
  },
  {
    field: 'quantization',
    label: '量化位数',
    component: 'Select',
    itemProps: {
      labelCol: { span: 5 },
      wrapperCol: { span: 16 },
    },
    slot: 'quantization',
  },
  {
    field: 'frequency',
    label: '采样频率',
    component: 'Select',
    itemProps: {
      labelCol: { span: 5 },
      wrapperCol: { span: 16 },
    },
    slot: 'frequency',
  },
  // {
  //   field: 'bps',
  //   label: '码率',
  //   component: 'Select',
  //   itemProps: {
  //     labelCol: { span: 5 },
  //     wrapperCol: { span: 16 },
  //   },
  //   slot: 'bps',
  // },
];
export const recordformSchema: FormSchema[] = [
  {
    field: 'recordTime',
    label: '录制时长',
    component: 'Select',
    defaultValue: '30',
    itemProps: {
      labelCol: { span: 5 },
      wrapperCol: { span: 16 },
    },
    slot: 'recordTime',
  },
  // {
  //   field: 'badNum',
  //   label: '录制文件修复',
  //   component: 'Input',
  //   defaultValue: '0',
  //   itemProps: {
  //     labelCol: { span: 5 },
  //     wrapperCol: { span: 16 },
  //   },
  //   slot: 'badNum',
  // },
];
export const ntpFormSchema: FormSchema[] = [
  {
    field: 'ntpServer',
    label: 'NTP服务器地址',
    component: 'Input',
    itemProps: {
      labelCol: { span: 5 },
      wrapperCol: { span: 16 },
    },
    slot: 'ntpServer',
  },
  {
    field: 'autoNtp',
    label: 'NTP自动校准',
    component: 'Switch',
    itemProps: {
      labelCol: { span: 5 },
      wrapperCol: { span: 16 },
    },
    slot: 'autoNtp',
  },
  {
    field: 'autoAlg',
    label: '算法自动校准',
    component: 'Switch',
    itemProps: {
      labelCol: { span: 5 },
      wrapperCol: { span: 16 },
    },
    slot: 'autoAlg',
  },
  {
    field: 'dateTime',
    label: '日期',
    component: 'DatePicker',
    itemProps: {
      labelCol: { span: 5 },
      wrapperCol: { span: 16 },
    },

    slot: 'dateTime',
  },

  {
    field: 'nowTimeZone',
    label: '时区',
    component: 'Select',
    itemProps: {
      labelCol: { span: 5 },
      wrapperCol: { span: 16 },
    },
    slot: 'nowTimeZone',
  },
];

export const osdAttrConfig = {
  '0': '透明',
  '255': '不透明',
};
