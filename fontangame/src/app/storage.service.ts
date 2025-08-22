import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  
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
