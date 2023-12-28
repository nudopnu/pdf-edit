import { Component, OnInit } from '@angular/core';
import { PDFPageProxy } from 'pdfjs-dist';
import { PdfService } from '../../services/pdf.service';

@Component({
  selector: 'pdf-editor',
  templateUrl: './editor.component.html',
  styleUrl: './editor.component.scss'
})
export class EditorComponent implements OnInit {

  constructor(private pdfService: PdfService) { }

  async onFilesReceived(files: Array<File>) {
    const sampleFile = files[0];
    if (sampleFile.name.endsWith('pdf')) {
      const pdf = await this.pdfService.fromFile(sampleFile);
      const page = await pdf.getPage(1);
      this.renderPage(page)
    }
  }

  async ngOnInit(): Promise<void> {
    const pdf = await this.pdfService.createSamplefile();
    const page = await pdf.getPage(1);
    this.renderPage(page);
  }

  renderPage(page: PDFPageProxy) {
    const scale = 1;
    const viewport = page.getViewport({ scale: scale, });

    // Support HiDPI-screens.
    const outputScale = window.devicePixelRatio || 1;

    const canvas = document.getElementById('canvas')! as HTMLCanvasElement;
    const context = canvas.getContext('2d');

    canvas.width = Math.floor(viewport.width * outputScale);
    canvas.height = Math.floor(viewport.height * outputScale);
    canvas.style.width = Math.floor(viewport.width) + "px";
    canvas.style.height = Math.floor(viewport.height) + "px";

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
