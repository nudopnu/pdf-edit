import { Component, ElementRef, EventEmitter, HostListener, Input, Output, ViewChild } from '@angular/core';
import { ALLOWED_FILE_TYPES } from '../../utils/file-utils';

@Component({
  selector: 'pdf-slot',
  templateUrl: './slot.component.html',
  styleUrl: './slot.component.scss'
})
export class SlotComponent {

  @Output()
  onFilesReceived = new EventEmitter<File[]>;

  @ViewChild('input')
  inputElementRef!: ElementRef;

  fileTypes = ALLOWED_FILE_TYPES;

  onFileInputChange(inputElement: HTMLInputElement) {
    if (inputElement.files) {
      this.onFilesReceived.emit(Array.from(inputElement.files))
    }
  }

  onClick() {
    this.inputElementRef.nativeElement.value = null;
  }

  @HostListener('window:keydown', ['$event'])
  onOpenFileDialog(event: KeyboardEvent) {
    if (event.key === 'o') {
      this.inputElementRef.nativeElement.click();
    }
  }
}
