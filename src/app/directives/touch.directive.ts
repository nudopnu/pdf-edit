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
    waitForLongPress: 300,
  };

  @Output() onDblTap = new EventEmitter<TouchEvent>();
  @Output() onSingleTap = new EventEmitter<TouchEvent>();
  @Output() onLongTap = new EventEmitter<TouchEvent>();

  private intervals = {
    lastTouch: undefined as any,
  };

  private lastTouchRecord: TouchRecord | undefined;
  private isHolding = false;

  constructor(private host: ElementRef) { }

  @HostListener('touchstart', ['$event'])
  onTouchStart(event: TouchEvent) {
    const currentTime = Date.now();
    this.isHolding = true;
    const startTouchEvent = event.touches;
    this.intervals.lastTouch = setTimeout(() => {
      if (this.isHolding && this.lastTouchRecord) {
        this.onLongTap.emit(event);
      }
    }, this.settings.waitForLongPress);
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

  @HostListener('touchend', ['$event'])
  onTouchEnd(event: TouchEvent) {
    this.isHolding = false;
  }

  @HostListener('touchmove', ['$event'])
  onTouchMove(event: TouchEvent) {
    this.isHolding = false;
  }

}
