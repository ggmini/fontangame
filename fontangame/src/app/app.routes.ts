import { Routes } from '@angular/router';
import { MqttViewerComponent } from './mqtt-viewer/mqtt-viewer.component';
import { GameViewComponent } from './game-view/game-view.component';
import { DataViewerComponent } from './data-viewer/data-viewer.component';

export const routes: Routes = [
  { path: 'mqtt-viewer', component: MqttViewerComponent },
  { path: 'game', component: GameViewComponent },
  { path: 'data-viewer', component: DataViewerComponent }
];
