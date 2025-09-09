import { Component, inject } from '@angular/core';
import { StorageService } from '../storage.service';
import { GameData } from '../data/gameData';

import { Chart } from 'chart.js/auto';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';

import { timer } from 'rxjs';
import { MatFormFieldModule } from "@angular/material/form-field";

@Component({
  selector: 'app-data-viewer',
  standalone: true,
  imports: [MatButtonModule, MatExpansionModule, MatFormFieldModule],
  templateUrl: './data-viewer.component.html',
  styleUrl: './data-viewer.component.scss'
})
export class DataViewerComponent {

  storage: StorageService = inject(StorageService);

  gameDataList: GameData[] = [];

  selectedData: GameData | null = null;

  Math = Math;

  charts: Chart[] = [];

  constructor() {
    this.PopulateTable();
  }

  PopulateTable() {
    const dataNames = this.storage.GetAllItemNames();

    this.gameDataList = dataNames.map(name => {
      const json = this.storage.ReadItem(name);
      return json ? GameData.CreateFromJson(json) : null;
    }).filter((data): data is GameData => data !== null);

    timer(10).subscribe(() => this.ConstructCharts());
  }

  ConstructCharts(){
    this.destroyCharts();
    //Construct the Charts
    for(let i = 0; i < this.gameDataList.length; i++) {
      const data = this.gameDataList[i];
      const bpmCtx = document.getElementById(`bpmChart${i}`) as HTMLCanvasElement;
      const spo2Ctx = document.getElementById(`spo2Chart${i}`) as HTMLCanvasElement;
      const bpmTimeLabels = data.BpmList.GetAll().map(unit => unit?.TimeString || ""); // Fallback in case of missing data
      this.charts.push(new Chart(bpmCtx, {
        type: 'line',
        data: {
          labels: bpmTimeLabels,
          datasets: [{
            label: 'BPM',
            data: data.BpmList.GetAll().map(unit => unit.Bpm) || [],
            borderWidth: 1,
            borderColor: '#dd1919ff',
            backgroundColor: 'rgba(219, 15, 8, 0.2)',
          }]
        }
      }));

      const spo2TimeLabels = data.Spo2List.GetAll().map(unit => unit?.TimeString || ""); // Fallback in case of missing data
      this.charts.push(new Chart(spo2Ctx, {
        type: 'line',
        data: {
          labels: spo2TimeLabels,
          datasets: [{
            label: 'SpO2',
            data: data.Spo2List.GetAll().map(unit => unit.Spo2) || [],
            borderWidth: 1
          }]
        }
      }));
    }
  }

  destroyCharts() {
    this.charts.forEach(chart => chart.destroy());
    this.charts = [];
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
    const json = data.Serialize();
    this.storage.SaveItem(data.FileName, json);
    this.PopulateTable();
  }

  exportData(data: GameData) {
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

  importData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.style.display = 'none';
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
      // Reset input value so the same file can be selected again
      input.value = '';
      document.body.removeChild(input);
    };

    input.click();
  }

}