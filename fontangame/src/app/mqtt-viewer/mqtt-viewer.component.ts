import { Component } from '@angular/core';
import { inject } from '@angular/core';
import { MqttClientService } from '../mqtt-client.service';

/**
 * Component used to test MQTT Connectivity; Not to be used for a final release
 */
@Component({
  selector: 'app-mqtt-viewer',
  standalone: true,
  templateUrl: './mqtt-viewer.component.html',
  styleUrl: './mqtt-viewer.component.sass',
})
export class MqttViewerComponent {

  public mqttClientService = inject(MqttClientService);
  
  public PipoState = this.mqttClientService.PipoConnected ? 'connected' : 'disconnected';
  public StateLabel = this.mqttClientService.MqttConnected ? 'connected' : 'disconnected';

  constructor () {
    console.log('MqttViewerComponent initialized');
  }

  /**
   * Connects to the MQTT broker and refreshes the state labels
   */
  public ConnectButton() {
    this.mqttClientService.Connect();
    this.Refresh();
  }

  /**
   * Disconnects from the MQTT broker and refreshes the state labels
   */
  public DisconnectButton() {
    this.mqttClientService.Disconnect();
    this.Refresh();
  }

  /**
   * Refreshes the connection state labels
   */
  public Refresh() {
    this.StateLabel = this.mqttClientService.MqttConnected ? 'connected' : 'disconnected';
    this.PipoState = this.mqttClientService.PipoConnected ? 'connected' : 'disconnected';
  }
}
