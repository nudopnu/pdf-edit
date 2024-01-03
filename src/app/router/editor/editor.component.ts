import { ChangeDetectorRef, Component, HostListener, OnInit, QueryList, ViewChildren } from '@angular/core';
import { PageviewComponent } from '../../components/pageview/pageview.component';
import { EditorService } from '../../services/editor.service';

@Component({
  selector: 'pdf-editor',
  templateUrl: './editor.component.html',
  styleUrl: './editor.component.scss'
})
export class EditorComponent implements OnInit {

  @ViewChildren('fullpage') fullpageViewComponents!: QueryList<PageviewComponent>;
  constructor(
    public editorService: EditorService,
    public cdr: ChangeDetectorRef,
  ) { }

  @HostListener('window:keydown', ['$event'])
  async onKeyDown(event: KeyboardEvent) {
    const { key } = event;
    switch (key) {
      case 'j':
        if (event.altKey) {
          const { currentPageIdx } = this.editorService;
          this.editorService.movePageDown(currentPageIdx);
          this.selectAndMoveToPage(currentPageIdx + 1);
        } else {
          this.editorService.selectNextPage();
          this.moveToPage(this.editorService.currentPageIdx);
        }
        break;
      case 'k':
        if (event.altKey) {
          const { currentPageIdx } = this.editorService;
          this.editorService.movePageUp(currentPageIdx);
          this.selectAndMoveToPage(currentPageIdx - 1);
        } else {
          this.editorService.selectPreviousPage();
          this.moveToPage(this.editorService.currentPageIdx);
        }
        break;
      case 'd':
        this.editorService.deleteCurrentPage();
        if (this.editorService.pages.length > 0) {
          this.moveToPage(this.editorService.currentPageIdx);
        }
        break;
      case 's':
        await this.editorService.assemblePdf();
        break;
      default:
        break;
    }
  }

  selectAndMoveToPage(idx: number) {
    if (idx < 0 || idx >= this.editorService.pages.length) return;
    this.editorService.selectPage(idx);
    this.moveToPage(idx);
  }

  moveToPage(idx: number) {
    this.cdr.detectChanges();
    const nativeElement = this.fullpageViewComponents.get(idx)?.elementRef.nativeElement as HTMLElement;
    nativeElement.scrollIntoView();
  }

  async onFilesReceived(files: Array<File>) {
    for (const file of files) {
      if (file.name.endsWith('pdf')) {
        await this.editorService.addPdfFromFile(file);
      } else if (file.name.endsWith('png')) {
        await this.editorService.addImageFromFile(file);
      }
    }
  }

  async ngOnInit(): Promise<void> {
    await this.editorService.setSampleFile();
    this.moveToPage(0);
  }

}
