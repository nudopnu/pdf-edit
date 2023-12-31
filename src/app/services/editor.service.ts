import { Injectable } from '@angular/core';
import { PDFDocumentProxy, PDFPageProxy } from 'pdfjs-dist';
import { PdfService } from './pdf.service';
import { PDFDocument } from 'pdf-lib';

@Injectable({
  providedIn: 'root'
})
export class EditorService {

  pages: PDFPageProxy[] = [];
  currentPageIdx = 0;
  pageToDoc: Map<PDFPageProxy, PDFDocumentProxy> = new Map();

  constructor(private pdfService: PdfService) { }

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

  async setSampleFile() {
    const pdf = await this.pdfService.createSample();
    await this.addPdf(pdf);
  }

  async addPdfFromFile(file: File, idx?: number) {
    const pdf = await this.pdfService.fromPdfFile(file);
    await this.addPdf(pdf, idx);
  }

  async addPdf(pdf: PDFDocumentProxy, idx?: number) {
    idx = idx || this.currentPageIdx;
    for (let idx = 0; idx < pdf.numPages; idx++) {
      const page = await pdf.getPage(idx + 1);
      this.pages.push(page);
      this.pageToDoc.set(page, pdf);
    }
  }

  async assemblePdf() {
    const pdf = await PDFDocument.create();
    for (const proxyPage of this.pages) {
      const proxyDoc = this.pageToDoc.get(proxyPage)!;
      const doc = this.pdfService.proxyDocToLibDoc.get(proxyDoc)!;
      const idx = proxyPage._pageIndex;
      console.log(doc, idx);
      
      const [page] = await pdf.copyPages(doc, [idx]);
      console.log(page);
      await pdf.addPage(page);
    }
    const pdfBytes = await pdf.save();
    const blob = new Blob([pdfBytes], {type: "application/pdf"});
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = "result.pdf";
    link.click();
  }

}
