export interface Iplaystart {
  playId?: any;
  cmdType: string;
  startPlayTime?: any;
  channels: Array<{
    channelType: string;
    channelId: string;
    fileNames: Array<{
      filename: string;
      beginTime?: string;
      endTime?: string;
    }>;
  }>;
}

export interface IplayControl {
  playId?: any;
  cmdType: string;
  data: {
    position?: any;
    rate?: any;
  };
}
