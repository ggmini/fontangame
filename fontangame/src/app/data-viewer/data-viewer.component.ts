import { Component, inject } from '@angular/core';
import { StorageService } from '../storage.service';
import { GameData } from '../data/gameData';

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
  deleteData(DataName: string) {
    if (confirm('Are you sure you want to delete this data? This action cannot be undone.')) {
      this.storage.DeleteItem(DataName);
      this.PopulateTable();
      this.goBack();
    }
  }

}