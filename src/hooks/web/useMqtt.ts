import { IClientOptions, IPublishPacket, MqttClient } from 'mqtt';
import * as mqtt from 'mqtt/dist/mqtt.min';
import { ref } from 'vue';

type MessageEvent = {
  topic: string;
  payload: Buffer;
  packet: IPublishPacket;
};
export interface AClientOptions extends IClientOptions {
  onConnected?: (ws: MqttClient) => void;
  onDisconnected?: (ws: MqttClient, event: CloseEvent) => void;
  onError?: (ws: MqttClient, error: Error) => void;
  onMessage?: (ws: MqttClient, event: MessageEvent) => void;
  onClose?: (ws: MqttClient) => void;
  onReconnect?: (ws: MqttClient) => void;
}

export function useMqtt(host: string, options: AClientOptions) {
  const mqttClient = ref();

  mqttClient.value = mqtt.connect(host, options);

  mqttClient.value.on('error', (err) => {
    console.log('Mqtt Connection error: ', err);
    options.onError?.(mqttClient.value, err);
    mqttClient.value.end();
  });

  mqttClient.value.on('reconnect', () => {
    console.log('Mqtt Reconnecting...');
    options.onReconnect?.(mqttClient.value);
  });

  mqttClient.value.on('connect', () => {
    options.onConnected?.(mqttClient.value);
  });

  mqttClient.value.on('message', (topic, payload, packet) => {
    options.onMessage?.(mqttClient.value, { topic, payload, packet });
  });

  mqttClient.value.on('close', () => {
    options.onClose?.(mqttClient.value);
  });
  return {
    mqttClient: mqttClient.value,
  };
}
