import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  private localStorage: Storage | undefined;

  // eslint-disable-next-line @angular-eslint/prefer-inject
  constructor(@Inject(DOCUMENT) private document: Document) { 
    this.localStorage = this.document.defaultView?.localStorage;
  }

  public SaveItem(fileName: string, content: string) : void {
    this.localStorage?.setItem(fileName, content);
  }

  public ReadItem(fileName: string): string | null {
    return this.localStorage?.getItem(fileName) || null;
  }

  public GetAllItemNames(): string[] {
    return Object.keys(this.localStorage || {});
  }

  public DeleteItem(fileName: string): void {
    this.localStorage?.removeItem(fileName);
  }

  public ClearStorage(): void {
    this.localStorage?.clear();
  }
  
}
