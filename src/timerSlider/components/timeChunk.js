import CommonUtils from './commonUtils';
/**
 * 时间块元素
 * @param {str} 每一段时间的数据->000001-000010-A
 */
class timeChunk extends CommonUtils {
  constructor(str) {
    super();
    this.timeStr = str;
    this.init();
  }
  init() {
    let arr = this.timeStr.split('-');
    let startTime = arr[0];
    let endTime = arr[1];
    this.type = arr[2];
    this.startTime = this.timeTranslateSecondsUtils(startTime);
    this.endTime = this.timeTranslateSecondsUtils(endTime);
  }
  createDom(length, chunkType) {
    const div = document.createElement('div');
    // TODO:lgj
    if (chunkType[this.type] === 'rgb(0,0,255,0.3)') {
      div.classList.add('ts-timeChunk-half');
    } else {
      div.classList.add('ts-timeChunk');
    }
    div.style.background = chunkType[this.type];
    div.style.left = (this.startTime * length) / (60 * 60 * 24) + 'px';
    // TODO: lgj
    if (((this.endTime - this.startTime) * length) / (60 * 60 * 24) <= 0.1) {
      div.style.width = 0.07 + 'px';
    } else {
      div.style.width = ((this.endTime - this.startTime) * length) / (60 * 60 * 24) + 'px';
    }
    return div;
  }
}

export default timeChunk;
