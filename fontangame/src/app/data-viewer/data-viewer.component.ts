import { Component, inject } from '@angular/core';
import { StorageService } from '../storage.service';
import { GameData } from '../data/gameData';

import { Chart } from 'chart.js/auto';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';

import { timer } from 'rxjs';

@Component({
  selector: 'app-data-viewer',
  standalone: true,
  imports: [MatButtonModule, MatExpansionModule],
  templateUrl: './data-viewer.component.html',
  styleUrl: './data-viewer.component.scss'
})
export class DataViewerComponent {

  storage: StorageService = inject(StorageService);

  gameDataList: GameData[] = [];

  selectedData: GameData | null = null;

  Math = Math;

  PopulateTable() {
    const dataNames = this.storage.GetAllItemNames();

    this.gameDataList = dataNames.map(name => {
      const json = this.storage.ReadItem(name);
      return json ? GameData.CreateFromJson(json) : null;
    }).filter((data): data is GameData => data !== null);

    timer(10).subscribe(() => this.ConstructCharts());
  }

  ConstructCharts(){
    //Construct the Charts
    for(let i = 0; i < this.gameDataList.length; i++) {
      const data = this.gameDataList[i];
      const bpmCtx = document.getElementById(`bpmChart${i}`) as HTMLCanvasElement;
      const spo2Ctx = document.getElementById(`spo2Chart${i}`) as HTMLCanvasElement;

      new Chart(bpmCtx, {
        type: 'line',
        data: {
          labels: [1, 2, 3],
          datasets: [{
            label: 'BPM',
            data: data.BpmList.GetAll().map(unit => unit.Bpm) || [],
            borderWidth: 1
          }]
        }
      });

      new Chart(spo2Ctx, {
        type: 'line',
        data: {
          labels: [1, 2, 3],
          datasets: [{
            label: 'SpO2',
            data: data.Spo2List.GetAll().map(unit => unit.Spo2) || [],
            borderWidth: 1
          }]
        }
      });
    }
  }

  clearSaves() {
    if (confirm('Are you sure you want to clear all saved data? This action cannot be undone.')) {
      this.storage.ClearStorage();
      this.PopulateTable();
    }
  }

  // We need to pass the string, otherwise angular thinks selected data could be undefined
  deleteData(data: GameData) {
    if (confirm('Are you sure you want to delete this data? This action cannot be undone.')) {
      this.storage.DeleteItem(data.FileName);
      this.PopulateTable();
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