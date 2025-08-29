import { Component } from '@angular/core';
import { inject } from '@angular/core';
import { MqttClientService } from '../mqtt-client.service';

/**
 * Component used to test MQTT Connectivity
 */
@Component({
  selector: 'app-mqtt-viewer',
  standalone: true,
  templateUrl: './mqtt-viewer.component.html',
  styleUrl: './mqtt-viewer.component.sass',
})
export class MqttViewerComponent {

  public mqttClientService = inject(MqttClientService);
  constructor () {
    console.log('MqttViewerComponent initialized')
  }

  connectButton() {
    this.mqttClientService.connect()
    this.refresh()
  }

  disconnectButton() {
    this.mqttClientService.disconnect()
    this.refresh()
  }

  pipoState = this.mqttClientService.PipoConnected ? 'connected' : 'disconnected';
  stateLabel = this.mqttClientService.MqttConnected ? 'connected' : 'disconnected';

  refresh () {
    this.stateLabel = this.mqttClientService.MqttConnected ? 'connected' : 'disconnected';
    this.pipoState = this.mqttClientService.PipoConnected ? 'connected' : 'disconnected';
  }
}
