import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButton } from "@angular/material/button";
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { timer } from 'rxjs';

import { MqttClientService } from '../mqtt-client.service';
import { StorageService } from '../storage.service';
import { VitalsList } from '../data/vitalsList';
import { VitalsUnit } from '../data/vitalsUnit';
import { GameData } from '../data/gameData';
import { Mission } from '../mission/mission';
import { NoPauseMission } from '../mission/noPauseMission';
import { ComboMission } from '../mission/comboMission';

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
  imports: [MatFormFieldModule, MatSelectModule, MatInputModule, FormsModule, MatButton, MatProgressBarModule],
  templateUrl: './game-view.component.html',
  styleUrl: './game-view.component.scss'
})
export class GameViewComponent {

  private currentScreen: Screen = Screen.Menu;
  public get CurrentScreen(): Screen {
    return this.currentScreen;
  }
  public readonly MqttClientService: MqttClientService;
  private storage: StorageService = inject(StorageService);
  public readonly Math = Math; //Making Math available in the html

  // #region Displayed Variables
  private score = 0;
  public get Score(): number {
    return this.score;
  }
  private newScore = 0; //Score achieved in the last second, used for visualising score changes
  public get NewScore(): number {
    return this.newScore;
  }
  private timeRemaining = 0;
  public get TimeRemaining(): number {
    return this.timeRemaining;
  }

  private stopwatch = 0; // Time elapsed since the start of the game
  public get Stopwatch(): number {
    return this.stopwatch;
  }

  private curBpm = 0; // current bpm
  public get CurBpm(): number {
    return this.curBpm;
  }

  private curspo2 = 0; // current spo2
  public get CurSpo2(): number {
    return this.curspo2;
  }

  private bonusTime = 0; // Remaining bonus time for random events
  public get BonusTime(): number {
    return this.bonusTime;
  }

  private multiplier = 1; // Multiplier for score calculation
  public get Multiplier(): number {
    return this.multiplier;
  }

  private timeSinceLastBonus = 0; // Time since the last bonus was activated
  public get TimeSinceLastBonus(): number {
    return this.timeSinceLastBonus;
  }
  // #endregion

  // #region Stored Variables
  public TargetHR = 120;
  private targetScore = 100;
  public get TargetScore(): number {
    return this.targetScore;
  }
  public TotalTime = 10;
  private vitalsStore: VitalsList = new VitalsList();
  public get VitalsStore(): VitalsList {
    return this.vitalsStore;
  }
  private didWin = false;
  public get DidWin(): boolean {
    return this.didWin;
  }
  // #endregion

  // #region Other Variables
  private gameRunning = false;
  public get GameRunning(): boolean {
    return this.gameRunning;
  }
  private gamePaused = false;
  public get GamePaused(): boolean {
    return this.gamePaused;
  }
  private wasPausedDuringLastTick = false; //we'll track this its possible to pause and unpause the game before the tick function is called again and the mission would not register the pause
  public get WasPausedDuringLastTick(): boolean {
    return this.wasPausedDuringLastTick;
  }
  private bonusActive = false; // Flag to indicate if a bonus is active
  private timeSinceLastUpdate = 0; //used to track lack of updates from pipo in order to warn if the device has come off
  public get TimeSinceLastUpdate(): number {
    return this.timeSinceLastUpdate;
  }

  // #endregion

  // #region Mission Variables
  private activeMissions: Mission[] = [];
  private comboMission: ComboMission | null = null;     //I would rather have a list of mission interfaces here, but I cannot figure out how to display mission specific data in the html
  private noPauseMission: NoPauseMission | null = null; //neatly (i.e. without a bunch of extra properties on the mission interface, which many implementations wouldn't need)
  public get ComboMission(): ComboMission | null {
    return this.comboMission;
  }
  public get NoPauseMission(): NoPauseMission | null {
    return this.noPauseMission;
  }
  // #endregion


  constructor() {
    this.MqttClientService = inject(MqttClientService);
  }

  /**
   * Subscribes to MQTT data streams; Call when starting the game
   */
  private subscribeToData() {
    this.MqttClientService.BpmSubscription.subscribe((bpm) => {
      this.curBpm = bpm;
      this.timeSinceLastUpdate = 0;
    });
    this.MqttClientService.Spo2Subscription.subscribe((spo2) => {
      this.curspo2 = spo2;
    });
  }

  /**
   * Calculates the target score based on selected Difficulty settings
   * @returns Calculated target score
   */
  public CalculateTargetScore(): number {
    return (this.TargetHR - 100) * this.TotalTime; //Simple target score calculation based on target HR and total time
  }

  /**
   * Creates a new game data object from the current input values and saves it to local storage
   */
  private saveResults() {
    const date = new Date();
    const data = GameData.CreateFromInput(
      this.vitalsStore,
      this.didWin,
      this.score,
      this.TotalTime - this.timeRemaining,
      date,
      this.TargetScore,
      `gameData_${date.toISOString()}`
    );
    console.log(data.Serialize());
    this.storage.SaveItem(data.FileName, data.Serialize());
  }

  // #region Game Logic

  /**
   * Timer tick function that updates the game state every second
   */
  private timerTick() {
    this.stopwatch++;
    this.processData();
    this.checkMissions();
    this.wasPausedDuringLastTick = this.gamePaused; //Update the pause tracking variable after checking missions
    if (!this.gamePaused) { //if the game is paused only vital data will be processed (without scoring but that is handled in processData)
      this.timeRemaining--;
      this.timeSinceLastUpdate++;
      if (!this.bonusActive) {
        this.checkForRandomEvent();
        this.timeSinceLastBonus++;
      }
      else {
        if (this.bonusTime == 0){ //If bonus time has expired reset the multiplier and flag
          this.bonusActive = false;
          this.multiplier = 1;
          this.timeSinceLastBonus = 0; //Reset the timer for last bonus
        } else this.bonusTime--;
      }
      if (this.timeRemaining === 0) {
        this.EndGame();
        return; //return will prevent the timer from being renewed
      }
    }
    timer(1000).subscribe(() => this.timerTick());
  }

