import { Injectable } from '@angular/core';
import { PDFDocumentProxy } from 'pdfjs-dist';
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";


declare const pdfjsLib: any;

@Injectable({
  providedIn: 'root'
})
export class PdfService {

  constructor() {
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'node_modules/pdfjs-dist/build/pdf.worker.mjs';
  }

  async createSamplefile() {
    const pdfDoc = await PDFDocument.create()
    const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman)

    for (let i = 0; i < 6; ++i) {
      const pageNr = i;
      const page = pdfDoc.addPage();
      const { width, height } = page.getSize();
      const fontSize = 30;
      page.drawText(`Page ${pageNr}`, {
        x: 50,
        y: height - 4 * fontSize,
        size: fontSize,
        font: timesRomanFont,
        color: rgb(0, 0.53, 0.71),
      });
    }
    const pdfBytes = await pdfDoc.save();
    const pdf: PDFDocumentProxy = await pdfjsLib.getDocument(pdfBytes).promise;
    return pdf;
  }

  readFile(file: File) {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.onload = () => {
        const bytes = new Uint8Array(fileReader.result as ArrayBuffer);
        resolve(bytes);
      }
      fileReader.onerror = reject;
      fileReader.readAsArrayBuffer(file);
    });
  }

  async fromFile(file: File): Promise<PDFDocumentProxy> {
    const arrayBuffer = await file.arrayBuffer();
    return await pdfjsLib.getDocument(arrayBuffer).promise;
  }

}
