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
  title = 'fontangame';

  mqtt() {
    window.location.href = '/mqtt-viewer';
  }

  game() {
    window.location.href = '/game-view';
  }

  data() {
    window.location.href = '/data-viewer';
  }
}
