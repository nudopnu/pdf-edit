import { Directive, EventEmitter, HostListener, Output } from '@angular/core';

@Directive({
  selector: '[pdfSubmitOnEnter]'
})
export class SubmitOnEnterDirective {

  @Output() submit = new EventEmitter();

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.submit.emit();
    }
  }


}
