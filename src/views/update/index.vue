<template>
  <PageWrapper :content-style="{ backgroundColor: '#fff', padding: '30px' }">
    <Breadcrumb :routes="titleRoutes" />
    <Divider />
    <div class="pt-50px pb-200px">
      <div class="w-500px m-auto relative text-center">
        <Tag class="mb-10px text-size-16px p-5px" color="warning" closable
          >在升级过程中，请勿断电操作，以防系统出现不可知错误状态</Tag
        >
        <div id="upload-picker"></div>
        <div class="pickText">
          <FolderOutlined class="text-size-80px" />
          <p style="height: 25px">点击或将文件拖拽到这里上传</p>
          <p>1、支持拓展名：.zip, 2、文件大小：≤2GB</p>
          <p>3、文件名称只能包含数字,字母和._-</p>
          <p v-if="softVersion">当前版本：{{ softVersion }}</p>
        </div>
        <div class="flex items-center my-10px justify-between" v-if="fileName">
          <span>{{ fileName }}</span>
          <CloseOutlined @click="stopFile" v-if="progress != 99" />
        </div>
        <div v-if="!showUpgradeBtn && fileName">
          <Progress :percent="progress" />
        </div>
        <div class="flex justify-end my-10px" v-if="showUpgradeBtn">
          <Button type="primary" @click="handleStartUpgrade">开始升级</Button>
        </div>
      </div>
    </div>
  </PageWrapper>
