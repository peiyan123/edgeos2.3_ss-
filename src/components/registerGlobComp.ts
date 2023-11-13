import type { App } from 'vue';
import { Button } from './Button';
import { Input, Layout } from 'ant-design-vue';
import VXETable from 'vxe-table';

import Vue3ColorPicker from 'vue3-colorpicker';
import 'vue3-colorpicker/style.css';

export function registerGlobComp(app: App) {
  app.use(Input).use(Button).use(Layout).use(VXETable).use(Vue3ColorPicker);
}