  /**
   * Process current vitals data and saves it to the Stores, adds new points to score
   */
  private processData() {
    this.score += this.newScore; //Add the new score to the total score
    this.newScore = 0; //Reset new score
    if(!this.gamePaused) { //if the game isn't paused add to the score
       if(this.timeSinceLastUpdate < 3) {
        const pointsToAdd = this.curBpm - 100; //every beat over 100 is a point
        if(pointsToAdd > 0) { //make sure we're not subtracting points
          this.newScore = (pointsToAdd * this.multiplier);
        }
      }
    }
    if (this.timeSinceLastUpdate < 3) {
      this.vitalsStore.Add(new VitalsUnit(this.stopwatch, this.curBpm, this.curspo2, this.gamePaused));
    } else { //If no updates, add null values to the sore
      this.vitalsStore.Add(new VitalsUnit(this.stopwatch, null, null, this.gamePaused));
    }
  }

  /**
   * Checks for random events
   */
  private checkForRandomEvent() {
    if(this.timeSinceLastBonus < 30) return; //Make sure at least 30s have passed since the last bonus
    let chance = 0.1;
    const i = Math.floor(this.timeSinceLastBonus / 30);
    chance = chance * i; //Increase chance by 10% for every 30s since the last bonus
    if (chance > 0.5) chance = 0.5; //Cap chance at 50%
    if (Math.random() < chance)
      this.generateRandomEvent();
  }

  /**
   * Generates a random event that can affect the game state (currently 10s 2x multiplier as a placeholder)
   */
  private generateRandomEvent() {
    this.multiplier = 2;
    this.bonusTime = Math.floor(Math.random() * 60 + 30); //Random bonus time between 30s and 90s
    this.bonusActive = true;
  }

  // #endregion

  // #region Mission Management

  /**
   * Generates the Missions to be used in the current Game; The selection of missions should be randomized, but because we are storing the missions in their
   * individual variables, both missions are generated every time
   */
  private generateMissions() {
    this.comboMission = new ComboMission(120, 5, this);
    this.noPauseMission = new NoPauseMission(this);
    this.activeMissions.push(this.comboMission, this.noPauseMission);
  }

  /**
   * Checks all active missions for completion
   */
  private checkMissions() {
    this.activeMissions.forEach(mission => mission.checkCompletion());
  }

  /**
   * Removes a mission from the active missions list in order to save performance
   * @param mission Mission to be removed from the active missions list
   */
  public RemoveActiveMission(mission: Mission) {
    this.activeMissions = this.activeMissions.filter(m => m !== mission);
  }

  private checkMissionCompletion(mission: Mission) {
    if (mission.IsCompleted) {
      this.score += mission.Reward;
    }
  }

  // #endregion

  // #region Button Commands

  /**
   * Starts Connecting to MQTT and the Pipo
   */
  public StartConnecting() {
    this.currentScreen = Screen.Connecting;
    this.MqttClientService.Connect();
  }

  public PingPico() {
    this.MqttClientService.PingPico();
  }

  /**
   * Starts the game
   */
  public StartGame() {
    this.targetScore = this.CalculateTargetScore();
    this.generateMissions();
    this.gameRunning = true;
    this.gamePaused = false;
    this.MqttClientService.PipoDidDisconnect.subscribe(() => {
      console.log('Pipo disconnected, stopping game');
      this.gamePaused = true;
      this.currentScreen = Screen.Connecting;
    });
    this.MqttClientService.SubscribeToData();
    this.subscribeToData();
    this.timeRemaining = this.TotalTime;
    this.stopwatch = 0;
    this.timeSinceLastUpdate = 0;
    this.timeSinceLastBonus = 30; //Set to 30 so that a bonus can be generated right away
    this.currentScreen = Screen.Game;
    timer(1000).subscribe(() => this.timerTick());
  }

  /**
   * Pauses the game
   */
  public PauseGame() {
    this.currentScreen = Screen.Pause;
    this.gamePaused = true;
    this.wasPausedDuringLastTick = true;
  }

  /**
   * Resumes the game
   */
  public ResumeGame() {
    this.currentScreen = Screen.Game;
    this.gamePaused = false;
  }

  /**
   * Goes from the connecting Screen back to the Menu
   */
  public BackFromConnecting() {
    this.currentScreen = Screen.Menu;
  }

  /**
   * Move to the End Screen and check if the player achieved the target score
   */
  public EndGame() {
    this.currentScreen = Screen.GameOver;
    this.gameRunning = false;
    if (this.score >= this.targetScore)
      this.didWin = true;
  }

  /**
   * Returns to the main menu and saves the session data (to be used after game is finished)
   */
  public SaveAndReturnToMenu() {
    this.saveResults();
    window.location.reload(); //Reloading the window will send us back to the Menu Screen and will reset all the variables for us
  }

  public SaveAndQuitToMenu() {
    if (this.score >= this.targetScore)
      this.didWin = true;
    this.saveResults();
    window.location.reload();
  }

  /**
   * Returns to main menu without saving the data(to be used when quitting from pause menu)
   */
  public QuitToMenu() {
    window.location.reload();
  }

  // #endregion

}
