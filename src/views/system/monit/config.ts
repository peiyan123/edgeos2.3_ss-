const color = [
  'blue',
  '#fac858',
  'red',
  '#91cc75',
  '#73c0de',
  '#3ba272',
  '#fc8452',
  '#9a60b4',
  '#ea7ccc',
];

export const cpuOptions = {
  title: {
    text: 'CPU(核)',
    bottom: 0,
    textStyle: {
      fontSize: 16,
    },
  },
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'cross',
      label: {
        backgroundColor: '#6a7985',
      },
    },
  },
  xAxis: {
    type: 'category',
    data: [],
  },
  yAxis: {
    type: 'value',
  },
  series: [
    {
      data: [],
      type: 'line',
      smooth: true,
      showSymbol: false,
    },
  ],
  color: color,
};

export const diskNames = ['/dev/mmcblk0p6', '/dev/mmcblk0p7', '/root/dev/mmcblk0p3'];
export const diskOptions = {
  title: {
    text: '磁盘',
    bottom: 0,
    textStyle: {
      fontSize: 16,
    },
  },
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'cross',
      label: {
        backgroundColor: '#6a7985',
      },
    },
  },
  xAxis: {
    type: 'category',
    data: [],
  },
  yAxis: {
    type: 'value',
  },
  series: [
    // {
    //   data: [],
    //   type: 'line',
    //   smooth: true,
    //   showSymbol: false,
    // },
  ],
  color: color,
};

export const memoOptions = {
  title: {
    text: '内存',
    bottom: 0,
    textStyle: {
      fontSize: 16,
    },
  },
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'cross',
      label: {
        backgroundColor: '#6a7985',
      },
    },
  },
  xAxis: {
    type: 'category',
    data: [],
  },
  yAxis: {
    type: 'value',
  },
  series: [
    {
      data: [],
      type: 'line',
      smooth: true,
      showSymbol: false,
    },
  ],
  color: color,
};

export const ethOptions = {
  title: {
    text: '以太网',
    bottom: 0,
    textStyle: {
      fontSize: 16,
    },
  },
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'cross',
      label: {
        backgroundColor: '#6a7985',
      },
    },
  },
  xAxis: {
    type: 'category',
    data: [],
  },
  yAxis: {
    type: 'value',
  },
  series: [
    // {
    //   data: [],
    //   type: 'line',
    //   smooth: true,
    //   showSymbol: false,
    // },
  ],
  color: color,
};

export const fourGOptions = {
  title: {
    text: '4G',
    bottom: 0,
    textStyle: {
      fontSize: 16,
    },
  },
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'cross',
      label: {
        backgroundColor: '#6a7985',
      },
    },
  },
  xAxis: {
    type: 'category',
    data: [],
  },
  yAxis: {
    type: 'value',
  },
  series: [
    // {
    //   data: [],
    //   type: 'line',
    //   smooth: true,
    //   showSymbol: false,
    // },
  ],
  color: color,
};

export const temperatureOptions = {
  title: {
    text: '设备温度',
    bottom: 0,
    textStyle: {
      fontSize: 16,
    },
  },
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'cross',
      label: {
        backgroundColor: '#6a7985',
      },
    },
  },
  xAxis: {
    type: 'category',
    data: [],
  },
  yAxis: {
    type: 'value',
  },
  series: [
    {
      data: [],
      type: 'line',
      smooth: true,
      showSymbol: false,
    },
  ],
  color: color,
};