</template>
<script lang="ts" setup>
  import { onMounted, onUnmounted, ref } from 'vue';
  // components
  import { FolderOutlined, CloseOutlined } from '@ant-design/icons-vue';
  import { PageWrapper } from '/@/components/Page';
  import { Divider, Breadcrumb, Progress, Button, Tag } from 'ant-design-vue';
  // hooks
  import { useMessage } from '/@/hooks/web/useMessage';
  import {
    checkFile,
    checkMergeFile,
    delFile,
    getInfo,
    mergeFile,
    startUpgrade,
  } from '/@/api/update';
  import { Route } from 'ant-design-vue/lib/breadcrumb/Breadcrumb';
  // service

  const titleRoutes = ref<Route[]>([
    {
      path: '',
      breadcrumbName: '升级管理',
    },
  ]);
  const { createMessage } = useMessage();
  const progress = ref();
  const showUpgradeBtn = ref(false);
  let fileId;
  const fileName = ref();
  const softVersion = ref();
  let uploader;
  let timer: any = null;
  function initWebUploader() {
    console.log(WebUploader);
    WebUploader.Uploader.register(
      {
        // 在文件发送之前执行
        'before-send-file': 'beforeSendFile',
        // 在文件分片（如果没有启用分片，整个文件被当成一个分片）后，上传之前执行
        'before-send': 'beforeSend',
        // 在文件所有分片都上传完后，且服务端没有错误返回后执行
        'after-send-file': 'afterSendFile',
      },
      {
        beforeSendFile: function (file) {
          initConfig();
          // Deferred对象在钩子回掉函数中经常要用到，用来处理需要等待的异步操作。
          let deferred = WebUploader.Deferred();
          //1、计算文件的唯一标记MD5，用于断点续传
          uploader
            .md5File(file, 0, 3 * 1024 * 1024)
            .progress(function (percentage) {
              // 上传进度
              console.log('上传进度:', percentage);
            })
            .then(function (val) {
              // 完成
              console.log('File MD5 Result:', val);
              file.md5 = val;
              file.uid = WebUploader.Base.guid();
              //获取文件信息后进入下一步
              deferred.resolve();
            });
          return deferred.promise();
        },
        beforeSend: function (block) {
          //获取已经上传过的下标
          var indexchunk = block.file.indexcode;
          var deferred = WebUploader.Deferred();
          if (indexchunk > 0) {
            if (block.chunk > indexchunk) {
              //分块不存在，重新发送该分块内容
              deferred.resolve();
            } else {
              //分块存在，跳过
              deferred.reject();
            }
          } else {
            //分块不存在，重新发送该分块内容
            deferred.resolve();
          }
          //返回Deferred的Promise对象。
          return deferred.promise();
        },
        afterSendFile: function (file) {
          //如果所有分块上传成功，则通知后台合并分块
        },
      },
    );
    uploader = WebUploader.create({
      // swf文件路径
      swf: '/resource/Uploader.swf',
      // 文件接收服务端。
      server: '/upgrade/upgrade/upload/file',
      chunked: true,
      chunkSize: 1024 * 1024 * 2,
      threads: 3,
      accept: {
        title: 'zip',
        extensions: 'zip',
      },
      // 选择文件的按钮。可选。
      // 内部根据当前运行是创建，可能是input元素，也可能是flash.
      dnd: '#upload-picker',
      pick: '#upload-picker',
      // 不压缩image, 默认如果是jpeg，文件上传前会压缩一把再上传！
      resize: false,
      disableGlobalDnd: true,
      //是否开启自动上传
      auto: false,
    });
    uploader.on('fileQueued', function (file) {});
    uploader.on('beforeFileQueued', async function (file) {
      uploader.reset();
      if (file.size > 2 * 1024 * 1024 * 1024) {
        createMessage.error('上传2G以内的文件');
        return;
      }
      fileId = file.id;
      try {
        await checkFile({ fileSize: file.size, fileName: encodeURIComponent(file.name) });
        fileName.value = file.name;
        // 文件上传
        uploader.upload();
      } catch (error: any) {
        if (error.message == 'INSUFFICIENT_DISK_SPACE_ERROR') {
          uploader.reset();
          createMessage.error('上传失败,磁盘空间不足');
        } else if (error.message == 'SYSTEM_FILE_TYPE_ERROR') {
          uploader.reset();
          fileId = null;
          createMessage.error('请选择正确的文件名格式');
        } else if (error.message == 'FILE_NAME_FORMAT_CHECK_FAIL') {
          uploader.reset();
          createMessage.error('请选择正确的文件名格式');
        }
      }
    });
    uploader.on(
      'uploadBeforeSend',
      function (block, data) {
        data.uuid = undefined;
        data.type = undefined;
        data.lastModifiedDate = undefined;
        data.size = undefined;
        data.uid = undefined;
        data.id = undefined;
      },
      2,
    );
    //当某个文件的分块在发送前触发，主要用来询问是否要添加附带参数，大文件在开起分片上传的前提下此事件可能会触发多次。
    uploader.onUploadBeforeSend = function (obj, data) {
      var file = obj.file;
      data.md5 = file.md5 || '';
      data.uid = file.uid;
    };
    uploader.options.formData.uid = 1;
    uploader.on(
      'uploadBeforeSend',
      function (block, data) {
        uploader.options.formData.uid = 1;
      },
      2,
    );
    // 上传中
    uploader.on('uploadProgress', function (file, percentage) {
      const a = Number((percentage * 100).toFixed(0));
      if (a == 100) {
        progress.value = 99;
      } else {
        progress.value = a;
      }
    });
    // 上传返回结果
    uploader.on('uploadSuccess', function (file) {});
    uploader.on('uploadError', function (file) {});
    uploader.on('uploadComplete', async function (file) {
      try {
        await mergeFile({ name: file.name, md5: file.md5 });
        showUpgradeBtn.value = true;
      } catch (error) {
        timer = setInterval(async () => {
          const result = await checkMergeFile({ name: file.name });
          if (result) {
            showUpgradeBtn.value = true;
            clearInterval(timer);
          }
        }, 3000);
      }
    });
  }

  // 获取系统信息
  getSystemInfo();
  async function getSystemInfo() {
    const result = await getInfo();
    fileName.value = result.localPackageName;
    softVersion.value = result.softVersion;
    if (
      fileName.value ||
      (result.existAndSupportLocalUpgrade && result.existAndSupportRemoteUpgrade)
    ) {
      showUpgradeBtn.value = true;
    }
  }

  async function stopFile() {
    if (fileId) {
      uploader.cancelFile(fileId);
    } else {
      await delFile();
    }
    initConfig();
    fileName.value = '';
    fileId = null;
  }

  function initConfig() {
    progress.value = 0;
    showUpgradeBtn.value = false;
    if (timer) clearInterval(timer);
  }

  async function handleStartUpgrade() {
    try {
      await startUpgrade();
    } catch (error: any) {
      if (['FOTA_UPGRADE_PACKAGE_ERROR', 'UPGRADE_PACKAGE_ERROR'].includes(error.message)) {
        createMessage.error('升级包错误');
      } else if (error.message === 'UPGRADE_PROCESS_CONFLICTS') {
        createMessage.error('正在升级请勿重复升级');
      } else if (error.message === 'INSUFFICIENT_DISK_SPACE_ERROR') {
        createMessage.error('上传失败，磁盘空间不足');
      } else if (error.message === 'SYSTEM_UPGRADE_PACKAGE_TYPE_UNKNOWN') {
        createMessage.error('系统升级包类型未知');
      } else {
        createMessage.error('升级失败');
      }
    }
  }

  onMounted(() => {
    initWebUploader();
  });
  onUnmounted(() => {
    if (timer) clearInterval(timer);
  });
</script>
<style lang="less" scoped>
  #upload-picker {
    text-align: center;
    width: 500px;
    height: 260px;
    border: 3px dashed #e6e6e6;
    position: relative;
    z-index: 10;
  }
  .pickText {
    cursor: pointer;
    position: absolute;
    text-align: center;
    top: 50px;
    left: 110px;
  }
</style>
<style>
  .webuploader-pick {
    height: 250px;
    line-height: 250px;
    cursor: pointer;
    width: 100%;
    background: transparent;
  }
</style>
