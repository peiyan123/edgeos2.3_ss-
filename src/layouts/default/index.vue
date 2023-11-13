<template>
  <Layout :class="prefixCls" v-bind="lockEvents">
    <LayoutFeatures />
    <LayoutHeader fixed v-if="getShowFullHeaderRef" />
    <Layout :class="[layoutClass]">
      <LayoutSideBar v-if="getShowSidebar || getIsMobile" />
      <Layout :class="`${prefixCls}-main`">
        <LayoutMultipleHeader />
        <LayoutContent />
        <LayoutFooter />
      </Layout>
    </Layout>
    <ProgressModel @register="register" :percent="upgradeProgress" />
  </Layout>
</template>

<script lang="ts">
  import { defineComponent, computed, unref, ref } from 'vue';
  import { Layout } from 'ant-design-vue';
  import { createAsyncComponent } from '/@/utils/factory/createAsyncComponent';

  import LayoutHeader from './header/index.vue';
  import LayoutContent from './content/index.vue';
  import LayoutSideBar from './sider/index.vue';
  import LayoutMultipleHeader from './header/MultipleHeader.vue';
  import ProgressModel from './components/ProgressModel.vue';

  import { useHeaderSetting } from '/@/hooks/setting/useHeaderSetting';
  import { useMenuSetting } from '/@/hooks/setting/useMenuSetting';
  import { useDesign } from '/@/hooks/web/useDesign';
  import { useLockPage } from '/@/hooks/web/useLockPage';

  import { useAppInject } from '/@/hooks/web/useAppInject';
  import { useWebSocket } from '@vueuse/core';
  import { useModal } from '/@/components/Modal';
  import { wsHostName } from '/@/constant';

  export default defineComponent({
    name: 'DefaultLayout',
    components: {
      LayoutFeatures: createAsyncComponent(() => import('/@/layouts/default/feature/index.vue')),
      LayoutFooter: createAsyncComponent(() => import('/@/layouts/default/footer/index.vue')),
      LayoutHeader,
      LayoutContent,
      LayoutSideBar,
      LayoutMultipleHeader,
      Layout,
      ProgressModel,
    },
    setup() {
      const [register, { openModal }] = useModal();
      const { prefixCls } = useDesign('default-layout');
      const { getIsMobile } = useAppInject();
      const { getShowFullHeaderRef } = useHeaderSetting();
      const { getShowSidebar, getIsMixSidebar, getShowMenu } = useMenuSetting();

      // Create a lock screen monitor
      const lockEvents = useLockPage();

      const layoutClass = computed(() => {
        let cls: string[] = ['ant-layout'];
        if (unref(getIsMixSidebar) || unref(getShowMenu)) {
          cls.push('ant-layout-has-sider');
        }
        return cls;
      });

      // websocket
      function guid2() {
        function S4() {
          return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
        }
        return S4() + S4() + '-' + S4() + '-' + S4() + '-' + S4() + '-' + S4() + S4() + S4();
      }
      const upgradeProgress = ref(0);
      const { close, send, open } = useWebSocket(
        `${
          location.protocol.includes('s') ? 'wss' : 'ws'
        }://${wsHostName}/upgrade/detect/upgrade/process/${guid2()}`,
        {
          autoReconnect: {
            retries: 3,
            delay: 1000,
            onFailed() {
              // alert('Failed to connect WebSocket after 3 retries');
            },
          },
          immediate: true,
          onMessage: (_: WebSocket, event: MessageEvent) => {
            const message = JSON.parse(event.data);
            upgradeProgress.value = message;
            if (message > 0) {
              openModal();
            }
            // 测试代码
            // setTimeout(() => {
            //   upgradeProgress.value = 100;
            // }, 2000);
          },
        },
      );

      return {
        getShowFullHeaderRef,
        getShowSidebar,
        prefixCls,
        getIsMobile,
        getIsMixSidebar,
        layoutClass,
        lockEvents,
        upgradeProgress,
        register,
      };
    },
  });
</script>
<style lang="less">
  @prefix-cls: ~'@{namespace}-default-layout';

  .@{prefix-cls} {
    display: flex;
    width: 100%;
    min-height: 100%;
    background-color: @content-bg;
    flex-direction: column;

    > .ant-layout {
      min-height: 100%;
    }

    &-main {
      width: 100%;
      margin-left: 1px;
    }
  }
</style>
