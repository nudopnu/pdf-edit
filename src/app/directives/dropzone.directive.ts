import { Directive, HostListener } from '@angular/core';

@Directive({
  selector: '[pdfDropzone]'
})
export class DropzoneDirective {

  constructor() { }

  @HostListener('drop')
  onDrop(event: MouseEvent) {
    console.log(event);
  }

  @HostListener('dragstart')
  onDragStart(event: MouseEvent) {
    console.log(event);
  }
}
