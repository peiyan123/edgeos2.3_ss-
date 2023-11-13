import { ref } from 'vue';
import { pick, isEmpty } from 'lodash';
import { useMessage } from '/@/hooks/web/useMessage';

export function useTrain() {
  const controlConfig = ref<any>({
    voInputFormat: undefined,
    voInputResolution: undefined,
    voOutputResolution: undefined,
    voOutputFps: undefined,
    aoModelType: undefined,
  });
  const cityList = ref([
    { label: '京', value: '京' },
    { label: '津', value: '津' },
    { label: '沪', value: '沪' },
    { label: '渝', value: '渝' },
    { label: '辽', value: '辽' },
    { label: '吉', value: '吉' },
    { label: '冀', value: '冀' },
    { label: '晋', value: '晋' },
    { label: '青', value: '青' },
    { label: '鲁', value: '鲁' },
    { label: '豫', value: '豫' },
    { label: '苏', value: '苏' },
    { label: '皖', value: '皖' },
    { label: '浙', value: '浙' },
    { label: '闽', value: '闽' },
    { label: '赣', value: '赣' },
    { label: '湘', value: '湘' },
    { label: '鄂', value: '鄂' },
    { label: '粤', value: '粤' },
    { label: '琼', value: '琼' },
    { label: '甘', value: '甘' },
    { label: '陕', value: '陕' },
    { label: '黔', value: '黔' },
    { label: '滇', value: '滇' },
    { label: '川', value: '川' },
    { label: '黑', value: '黑' },
    { label: '蒙', value: '蒙' },
    { label: '新', value: '新' },
    { label: '藏', value: '藏' },
    { label: '宁', value: '宁' },
    { label: '桂', value: '桂' },
    { label: '港', value: '港' },
    { label: '澳', value: '澳' },
  ]);
  const detectionTargetData = ref([
    { label: '烟雾', value: 'smoke' },
    { label: '火焰', value: 'fire' },
  ]);
  function colorRgb(colorData = '#ffffff') {
    // 16进制颜色值的正则
    const reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/;
    // 把颜色值变成小写
    let color = colorData.toLowerCase();
    if (reg.test(color)) {
      // 如果只有三位的值，需变成六位，如：#fff => #ffffff
      if (color.length === 4) {
        let colorNew = '#';
        for (let i = 1; i < 4; i += 1) {
          colorNew += color.slice(i, i + 1).concat(color.slice(i, i + 1));
        }
        color = colorNew;
      }
      // 处理六位的颜色值，转为RGB
      const colorChange: any = [];
      for (let i = 1; i < 7; i += 2) {
        colorChange.push(parseInt('0x' + color.slice(i, i + 2)));
      }
      return 'RGB(' + colorChange.join(',') + ')';
    } else {
      return color;
    }
  }
  return {
    controlConfig,
    colorRgb,
    cityList,
    detectionTargetData,
  };
}

