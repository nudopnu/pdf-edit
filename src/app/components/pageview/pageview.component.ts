import { AfterViewInit, Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { PDFPageProxy } from 'pdfjs-dist';

@Component({
  selector: 'pdf-pageview',
  templateUrl: './pageview.component.html',
  styleUrl: './pageview.component.scss'
})
export class PageviewComponent implements AfterViewInit {

  @Input() scale = 1;
  @Input() page!: PDFPageProxy;
  @Output() onSelected = new EventEmitter<PageviewComponent>();
  @ViewChild('canvas', { read: ElementRef }) canvasRef!: ElementRef<HTMLCanvasElement>;

  constructor(public elementRef: ElementRef) { }

  ngAfterViewInit(): void {
    this.renderPage(this.page);
  }

  renderPage(page: PDFPageProxy) {
    const viewport = page.getViewport({ scale: this.scale });

    // Support HiDPI-screens.
    const outputScale = window.devicePixelRatio || 1;

    const { nativeElement: canvas } = this.canvasRef;
    const context = canvas.getContext('2d');

    canvas.width = Math.floor(viewport.width * outputScale);
    canvas.height = Math.floor(viewport.height * outputScale);
    canvas.style.width = "100%"

    const transform = outputScale !== 1
      ? [outputScale, 0, 0, outputScale, 0, 0]
      : null;

    const renderContext = {
      canvasContext: context!,
      transform: transform!,
      viewport: viewport
    };
    page.render(renderContext);
  }

}
