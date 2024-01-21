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
  filename: string | undefined;
  isTitleEditing = false;
  pageToDoc: Map<PDFPageProxy, PDFDocumentProxy> = new Map();

  constructor(private pdfService: PdfService) { }

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
    if (this.pages.length === 0) return;
    this.pages = [...this.pages.filter((_, i) => i !== idx)];
    if (this.currentPageIdx >= this.pages.length) {
      this.currentPageIdx -= 1;
    }
    if (this.pages.length > 0) {
      this.selectPage(this.currentPageIdx);
    } else {
      this.filename = undefined;
    }
  }

  rotatePage(idx: number, clockWise = true) {
    const proxyPage = this.pages[idx];
    const page = this.proxyPageToPage(proxyPage);
    const { angle, type } = page.getRotation();
    const newAngle = clockWise ? angle + 90 : angle - 90;
    page.setRotation({ type, angle: newAngle });
    return newAngle;
  }

  async setSampleFile() {
    const pdf = await this.pdfService.createSample();
    this.filename = "sample";
    await this.addPdf(pdf);
  }

  async addPdfFromFile(file: File, idx?: number) {
    const pdf = await this.pdfService.fromPdfFile(file);
    if (this.pages.length === 0) {
      this.filename = file.name.split('.').slice(0, -1).join('.');
    }
    return await this.addPdf(pdf, idx);
  }

  async addImageFromFile(file: File, idx?: number) {
    const pdf = await this.pdfService.fromImageFile(file);
    if (this.pages.length === 0) {
      this.filename = file.name.split('.').slice(0, -1).join('.');
    }
    await this.addPdf(pdf, idx);
  }

  async addPdf(pdf: PDFDocumentProxy, idx?: number) {
    idx = idx || this.currentPageIdx;
    for (let idx = 0; idx < pdf.numPages; idx++) {
      const page = await pdf.getPage(idx + 1);
      this.pages.push(page);
      this.pageToDoc.set(page, pdf);
    }
    return pdf.numPages;
  }

  proxyPageToPage(proxyPage: PDFPageProxy, copy = false) {
    const proxyDoc = this.pageToDoc.get(proxyPage)!;
    const doc = this.pdfService.proxyDocToLibDoc.get(proxyDoc)!;
    return doc.getPage(proxyPage._pageIndex);
  }

  async assemblePdf() {
    const pdf = await PDFDocument.create();
    for (const proxyPage of this.pages) {
      const proxyDoc = this.pageToDoc.get(proxyPage)!;
      const doc = this.pdfService.proxyDocToLibDoc.get(proxyDoc)!;
      const idx = proxyPage._pageIndex;
      const [page] = await pdf.copyPages(doc, [idx]);
      await pdf.addPage(page);
    }
    const pdfBytes = await pdf.save();
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = `${this.filename}.pdf`;
    link.click();
  }

}
