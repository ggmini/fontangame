import { Component, inject } from '@angular/core';
import { StorageService } from '../storage.service';
import { GameData } from '../data/gameData';

import { Chart } from 'chart.js/auto';

export enum Screen {
  fileScreen = 'fileScreen',
  dataScreen = 'dataScreen'
}

@Component({
  selector: 'app-data-viewer',
  standalone: true,
  imports: [],
  templateUrl: './data-viewer.component.html',
  styleUrl: './data-viewer.component.sass'
})
export class DataViewerComponent {

  currentScreen: Screen = Screen.fileScreen;

  storage = inject(StorageService);

  gameDataList: GameData[] = [];

  selectedData: GameData | null = null;

  bpmChart: any = null;
  spo2Chart: any = null;

  Math = Math;

  //Can't be called from constructor (it still works but throws a reference error in the console ¯\_(ツ)_/¯)
  PopulateTable() {
    const dataNames = this.storage.GetAllItemNames();

    this.gameDataList = dataNames.map(name => {
      const json = this.storage.ReadItem(name);
      return json ? GameData.CreateFromJson(json) : null;
    }).filter((data): data is GameData => data !== null);
  }

  viewData(data: GameData) {
    this.selectedData = data;
    this.currentScreen = Screen.dataScreen;

    const bpmCtx = document.getElementById('bpmChart') as HTMLCanvasElement;
    this.bpmChart = new Chart(bpmCtx, {
      type: 'line',
      data: {
        labels: [1, 2, 3],
        datasets: [{
          label: 'BPM',
          data: this.selectedData?.BpmList.GetAll().map(unit => unit.Bpm) || [],
          borderWidth: 1
        }]
      }
    });

    const spo2Ctx = document.getElementById('spo2Chart') as HTMLCanvasElement;
    this.spo2Chart = new Chart(spo2Ctx, {
      type: 'line',
      data: {
        labels: [1, 2, 3],
        datasets: [{
          label: 'SpO2',
          data: this.selectedData?.Spo2List.GetAll().map(unit => unit.Spo2) || [],
          borderWidth: 1
        }]
      }
    });
  }

  clearSaves() {
    if (confirm('Are you sure you want to clear all saved data? This action cannot be undone.')) {
      this.storage.ClearStorage();
      this.PopulateTable();
    }
  }

  goBack() {
    this.currentScreen = Screen.fileScreen;
    this.selectedData = null;

    this.bpmChart?.destroy();
  }

  // We need to pass the string, otherwise angular thinks selected data could be undefined
  deleteData() {
    if (confirm('Are you sure you want to delete this data? This action cannot be undone.')) {
      if(this.selectedData != null) {
        this.storage.DeleteItem(this.selectedData?.FileName);
        this.PopulateTable();
        this.goBack();
      } else {
        console.error("Selected data is null");
      }
    }
  }


  createTestData() {
    const data = GameData.CreateTestData();
    const json = data.Serialize()
    console.log(json)
    this.storage.SaveItem(data.FileName, json);
    this.PopulateTable();
  }

}