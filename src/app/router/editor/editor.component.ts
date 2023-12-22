import { Component, OnInit } from '@angular/core';
import { ThemeService } from '../../services/theme.service';
import { PDFDocument, PDFPage, StandardFonts, rgb } from 'pdf-lib';

declare const pdfjsLib: any;

@Component({
  selector: 'pdf-editor',
  templateUrl: './editor.component.html',
  styleUrl: './editor.component.scss'
})
export class EditorComponent implements OnInit {

  constructor(private themeService: ThemeService) { }

  async ngOnInit(): Promise<void> {
    // pdfjsLib.GlobalWorkerOptions.workerSrc = 'pdfjs/pdf.worker.mjs';
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'node_modules/pdfjs-dist/build/pdf.worker.mjs';
    const pdfDoc = await PDFDocument.create()
    const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman)

    const page = pdfDoc.addPage();
    const { width, height } = page.getSize();
    const fontSize = 30;
    page.drawText('Creating PDFs in JavaScript is awesome!', {
      x: 50,
      y: height - 4 * fontSize,
      size: fontSize,
      font: timesRomanFont,
      color: rgb(0, 0.53, 0.71),
    });
    const pdfBytes = await pdfDoc.save();
    const pdf: PDFDocument = await pdfjsLib.getDocument(pdfBytes).promise;
    // const page = await pdf.getPage(0);
    this.renderPage(await pdf.getPage(1));
    console.log(await pdf.getPage(1));
    

  }

  renderPage(page: any) {
    var scale = 1.5;
    var viewport = page.getViewport({ scale: scale, });
    // Support HiDPI-screens.
    var outputScale = window.devicePixelRatio || 1;

    var canvas = document.getElementById('canvas')! as HTMLCanvasElement;
    var context = canvas.getContext('2d');

    canvas.width = Math.floor(viewport.width * outputScale);
    canvas.height = Math.floor(viewport.height * outputScale);
    canvas.style.width = Math.floor(viewport.width) + "px";
    canvas.style.height = Math.floor(viewport.height) + "px";

    var transform = outputScale !== 1
      ? [outputScale, 0, 0, outputScale, 0, 0]
      : null;

    var renderContext = {
      canvasContext: context,
      transform: transform,
      viewport: viewport
    };
    page.render(renderContext);
  }

  onToggleDarkmode() {
    this.themeService.toggleTheme();
  }

}
