export type CredentialType = {
  createdTime: number;
  credentialsId: string;
  credentialsType: string;
  credentialsValue: any;
  deviceId: {
    entityType: string;
    id: string;
  };
  id: string;
};

export type ServiceProperty = {
  key: string;
  lastUpdateTs: number;
  value: true;
};

export interface DeviceAppListItem {
  appId: string;
  appName: string;
  appType: string;
  startTime: string;
  stopTime: string;
  createTime: string;
  status: number;
  appVersion: string;
  picture: { base64: string; name: string; type: string };
  deviceId: string;
  deviceName: string;
  currentVersion: string;
  errorMessage: string;
  kind: string;
}

export type FileUrlUpload = {
  fileName: any;
  fileMd5: any;
  fileSize: any;
  chunkSize: any;
  contentType: any;
  fileVersion: string;
};

export type FileMergeType = {
  fileName: string;
  fileSize: number;
  uploadId: string;
  type: any;
  md5: any;
  deviceProfileId: any;
  fileDesc?: any;
  fileVersion: any;
  title: any;
  userId: any;
};

export interface FileItem {
  uid: string;
  name?: string;
  status?: string;
  response?: string;
  url?: string;
  preview?: string;
  originFileObj?: any;
  file: string | Blob;
  size: number;
}
