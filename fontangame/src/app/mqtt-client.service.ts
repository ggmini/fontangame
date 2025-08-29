import { Injectable, Output, EventEmitter, inject } from '@angular/core';
import { MqttService } from 'ngx-mqtt';

@Injectable({
  providedIn: 'root'
})
export class MqttClientService {

  constructor() {
    console.log('MqttClientService initialized');
  }

  client = inject(MqttService);
  mqttConnected = false
  public get MqttConnected(): boolean {
    return this.mqttConnected;
  }
  pipoConnected = false;
  public get PipoConnected(): boolean {
    return this.pipoConnected;
  }

  connect() {
    console.log("mqtt.connect attempt")
    try {
      this.client.connect()
      this.client.onConnect.subscribe(() => {
        this.mqttConnected = true;
        console.log('mqtt.connect success');
        this.client.unsafePublish('fontangame/fontangame', 'connected', { qos: 0, retain: false });
      });
    } catch (error) {
      console.error('mqtt.connect error:', error)
    }
    this.subscribeToPipo();
  }

  subscribeToPipo() {
    this.client.observe('fontangame/pipo2').subscribe((message) => {
      console.log('Received message:', message.payload.toString());
      if(message.payload.toString() === 'connected'){
        this.pipoConnected = true;
        this.pipoDidConnect.emit();
      } else if(message.payload.toString() === 'disconnected') {
        this.pipoConnected = false;
        this.pipoDidDisconnect.emit();
        console.log('Emitting pipoDidDisconnect event');
      }
    });
  }

  subscribeToData() {
    this.client.observe('fontangame/bpm').subscribe((message) => {
      this.bpmSubscription.emit(parseFloat(message.payload.toString()));
    });
    this.client.observe('fontangame/spo2').subscribe((message) => {
      this.spo2Subscription.emit(parseFloat(message.payload.toString()));
    });
  }

  @Output() pipoDidConnect = new EventEmitter<void>();
  @Output() pipoDidDisconnect = new EventEmitter<void>();
  @Output() bpmSubscription = new EventEmitter<number>();
  @Output() spo2Subscription = new EventEmitter<number>();

  disconnect() {
    try {
      this.client.disconnect();
      this.mqttConnected = false;
      console.log('mqtt.disconnect success');
    } catch (error) {
      console.error('mqtt.disconnect error:', error);
    }
  }


}
