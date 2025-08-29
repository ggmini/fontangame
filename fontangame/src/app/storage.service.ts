import { Injectable, Output, EventEmitter } from '@angular/core';
import { timer } from 'rxjs/internal/observable/timer';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  @Output() serviceInit = new EventEmitter<void>();

  constructor() {
    timer(10).subscribe(() => this.serviceInit.emit());
  }

  public SaveItem(fileName: string, content: string) : void {
    localStorage.setItem(fileName, content);
  }

  public ReadItem(fileName: string): string | null {
    return localStorage.getItem(fileName);
  }

  public GetAllItemNames(): string[] {
    return Object.keys(localStorage);
  }

  public DeleteItem(fileName: string): void {
    localStorage.removeItem(fileName);
  }

  public ClearStorage(): void {
    localStorage.clear();
  }
  
}
