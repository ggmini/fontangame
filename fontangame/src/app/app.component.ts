import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, MatButtonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  public title = 'fontangame';

  public GoToMqttViewer() {
    window.location.href = '/mqtt-viewer';
  }

  public GoToGame() {
    window.location.href = '/game';
  }

  public GoToDataViewer() {
    window.location.href = '/data-viewer';
  }
}
