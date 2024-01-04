import { Directive, ElementRef, EventEmitter, HostListener, Output } from '@angular/core';

type TouchRecord = {
  event: TouchEvent;
  time: number;
}

@Directive({
  selector: '[touchable]'
})
export class TouchDirective {

  settings = {
    waitForDblTap: 500,
  };

  @Output() onDblTap = new EventEmitter<TouchEvent>();
  @Output() onSingleTap = new EventEmitter<TouchEvent>();

  private intervals = {
    lastTouch: null
  };

  private lastTouchRecord: TouchRecord | undefined;

  constructor(private host: ElementRef) { }

  @HostListener('touchstart', ['$event'])
  onTouchStart(event: TouchEvent) {
    const currentTime = Date.now();
    if (this.lastTouchRecord) {
      const deltaTime = currentTime - this.lastTouchRecord.time;
      if (deltaTime <= this.settings.waitForDblTap) {
        this.onDblTap.emit(event);
      } else {
        this.lastTouchRecord = { event, time: currentTime };
      }
    } else {
      this.lastTouchRecord = { event, time: currentTime };
    }
  }

}
