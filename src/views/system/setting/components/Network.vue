<template>
  <div>
    <Form ref="formRef" :model="formModel">
      <FormItem name="dhcp4" label="IP获取方式" :rules="[{ required: true, message: '请选择' }]">
        <RadioGroup v-model:value="formModel.dhcp4">
          <Radio :value="'true'">DHCP</Radio>
          <Radio :value="'false'">静态配置</Radio>
        </RadioGroup>
      </FormItem>
      <div class="p-8px bg-gray-100 font-blod mb-15px">IP地址信息</div>
      <div class="flex items-center" v-for="(item, index) in formModel.addresses" :key="index">
        <FormItem
          :name="['addresses', index, 'ipAddress']"
          label="IP地址"
          :rules="[
            { required: true, message: '请输入' },
            { pattern: IPREGEX, message: '请输入正确的IP地址' },
          ]"
        >
          <Input :disabled="formModel.dhcp4 === 'true'" v-model:value="item.ipAddress" />
        </FormItem>
        <FormItem
          :name="['addresses', index, 'subnetMask']"
          class="ml-10px"
          label="子网掩码"
          :rules="[
            { required: true, message: '请输入' },
            { pattern: SUBMASKREGEX, message: '请输入正确的子网掩码' },
          ]"
        >
          <Input :disabled="formModel.dhcp4 === 'true'" v-model:value="item.subnetMask" />
        </FormItem>
        <PlusCircleFilled
          @click="addIp"
          class="cursor-pointer ml-10px text-size-20px relative bottom-13px"
          v-show="!index"
        />
        <MinusCircleFilled
          @click="delIp(index)"
          class="cursor-pointer ml-10px text-size-20px relative bottom-13px"
          v-show="index"
        />
      </div>
      <div class="p-8px bg-gray-100 font-blod mb-15px">网关信息</div>
      <FormItem
        name="gateway"
        label="网关地址"
        :rules="[{ pattern: IPREGEX, message: '请输入正确的网关信息' }]"
      >
        <Input
          :disabled="formModel.dhcp4 === 'true'"
          class="w-183px"
          v-model:value="formModel.gateway"
        />
      </FormItem>
      <div class="p-8px bg-gray-100 font-blod mb-15px">DNS信息</div>
      <div class="flex items-center" v-for="(item, index) in formModel.dns" :key="index">
        <FormItem
          label="DNS"
          :rules="[{ pattern: IPREGEX, message: '请输入正确的DNS信息' }]"
          :name="['dns', index, 'value']"
        >
          <Input :disabled="formModel.dhcp4 === 'true'" v-model:value="item.value" />
        </FormItem>
        <PlusCircleFilled
          @click="addDns"
          class="cursor-pointer ml-10px text-size-20px relative bottom-13px"
          v-show="!index"
        />
        <MinusCircleFilled
          @click="delDns(index)"
          class="cursor-pointer ml-10px text-size-20px relative bottom-13px"
          v-show="index"
        />
      </div>
    </Form>
    <div>
      <Button type="primary" @click="handleOk">保存</Button>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { ref, reactive, onMounted } from 'vue';
  // components
  import { Form, FormItem, Input, RadioGroup, Radio, Button, FormInstance } from 'ant-design-vue';
  import { PlusCircleFilled, MinusCircleFilled } from '@ant-design/icons-vue';
  // utils
  import { IPREGEX, SUBMASKREGEX } from '/@/constant';
  // services
  import { getNetwork, setNetwork } from '/@/api/system';
  import { useMessage } from '/@/hooks/web/useMessage';

  const props = defineProps({
    type: {
      type: String,
      defalut: 'lan1',
    },
  });
  const formRef = ref<FormInstance>();
  const formModel = reactive<any>({
    type: undefined,
    dhcp4: undefined,
    addresses: [{ ipAddress: '', subnetMask: '' }],
    gateway: '',
    dns: [{ value: '' }],
  });
  const { createMessage } = useMessage();

  async function handleOk() {
    if (formModel.dhcp4 === 'true') {
      await setNetwork({ dhcp4: 'true', type: props.type });
      return createMessage.success('保存成功');
    }
    const values: any = await formRef.value?.validate();
    values.dns = values.dns
      .filter((item) => {
        return item.value.trim();
      })
      .map((a) => {
        return a.value;
      });
    await setNetwork({ ...values, type: formModel.type });
    createMessage.success('保存成功,请去设备端查看设置结果');
  }

  function addIp() {
    if (formModel.dhcp4 === 'true') return;
    formModel.addresses.push({ ipAddress: '', subnetMask: '' });
  }

  function delIp(index) {
    if (formModel.dhcp4 === 'true') return;
    formModel.addresses.splice(index, 1);
  }

  function addDns() {
    if (formModel.dhcp4 === 'true') return;
    formModel.dns.push({ value: '' });
  }

  function delDns(index) {
    if (formModel.dhcp4 === 'true') return;
    formModel.dns.splice(index, 1);
  }

  async function handleGetNetwork() {
    const result = await getNetwork(props.type);
    formModel.addresses = result.addresses;
    formModel.dns = result.dns.map((item: any) => {
      return { value: item };
    });
    formModel.dhcp4 = result.dhcp4;
    formModel.gateway = result.gateway;
    formModel.type = result.type;
  }

  onMounted(() => {
    handleGetNetwork();
  });
</script>
<style lang="less" scoped></style>