// 不同算法组装不同提交数据
export function resetSubmitData(data) {
  const algoId = data.algType;
  const commonAttr = ['algType', 'custom', 'dispatch', 'id', 'maxDet', 'minDet', 'roi', 'rois'];
  let result: any;
  switch (algoId) {
    case 'blockingmonitoring':
      result = pick(data, commonAttr);
      //通道占道
      break;
    case 'chefhatmonitoring':
      // 厨师帽检测
      result = pick(data, [...commonAttr, 'minAlarmFrames', 'outputMode', 'thresh', 'timeThresh']);
      break;
    case 'chefuniformmonitoring':
      // 厨师服与赤膊检测
      result = pick(data, [...commonAttr, 'minAlarmFrames', 'outputMode', 'thresh', 'timeThresh']);
      break;
    case 'facemaskmonitoring':
      result = pick(data, [...commonAttr, 'minAlarmFrames', 'outputMode', 'thresh', 'timeThresh']);
      // 口罩佩戴检测
      break;
    case 'lifejacketdetection':
      result = pick(data, [...commonAttr, 'minAlarmFrames', 'outputMode', 'thresh', 'timeThresh']);
      break;
    case 'peopleaccompanymonitoring':
      result = pick(data, [...commonAttr, 'timeThresh', 'countThresh']);
      break;
    case 'peoplepollingmonitoring':
      result = pick(data, [...commonAttr, 'timeThresh', 'countThresh', 'outputMode']);
      break;
    case 'patrolmonitoring':
      result = pick(data, [...commonAttr, 'timeThresh', 'countThresh', 'outputMode']);
      break;
    case 'faceset':
      // 人脸识别
      result = pick(data, [
        ...commonAttr,
        'countThresh',
        'device',
        'extras',
        'minAlarmFrames',
        'outputMode',
        'thresh',
        'timeThresh',
      ]);
      const black = data.pageList
        .filter((a) => {
          return a.type === 'black' && a.id;
        })
        .map((b) => {
          return b.id;
        });
      const white = data.pageList
        .filter((a) => {
          return a.type === 'white' && a.id;
        })
        .map((b) => {
          return b.id;
        });
      result.custom.blacklist = black;
      result.custom.whitelist = white;
      break;
    case 'gluedtophonemonitoring':
      // 玩手机检测
      result = pick(data, [...commonAttr, 'minAlarmFrames', 'outputMode', 'thresh', 'timeThresh']);
      break;
    case 'helmetwearingmonitoring':
      // 安全帽佩戴检测
      result = pick(data, [
        ...commonAttr,
        'countThresh',
        'device',
        'extras',
        'minAlarmFrames',
        'outputMode',
        'thresh',
        'timeThresh',
      ]);
      break;
    case 'intrusionmonitoring':
      // 入侵检测
      result = pick(data, [
        ...commonAttr,
        'countThresh',
        'device',
        'extras',
        'minAlarmFrames',
        'outputMode',
        'thresh',
        'timeThresh',
      ]);
      break;
    case 'mnpmonitoring':
      // 机非人检测
      result = pick(data, [
        ...commonAttr,
        'countThresh',
        'device',
        'extras',
        'minAlarmFrames',
        'outputMode',
        'thresh',
        'timeThresh',
      ]);
      break;
    case 'mousedetection':
      // 老鼠检测
      result = pick(data, [...commonAttr, 'minAlarmFrames', 'outputMode', 'thresh', 'timeThresh']);
      break;
    case 'nlprdetection':
      // 车牌识别
      result = pick(data, [...commonAttr, 'minAlarmFrames', 'outputMode', 'thresh']);
      break;
    case 'ondutymonitoring':
      // 离岗检测
      result = pick(data, [
        ...commonAttr,
        'countThresh',
        'device',
        'extras',
        'minAlarmFrames',
        'outputMode',
        'thresh',
        'timeThresh',
      ]);
      break;
    case 'peoplecountingcrossing':
      // 客流统计
      result = pick(data, [
        ...commonAttr,
        'countThresh',
        'device',
        'extras',
        'minAlarmFrames',
        'outputMode',
        'thresh',
        'timeThresh',
      ]);
      break;
    case 'peoplecrossingmonitoring':
      // 越线统计
      result = pick(data, commonAttr);
      break;
    case 'peopledensitydetection':
      // 人员密度统计
      result = pick(data, [...commonAttr, 'minAlarmFrames', 'outputMode', 'thresh']);
      break;
    case 'peoplefalldetection':
      // 跌到检测
      result = pick(data, [
        ...commonAttr,
        'countThresh',
        'device',
        'extras',
        'minAlarmFrames',
        'outputMode',
        'thresh',
        'timeThresh',
      ]);
      break;
    case 'safetyvestmonitoring':
      // 反光衣穿戴检测
      result = pick(data, [
        ...commonAttr,
        'countThresh',
        'device',
        'extras',
        'minAlarmFrames',
        'outputMode',
        'thresh',
        'timeThresh',
      ]);
      break;
    case 'smokefiremonitoring':
      // 烟火检测
      const a = pick(data, [...commonAttr, 'minAlarmFrames', 'outputMode', 'thresh', 'timeThresh']);
      if (Array.isArray(a.custom['alarm-type'])) {
        if (a.custom['alarm-type'].length > 1) {
          a.custom['alarm-type'] = 'both';
        } else {
          a.custom['alarm-type'] = data.custom['alarm-type'][0];
        }
      }
      result = a;
      break;
    case 'smokingcallmonitoring':
      // 吸烟打电话检测
      result = pick(data, [
        ...commonAttr,
        'countThresh',
        'device',
        'extras',
        'minAlarmFrames',
        'outputMode',
        'thresh',
        'timeThresh',
      ]);
      break;
    case 'wastebinmonitoring':
      // 垃圾桶盖状态检测
      result = pick(data, [
        ...commonAttr,
        'countThresh',
        'device',
        'extras',
        'minAlarmFrames',
        'outputMode',
        'thresh',
        'timeThresh',
      ]);
      break;

    case 'uniformnn':
      // 工服穿戴检测
      result = pick(data, [
        ...commonAttr,
        'maxBboxNum',
        'minAlarmFrames',
        'similarityThresh',
        'outputMode',
        'thresh',
        'timeThresh',
      ]);
      break;
    case 'captain':
      // 一级水域船长未监航
      result = pick(data, ['fenceId', 'fenceNum', 'level', 'title']);
      result.aiAlgorithm = data.algType;
      console.log(result);
      break;
    case 'stranger':
      // 船舶人员与配员不符
      result = pick(data, ['level', 'title']);
      result.aiAlgorithm = data.algType;
      break;
    case 'camerashiftmonitoring':
      // 镜头移动
      result = pick(data, [
        ...commonAttr,
        'countThresh',
        'device',
        'extras',
        'minAlarmFrames',
        'outputMode',
        'thresh',
        'timeThresh',
      ]);
      break;
  }
  return result;
}
