import { Component, inject } from '@angular/core';
import { StorageService } from '../storage.service';
import { GameData } from '../data/gameData';

import { Chart } from 'chart.js/auto';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';

import { timer } from 'rxjs';
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatProgressBar } from "@angular/material/progress-bar";

@Component({
  selector: 'app-data-viewer',
  standalone: true,
  imports: [MatButtonModule, MatExpansionModule, MatFormFieldModule, MatProgressBar],
  templateUrl: './data-viewer.component.html',
  styleUrl: './data-viewer.component.scss'
})
export class DataViewerComponent {

  private storage: StorageService = inject(StorageService);
  public  Math = Math;

  private gameDataList: GameData[] = [];
  /** List of all game data loaded from storage */
  public get GameDataList(): GameData[] {
    return this.gameDataList;
  }
  private charts: Chart[] = [];

  private weeklyProgress = 0;
  /** Number of sessions played in the current week */
  public get WeeklyProgress(): number {
    return this.weeklyProgress;
  }

  constructor() {
    this.PopulateTable();
  }

  /**
   * Populates the table with all game data that can be found in local storage
   */
  public PopulateTable() {
    const dataNames = this.storage.GetAllItemNames();
    
    this.gameDataList = dataNames.map(name => {
      const json = this.storage.ReadItem(name);
      return json ? GameData.CreateFromJson(json) : null;
    }).filter((data): data is GameData => data !== null);

    this.gameDataList.sort((a, b) => new Date(b.Date).getTime() - new Date(a.Date).getTime()); //Sort by most recent date first
    this.getWeeklyProgress();
    timer(10).subscribe(() => this.constructCharts()); //This is delayed to make sure the charts are constructed after the DOM is ready (the canvases should exist)
  }

  private getWeeklyProgress() {
    const now = new Date();
    const dayOfWeek = now.getDay() === 0 ? 7 : now.getDay(); // Treat Sunday as 7
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - (dayOfWeek - 1)); // Monday as start of week
    startOfWeek.setHours(0, 0, 0, 0);
    const recentData = this.gameDataList.filter(data => {
      const dataDate = new Date(data.Date);
      return dataDate >= startOfWeek && dataDate <= now;
    });
    this.weeklyProgress = recentData.length;
  }

  // #region Chart Construction

  /** Builds the BPM & SPO2 Charts */
  private constructCharts(){
    this.destroyCharts(); //Destroy existing charts to prevent Canvas already in use errors
    //Construct the Charts
    for(let i = 0; i < this.gameDataList.length; i++) {
      const data = this.gameDataList[i];
      const bpmCtx = document.getElementById(`bpmChart${i}`) as HTMLCanvasElement;
      const vitalsUnits = data.VitalsList.GetAll();
      const bpmData = vitalsUnits.map(unit => unit.Bpm) || [];
      const timeLabels = vitalsUnits.map(unit => unit?.TimeString || ""); // Fallback in case of missing data (if we don't get this beforehand the labels break, idk why, its exactly the same code/data)
      const bpmPointColor = vitalsUnits.map(unit => unit?.Paused ? '#550000ff' : '#dd1919ff'); // Dark Red if game was paused for that tick, regular red otherwise
      this.charts.push(new Chart(bpmCtx, {
        type: 'line',
        data: {
          labels: timeLabels,
          datasets: [{
            label: 'BPM',
            data: bpmData,
            borderWidth: 1,
            borderColor: '#dd1919ff',
            backgroundColor: '#db0f0833',
            pointBackgroundColor: bpmPointColor,
            pointBorderColor: bpmPointColor
          }]
        }
      }));
      
      //now for spo2
      const spo2Ctx = document.getElementById(`spo2Chart${i}`) as HTMLCanvasElement;
      const spo2Data = vitalsUnits.map(unit => unit.Spo2) || [];
      const spo2PointColor = vitalsUnits.map(unit => unit?.Paused ? '#000055ff' : '#089afcff'); // Dark Blue if game was paused for that tick, regular blue otherwise
      this.charts.push(new Chart(spo2Ctx, {
        type: 'line',
        data: {
          labels: timeLabels,
          datasets: [{
            label: 'SpO2',
            data: spo2Data,
            borderWidth: 1,
            borderColor: '#089afcff',
            backgroundColor: '#089afc81',
            pointBackgroundColor: spo2PointColor,
            pointBorderColor: spo2PointColor
          }]
        }
      }));
    }
  }

  /** Destroys all existing charts to prevent Canvas already in use errors */
  private destroyCharts() {
    this.charts.forEach(chart => chart.destroy());
    this.charts = [];
  }

  // #endregion

  // #region Data Deletion 

  /**
   * Clears all saved game data
   */
  public ClearSaves() {
    if (confirm('Are you sure you want to clear all saved data? This action cannot be undone.')) {
      this.storage.ClearStorage();
      this.PopulateTable();
    }
  }

  /**
   * Deletes a specific game data entry
   * @param data The game data to delete
   */
  public DeleteData(data: GameData) {
    if (confirm('Are you sure you want to delete this data? This action cannot be undone.')) {
      this.storage.DeleteItem(data.FileName);
      this.PopulateTable();
    }
  }

  // #endregion

  // #region Import/Export

  /**
   * Downloads the selected game data as a JSON file
   * @param data Data selected for export
   */
  public ExportData(data: GameData) {
    const blob = new Blob([data.Serialize()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${data.FileName}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }  

  /**
   * Opens a file dialog to import game data from a JSON file
   */
  public ImportData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json'; //gamedata is in json format
    input.style.display = 'none'; //prevents input element from being visible
    document.body.appendChild(input);

    input.onchange = (event: any) => {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          const json = e.target.result;
          const data = GameData.CreateFromJson(json);
          this.storage.SaveItem(data.FileName, json);
          this.PopulateTable();
        };
        reader.readAsText(file);
      }
      // Clean up the input element after use
      document.body.removeChild(input);
    };
    input.click();
  }

  // #endregion

  /**
   * Creates test data for the application; not for final use
   */
  public CreateTestData() {
    const data = GameData.CreateTestData();
    const json = data.Serialize();
    this.storage.SaveItem(data.FileName, json);
    this.PopulateTable();
  }

}