import { Injectable, Output, EventEmitter, inject } from '@angular/core';
import { MqttService } from 'ngx-mqtt';

/**
 * Service to handle MQTT connections and data subscriptions
 * Emits events for connection status and incoming data
 */
@Injectable({
  providedIn: 'root'
})
export class MqttClientService {

  // #region Events
  @Output() public PipoDidConnect = new EventEmitter<void>();
  @Output() public PipoDidDisconnect = new EventEmitter<void>();
  @Output() public BpmSubscription = new EventEmitter<number>();
  @Output() public Spo2Subscription = new EventEmitter<number>();
  // #endregion

  private client = inject(MqttService);

  // #region Connection States
  private mqttConnected = false;
  public get MqttConnected(): boolean {
    return this.mqttConnected;
  }
  private pipoConnected = false;
  public get PipoConnected(): boolean {
    return this.pipoConnected;
  }
  // #endregion

  constructor() {
    console.log('MqttClientService initialized');
  }

  /** Connects to the MQTT broker and sets up Pipo subscription */
  public Connect() {
    console.log("mqtt.connect attempt");
    try {
      this.client.connect();
      this.client.onConnect.subscribe(() => {
        this.mqttConnected = true;
        console.log('mqtt.connect success');
        this.client.unsafePublish('fontangame/fontangame', 'connected', { qos: 0, retain: false });
      });
    } catch (error) {
      console.error('mqtt.connect error:', error);
    }
    this.subscribeToPipo();
  }

  /** Disconnects from the MQTT broker */
  public Disconnect() {
    try {
      this.client.disconnect();
      this.mqttConnected = false;
      this.pipoConnected = false; //if we disconnect from the broker, we are disconnected from the pico
      console.log('mqtt.disconnect success');
    } catch (error) {
      console.error('mqtt.disconnect error:', error);
    }
  }

  /** Subscribes to the Pipo connection status topic and handles incoming messages */
  private subscribeToPipo() {
    this.client.observe('fontangame/pipo2').subscribe((message) => {
      console.log('Received message:', message.payload.toString());
      if(message.payload.toString() === 'connected'){
        this.pipoConnected = true;
        this.PipoDidConnect.emit();
      } else if(message.payload.toString() === 'disconnected') {
        this.pipoConnected = false;
        this.PipoDidDisconnect.emit();
        console.log('Emitting pipoDidDisconnect event');
      }
    });
  }

  /** Subscribes to the BPM and SpO2 data topics and emits received values */
  public SubscribeToData() {
    this.client.observe('fontangame/bpm').subscribe((message) => {
      this.BpmSubscription.emit(parseFloat(message.payload.toString()));
    });
    this.client.observe('fontangame/spo2').subscribe((message) => {
      this.Spo2Subscription.emit(parseFloat(message.payload.toString()));
    });
  }
  

  /**
   * Sends a ping message to the connected Pico device to check its status
   * This will prompt the Pico to respond with its current state (provided it is connected to the MQTT broker)
   */
  public PingPico() {
    this.client.unsafePublish('fontangame/pipo2', 'state', { qos: 0, retain: false });
  }
}