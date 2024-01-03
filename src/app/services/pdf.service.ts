import { Injectable } from '@angular/core';
import { PDFDocument, StandardFonts, arrayAsString, rgb } from 'pdf-lib';
import { PDFDocumentProxy } from 'pdfjs-dist';

declare const pdfjsLib: any;

@Injectable({
  providedIn: 'root'
})
export class PdfService {

  proxyDocToLibDoc: Map<PDFDocumentProxy, PDFDocument> = new Map();

  constructor() {
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'node_modules/pdfjs-dist/build/pdf.worker.mjs';
  }

  async createSample() {
    const libDoc = await PDFDocument.create()
    const timesRomanFont = await libDoc.embedFont(StandardFonts.TimesRoman)

    for (let i = 0; i < 6; ++i) {
      const pageNr = i;
      const page = libDoc.addPage();
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

    const pdfBytes = await libDoc.save();
    const proxyDoc: PDFDocumentProxy = await pdfjsLib.getDocument(pdfBytes).promise;
    this.proxyDocToLibDoc.set(proxyDoc, libDoc);
    return proxyDoc;
  }

  async fromPdfFile(file: File): Promise<PDFDocumentProxy> {
    const arrayBuffer = await file.arrayBuffer();
    const libDoc = await PDFDocument.load(arrayBuffer);
    const proxyDoc = await pdfjsLib.getDocument(arrayBuffer).promise;
    this.proxyDocToLibDoc.set(proxyDoc, libDoc);
    return proxyDoc;
  }

  async fromImageFile(file: File) {
    const arrayBuffer = await file.arrayBuffer();
    const libDoc = await PDFDocument.create();
    const libPage = libDoc.addPage();
    let image;
    if (file.name.endsWith('png')) {
      image = await libDoc.embedPng(arrayBuffer);
    } else {
      image = await libDoc.embedJpg(arrayBuffer);
    }
    libPage.drawImage(image);
    const pdfBytes = await libDoc.save();
    const proxyDoc: PDFDocumentProxy = await pdfjsLib.getDocument(pdfBytes).promise;
    this.proxyDocToLibDoc.set(proxyDoc, libDoc);
    return proxyDoc;
  }

}