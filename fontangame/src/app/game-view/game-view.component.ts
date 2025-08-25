import { Component, inject } from '@angular/core';
import { timer } from 'rxjs';

import { MqttClientService } from '../mqtt-client.service';
import { bpmList, bpmUnit } from '../data/bpmData';
import { spo2List, spo2Unit } from '../data/spo2Data';
import { StorageService } from '../storage.service';
import { GameData } from '../data/gameData';

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
  curBpm: number | null = null; // current bpm
  curspo2: number | null = null; // current spo2
  bpmStore: bpmList = new bpmList();
  spo2Store: spo2List = new spo2List();
  didWin = false;

  bonusTime = 0; // Bonus time for random events
  multiplier = 1; // Multiplier for score calculation
  bonusActive = false; // Flag to indicate if a bonus is active

  timeSinceLastNotNull = 0; //used to track lack of updates from pipo in order to warn if the device has come off

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
    this.timeRemaining = 10;
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
    this.MqttClientService.bpmSubscription.subscribe((bpm) => {
      if(bpm === -1) //were using -1 to describe no data
        this.curBpm = null;
      else this.curBpm = bpm;
    });
    this.MqttClientService.spo2Subscription.subscribe((spo2) => {
      if(spo2 === -1)
        this.curspo2 = null;
      else this.curspo2 = spo2;
    });
  }

  processData() {
    if(!this.gameStarted) return; //if the game isn't started... what are we doing here?
    if(!this.gamePaused) { //if the game isn't paused add to the score, also check to make sure the BPM isn't empty first
       if(this.curBpm != null) {
        this.timeSinceLastNotNull = 0; //reset the counter
        const pointsToAdd = this.curBpm - 100;
        if(pointsToAdd > 0) { //make sure we're not subtracting points
          this.score += (pointsToAdd * this.multiplier); //Example scoring logic, TODO deffo needs to be improved
        }
      } else {
        this.timeSinceLastNotNull++;
      }
    }
    this.bpmStore.Add(new bpmUnit(this.totalTime - this.timeRemaining, this.curBpm, this.gamePaused));
    this.spo2Store.Add(new spo2Unit(this.totalTime - this.timeRemaining, this.curspo2, this.gamePaused));
    
  }

  timerTick() {
    if (this.gameStarted && !this.gamePaused) {
      this.timeRemaining--;
      this.processData();
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
    const date = new Date();
    const data = GameData.CreateFromInput(
      this.bpmStore,
      this.spo2Store,
      this.didWin,
      this.score,
      this.totalTime - this.timeRemaining,
      date,
      this.targetScore,
      `gameData_${date.toISOString()}`
    );
    const storage = new StorageService();
    console.log(data.Serialize());
    storage.SaveItem(data.FileName, data.Serialize());
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
