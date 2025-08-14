import { Component, inject } from '@angular/core';
import { timer } from 'rxjs';

import { MqttClientService } from '../mqtt-client.service';
import { bpmList, bpmUnit } from '../data/bpmData';
import { spo2List, spo2Unit } from '../data/spo2Data';

export enum Screen {
    Menu = 'menu',
    Game = 'game',
    Connecting = 'connecting',
    Pause = 'pause',
    GameOver = 'gameOver'
  }

@Component({
  selector: 'app-game-view',
  standalone: true,
  imports: [],
  templateUrl: './game-view.component.html',
  styleUrl: './game-view.component.sass'
})
export class GameViewComponent {

  currentScreen: Screen = Screen.Menu;
  MqttClientService: MqttClientService;

  score = 0;
  targetScore = 1000; // Example target score, can be adjusted
  totalTime = 0;
  timeRemaining = 0;
  gameStarted = false;
  gamePaused = false;
  curBpm = 0; // current bpm
  curspo2 = 0.0; // current spo2
  bpmStore: bpmList = new bpmList();
  spo2Store: spo2List = new spo2List();
  didWin = false;

  bonusTime = 0; // Bonus time for random events
  multiplier = 1; // Multiplier for score calculation
  bonusActive = false; // Flag to indicate if a bonus is active

  constructor() {
    this.MqttClientService = inject(MqttClientService)
  }

  StartConnecting() {
    this.currentScreen = Screen.Connecting;
    this.MqttClientService.connect();
  }

  StartGame() {
    this.currentScreen = Screen.Game;
    this.gameStarted = true;
    this.MqttClientService.pipoDidDisconnect.subscribe(() => {
      console.log('Pipo disconnected, stopping game');
      this.gamePaused = true;
      this.currentScreen = Screen.Connecting;
    });
    this.timeRemaining = 60;
    this.MqttClientService.subscribeToData();
    this.subscribeToData();
    timer(1000).subscribe(() => this.timerTick());
  }

  PauseGame() {
    this.currentScreen = Screen.Pause;
    this.gamePaused = true;
  }

  ResumeGame() {
    this.currentScreen = Screen.Game;
    this.gamePaused = false;
    timer(1000).subscribe(() => this.timerTick());
  }

  subscribeToData() {
    this.MqttClientService.bpmSubscription.subscribe((bpm) =>
      this.handleBpmUpdate(bpm)
    );
    this.MqttClientService.spo2Subscription.subscribe((spo2) => 
      this.handleSpo2Update(spo2)
    );
  }

  handleBpmUpdate(bpm: number) {
    this.curBpm = bpm;
    if (this.gameStarted && !this.gamePaused)
      this.score += (bpm * this.multiplier); //Example scoring logic, TODO deffo needs to be improved
    this.bpmStore.Add(new bpmUnit(this.totalTime - this.timeRemaining, bpm, this.gamePaused));
  }

  handleSpo2Update(spo2: number) {
    this.curspo2 = spo2;
    this.spo2Store.Add(new spo2Unit(this.totalTime - this.timeRemaining, spo2, this.gamePaused));
  }

  timerTick() {
    if (this.gameStarted && !this.gamePaused) {
      this.timeRemaining--;
      if (!this.bonusActive)
        this.checkForRandomEvent();
      else {
        if (this.bonusTime == 0){
          this.bonusActive = false;
          this.multiplier = 1;
        } else this.bonusTime--;
      }
      if (this.timeRemaining <= 0) {
        this.endGame();
        return;
      }
    timer(1000).subscribe(() => this.timerTick()); //If the game is paused the timer will not be renewed
    }
  }

  checkForRandomEvent() {
    if (Math.random() < 0.1) // 10% chance of a random event
      this.generateRandomEvent();
  }

  generateRandomEvent() {
    this.multiplier = 2;
    this.bonusTime = 10; // Example values for multiplier and bonus time
    this.bonusActive = true;
  }

  endGame() {
    this.currentScreen = Screen.GameOver;
    if (this.score >= this.targetScore)
      this.didWin = true;
  }

  ReturnToMenu() {
    this.SaveResults();
    this.QuitToMenu();
  }

  SaveResults() {
    // Save the results to a database or local storage
  }

  QuitToMenu() {
    this.currentScreen = Screen.Menu;
    this.gameStarted = false;
    this.score = 0;
    this.timeRemaining = 0;
    this.targetScore = 0;
    this.didWin = false;
  }
}
