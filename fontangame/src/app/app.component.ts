import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.sass'
})
export class AppComponent {
  title = 'fontangame';

  mqtt() {
    window.location.href = '/mqtt-viewer';
  }

  game() {
    window.location.href = '/game-view';
  }
}
