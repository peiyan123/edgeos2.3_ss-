<template>
  <div class="w-5/12 m-auto mt-50px">
    <BasicForm @register="registerForm">
      <template #ntpServer="{ model, field }">
        <Input
          v-model:value="model[field]"
          placeholder="请输入"
          @blur="handleNtpServer"
          @press-enter="handleNtpServer"
        />
      </template>
      <template #autoNtp="{ model, field }">
        <Switch v-model:checked="model[field]" @change="handleAutoNtp" :loading="loading" />
      </template>
      <template #autoAlg="{ model, field }">
        <Switch v-model:checked="model[field]" @change="handleautoAlg" :loading="loading" />
      </template>
      <template #dateTime="{ model, field }">
        <DatePicker
          class="w-full"
          v-model:value="model[field]"
          placeholder="请选择"
          :showTime="true"
          @change="handleDateStr"
          :disabled="dateDisabled"
        />
      </template>

      <template #nowTimeZone="{ model, field }">
        <Select
          v-model:value="model[field]"
          :options="zoneList"
          placeholder="请选择"
          @change="handleNowTimeZone"
        />
      </template>
    </BasicForm>
  </div>
</template>
<script lang="ts" setup>
  import { ref, onMounted } from 'vue';
  // components
  import { useForm, BasicForm } from '/@/components/Form';
  import { Select, Input, Switch, DatePicker, TimePicker } from 'ant-design-vue';
  // config
  import { ntpFormSchema } from '../config';
  import { debounce } from 'lodash-es';
  // service
  import { getTimeInfo, setDate, setNtpServe, timeZone, toggleNew, toggleNtp } from '/@/api/system';
  import dayjs from 'dayjs';

  const zoneList = ref([]);
  const [registerForm, { setFieldsValue, getFieldsValue }] = useForm({
    schemas: ntpFormSchema,
    labelWidth: 80,
    showActionButtonGroup: false,
    baseColProps: { span: 24 },
    colon: true,
  });
  const dateDisabled = ref(false);
  const loading = ref(false);

  const handleNtpServer = debounce((e) => {
    if (!e.target.value) return;
    setNtpServe(e.target.value);
  }, 500);

  async function handleAutoNtp(e) {
    const autoAlg = getFieldsValue().autoAlg;
    if (e && autoAlg === e) {
      setFieldsValue({
        autoAlg: !e,
      });
    }
    setTimeout(async () => {
      loading.value = true;
      let params = {
        autoAlg: getFieldsValue().autoAlg,
        autoNtp: getFieldsValue().autoNtp,
      };
      await toggleNew(params);
      loading.value = false;
      getInfo();
    }, 200);
  }
  async function handleautoAlg(e) {
    const autoNtp = getFieldsValue().autoNtp;
    if (e && autoNtp === e) {
      setFieldsValue({
        autoNtp: !e,
      });
    }
    setTimeout(async () => {
      loading.value = true;
      let params = {
        autoAlg: getFieldsValue().autoAlg,
        autoNtp: getFieldsValue().autoNtp,
      };
      await toggleNew(params);
      loading.value = false;
      getInfo();
    }, 200);
  }

  function handleDateStr(e) {
    console.log(e);
    const dateTime = e.format('YYYY-MM-DD HH:mm:ss');
    setDate({ dateTime });
  }

  function handleTimeStr(e) {
    const hour = e.get('hour');
    const minute = e.get('minute');
    const second = e.get('second');
    const time = getFieldsValue().dateStr;
    const year = dayjs(time).get('year');
    const month = dayjs(time).get('month');
    const day = dayjs(time).get('day');
    setDate({ year, month, day, hour, minute, second });
  }

  async function handleNowTimeZone(e) {
    const index = zoneList.value.findIndex((item: any) => {
      return e == item.value;
    });
    await timeZone(index);
    getInfo();
  }

  async function getInfo() {
    const data = await getTimeInfo();
    setFieldsValue({
      ntpServer: data.ntpServer,
      autoNtp: data.autoNtp,
      dateTime: data.dateTime,
      nowTimeZone: data.nowTimeZone,
      autoAlg: data.autoAlg,
    });
    if (!data.autoNtp && !data.autoAlg) {
      dateDisabled.value = false;
    } else {
      dateDisabled.value = true;
    }
    zoneList.value = data.timeZoneList.map((item) => {
      return { value: item, label: item };
    });
  }

  onMounted(() => {
    getInfo();
  });
</script>
<style lang="less" scoped></style>
