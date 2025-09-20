import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';

/**
 * Service to handle localStorage operations
 */
@Injectable({
  providedIn: 'root'
})
export class StorageService {

  private localStorage: Storage | undefined;

  // eslint-disable-next-line @angular-eslint/prefer-inject
  constructor(@Inject(DOCUMENT) private document: Document) { 
    //We're using the document token to wrap access to localStorage, since otherwise we get an undefined error when calling storage functions from constructors (this has something to do with SSR)
    this.localStorage = this.document.defaultView?.localStorage;
  }

  /**
   * Save an item to localStorage
   * @param fileName The name of the file to save
   * @param content The content to save
   */
  public SaveItem(fileName: string, content: string) : void {
    this.localStorage?.setItem(fileName, content);
  }

  /**
   * Read an item from localStorage
   * @param fileName The name of the file to read
   * @returns The content of the file or null if not found
   */
  public ReadItem(fileName: string): string | null {
    return this.localStorage?.getItem(fileName) || null;
  }

  /**
   * Get a list of all item names in localStorage
   * @returns An array of item names
   */
  public GetAllItemNames(): string[] {
    return Object.keys(this.localStorage || {});
  }

  /**
   * Delete an item from localStorage
   * @param fileName The name of the file to delete
   */
  public DeleteItem(fileName: string): void {
    this.localStorage?.removeItem(fileName);
  }

  /**
   * Deletes all items from localStorage
   */
  public ClearStorage(): void {
    this.localStorage?.clear();
  }
  
}
