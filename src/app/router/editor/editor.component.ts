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
        this.pdfService.selectNextPage();
        this.scrollToPage(this.pdfService.currentPageIdx);
        break;
      case 'k':
        this.pdfService.selectPreviousPage();
        this.scrollToPage(this.pdfService.currentPageIdx);
        break;
      case 'd':
        this.pdfService.deleteCurrentPage();
        break;
      default:
        break;
    }
  }

  scrollToPage(idx: number) {
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
  }

}
