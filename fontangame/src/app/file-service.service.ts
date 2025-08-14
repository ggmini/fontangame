import { Injectable } from '@angular/core';
import { readFileSync, writeFileSync } from 'fs';

@Injectable({
  providedIn: 'root'
})
export class FileServiceService {

  public WriteFile(filePath: string, content: string): void {
    try {
      writeFileSync(filePath, content, 'utf8');
      console.log(`File written successfully to ${filePath}`);
    } catch (error) {
      console.error(`Error writing file to ${filePath}:`, error);
    }
  }

  public ReadFile(filePath: string): string {
    try {
      const content = readFileSync(filePath, 'utf8');
      console.log(`File read successfully from ${filePath}`);
      return content;
    } catch (error) {
      console.error(`Error reading file from ${filePath}:`, error);
      return '';
    }
  }

}
