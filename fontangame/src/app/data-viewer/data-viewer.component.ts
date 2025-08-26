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

    const ctx = document.getElementById('myChart') as HTMLCanvasElement;

    new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
      datasets: [{
        label: '# of Votes',
        data: [12, 19, 3, 5, 2, 3],
        borderWidth: 1
      }]
    },
    options: {
      scales: {
        y: {
          beginAtZero: true
        }
      }
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

}