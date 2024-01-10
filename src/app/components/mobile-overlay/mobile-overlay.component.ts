import { ChangeDetectorRef, Component, ElementRef, EventEmitter, HostListener, Output, ViewChild } from '@angular/core';
import { EditorService } from '../../services/editor.service';

@Component({
  selector: 'pdf-mobile-overlay',
  templateUrl: './mobile-overlay.component.html',
  styleUrl: './mobile-overlay.component.scss'
})
export class MobileOverlayComponent {

  @ViewChild('content') contentElementRef!: ElementRef;
  @ViewChild('overlay') overlayElementRef!: ElementRef;

  overlay = false;
  listener: any;
  skipNextCheck = false;

  @Output() onMovePageUp = new EventEmitter();
  @Output() onMovePageDown = new EventEmitter();
  @Output() onSwapPage = new EventEmitter();
  @Output() onRotatePage = new EventEmitter();
  @Output() onDeletePage = new EventEmitter();

  constructor(
    private cdr: ChangeDetectorRef,
    private editorService: EditorService,
  ) { }

  onToggleOverlay(event?: TouchEvent) {
    console.log("to");

    const { top, bottom } = this.contentElementRef.nativeElement.getBoundingClientRect();
    if (top < 0 || bottom >= window.innerHeight) {
      this.contentElementRef.nativeElement.scrollIntoView({
        behavior: 'smooth'
      });
    }
    this.overlay = !this.overlay;
    this.cdr.detectChanges();
    event?.stopPropagation();
    this.listener = window.addEventListener('touchstart', (e) => {
      if (!this.overlayElementRef || !this.overlayElementRef.nativeElement.contains(e.target)) {
        this.overlay = false;
        window.removeEventListener('touchstart', this.listener);
      }
    });
  }

  onClick(event: MouseEvent | TouchEvent, emitter: EventEmitter<any>, ...params: any) {
    this.skipNextCheck = true;
    emitter.emit(...params);
  }

}
