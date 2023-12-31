import { Injectable } from '@angular/core';
import { PDFDocumentProxy, PDFPageProxy } from 'pdfjs-dist';
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

declare const pdfjsLib: any;

@Injectable({
  providedIn: 'root'
})
export class EditorService {

  pages: PDFPageProxy[] = [];
  currentPageIdx = 0;

  constructor() {
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'node_modules/pdfjs-dist/build/pdf.worker.mjs';
  }

  async setSampleFile() {
    const pdf = await this.createSamplefile();
    this.addPdf(pdf);
  }

  async addPdfFromFile(file: File, idx?: number) {
    const pdf = await this.fromFile(file);
    await this.addPdf(pdf, idx);
  }

  async addPdf(pdf: PDFDocumentProxy, idx?: number) {
    idx = idx || this.currentPageIdx;
    for (let idx = 0; idx < pdf.numPages; idx++) {
      const page = await pdf.getPage(idx + 1);
      this.pages.push(page);
    }
  }

  deletePage(idx: number) {
    if (this.pages.length > 0) {
      this.pages = [...this.pages.filter((_, i) => i !== idx)];
      if (this.currentPageIdx >= this.pages.length) {
        this.currentPageIdx -= 1;
      }
      if (this.pages.length > 0) {
        this.selectPage(this.currentPageIdx);
      }
    }
  }

  selectPreviousPage() {
    if (this.currentPageIdx > 0) {
      this.selectPage(this.currentPageIdx - 1);
    }
  }

  selectNextPage() {
    if (this.currentPageIdx < this.pages.length - 1) {
      this.selectPage(this.currentPageIdx + 1);
    }
  }

  selectPage(idx: number) {
    this.currentPageIdx = idx;
  }

  movePageUp(idx: number) {
    if (this.currentPageIdx > 0) {
      this.pages = [
        ...this.pages.slice(0, idx - 1),
        this.pages[idx],
        this.pages[idx - 1],
        ...this.pages.slice(idx + 1),
      ];
    }
  }

  movePageDown(idx: number) {
    if (this.currentPageIdx < this.pages.length - 1) {
      this.pages = [
        ...this.pages.slice(0, idx),
        this.pages[idx + 1],
        this.pages[idx],
        ...this.pages.slice(idx + 2),
      ];
    }
  }

  deleteCurrentPage() {
    this.deletePage(this.currentPageIdx);
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

  private async fromFile(file: File): Promise<PDFDocumentProxy> {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = PDFDocument.load(arrayBuffer);
    return await pdfjsLib.getDocument(arrayBuffer).promise;
  }

}
