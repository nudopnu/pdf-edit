import { Component, OnInit, QueryList, ViewChildren } from '@angular/core';
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

  onSelectPage(pageViewComponent: PageviewComponent, idx: number) {
    const nativeElement = this.fullpageViewComponents.get(idx)?.elementRef.nativeElement as HTMLElement;
    nativeElement.scrollIntoView();
    console.log(nativeElement);

    this.currentPageIdx = idx;
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
  }

}
