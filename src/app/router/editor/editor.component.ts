import { Component, HostListener, OnInit, QueryList, ViewChildren } from '@angular/core';
import { PDFPageProxy } from 'pdfjs-dist';
import { PdfService } from '../../services/pdf.service';
import { PageviewComponent } from '../../components/pageview/pageview.component';

@Component({
  selector: 'pdf-editor',
  templateUrl: './editor.component.html',
  styleUrl: './editor.component.scss'
})
export class EditorComponent implements OnInit {

  @ViewChildren('fullpage') fullpageViewComponents!: QueryList<PageviewComponent>;
  pages: PDFPageProxy[] = [];
  currentPageIdx = 0;

  constructor(private pdfService: PdfService) { }

  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    console.log(event);
    const { key } = event;
    switch (key) {
      case 'j':
        if (this.currentPageIdx < this.pages.length - 1) {
          this.onSelectPage(this.currentPageIdx + 1);
        }
        break;
      case 'k':
        if (this.currentPageIdx > 0) {
          this.onSelectPage(this.currentPageIdx - 1);
        }
        break;
      case 'd':
        if (this.pages.length > 0) {
          this.onDeletePage(this.currentPageIdx);
        }
        break;
      default:
        break;
    }
  }

  onSelectPage(idx: number) {
    const nativeElement = this.fullpageViewComponents.get(idx)?.elementRef.nativeElement as HTMLElement;
    nativeElement.scrollIntoView();
    this.currentPageIdx = idx;
    console.log(`Selecting page ${this.currentPageIdx}`, this.pages[idx]);
  }

  onDeletePage(idx: number) {
    this.pages = [...this.pages.filter((_, i) => i !== idx)];
    if (this.currentPageIdx >= this.pages.length) {
      this.currentPageIdx -= 1;
    }
    if (this.pages.length > 0) {
      this.onSelectPage(this.currentPageIdx);
    }
  }

  async onFilesReceived(files: Array<File>) {
    const sampleFile = files[0];
    if (sampleFile.name.endsWith('pdf')) {
      const pdf = await this.pdfService.fromFile(sampleFile);
      for (let i = 0; i < pdf.numPages; i++) {
        const page = await pdf.getPage(i + 1);
        this.pages.push(page);
      }
    }
    console.log(this.pages);
  }

  async ngOnInit(): Promise<void> {
    const pdf = await this.pdfService.createSamplefile();
    const page = await pdf.getPage(1);
    for (let i = 0; i < pdf.numPages; i++) {
      const page = await pdf.getPage(i + 1);
      this.pages.push(page);
    }
  }

}
