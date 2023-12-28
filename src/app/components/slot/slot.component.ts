import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'pdf-slot',
  templateUrl: './slot.component.html',
  styleUrl: './slot.component.scss'
})
export class SlotComponent {

  @Output()
  onFilesReceived = new EventEmitter<File[]>;

  onFileInputChange(inputElement: HTMLInputElement) {
    if (inputElement.files) {
      this.onFilesReceived.emit(Array.from(inputElement.files))
    }

  }
}
