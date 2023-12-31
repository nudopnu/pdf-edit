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
  constructor(public pdfService: PdfService) { }

  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    console.log(event);
    const { key } = event;
    switch (key) {
      case 'j':
        if (event.altKey) {
          const { currentPageIdx } = this.pdfService;
          this.pdfService.movePageDown(currentPageIdx);
          this.selectAndMoveToPage(currentPageIdx + 1);
        } else {
          this.pdfService.selectNextPage();
          this.moveToPage(this.pdfService.currentPageIdx);
        }
        break;
      case 'k':
        if (event.altKey) {
          const { currentPageIdx } = this.pdfService;
          this.pdfService.movePageUp(currentPageIdx);
          this.selectAndMoveToPage(currentPageIdx - 1);
        } else {
          this.pdfService.selectPreviousPage();
          this.moveToPage(this.pdfService.currentPageIdx);
        }
        break;
      case 'd':
        this.pdfService.deleteCurrentPage();
        this.moveToPage(this.pdfService.currentPageIdx);
        break;
      default:
        break;
    }
  }

  selectAndMoveToPage(idx: number) {
    if (idx < 0 || idx >= this.pdfService.pages.length) return;
    this.pdfService.selectPage(idx);
    this.moveToPage(idx);
  }

  moveToPage(idx: number) {
    const nativeElement = this.fullpageViewComponents.get(idx)?.elementRef.nativeElement as HTMLElement;
    nativeElement.scrollIntoView();
  }

  async onFilesReceived(files: Array<File>) {
    for (const file of files) {
      if (file.name.endsWith('pdf')) {
        await this.pdfService.addPdfFromFile(file);
      }
    }
  }

  async ngOnInit(): Promise<void> {
    this.pdfService.setSampleFile();
    this.moveToPage(0);
  }

}
