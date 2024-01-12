import { ChangeDetectorRef, Component, HostListener, OnInit, QueryList, ViewChildren } from '@angular/core';
import { PageviewComponent } from '../../components/pageview/pageview.component';
import { EditorService } from '../../services/editor.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ALLOWED_FILE_TYPES, ALLOWED_IMAGE_TYPES } from '../../utils/file-utils';
import { NzUploadChangeParam, NzUploadFile } from 'ng-zorro-antd/upload';

@Component({
  selector: 'pdf-editor',
  templateUrl: './editor.component.html',
  styleUrl: './editor.component.scss'
})
export class EditorComponent implements OnInit {

  supportedFiles = ALLOWED_FILE_TYPES.join(',');
  isLoading = false;

  @ViewChildren('fullpage') fullpageViewComponents!: QueryList<PageviewComponent>;
  loadingMessageId: string | undefined;

  constructor(
    public editorService: EditorService,
    public cdr: ChangeDetectorRef,
    private messageService: NzMessageService,
  ) { }

  @HostListener('window:keydown', ['$event'])
  async onKeyDown(event: KeyboardEvent) {
    const { key } = event;
    switch (key) {
      case 'j':
        if (event.altKey) {
          this.moveCurrentPageDown();
        } else {
          this.editorService.selectNextPage();
          this.moveToPage(this.editorService.currentPageIdx);
        }
        break;
      case 'k':
        if (event.altKey) {
          this.moveCurrentPageUp();
        } else {
          this.editorService.selectPreviousPage();
          this.moveToPage(this.editorService.currentPageIdx);
        }
        break;
      case 'l':
        this.rotateCurrentPage();
        break;
      case 'r':
        this.rotateCurrentPage(false);
        break;
      case 'd':
        this.deleteCurrentPage();
        break;
      case 's':
        await this.editorService.assemblePdf();
        break;
      default:
        break;
    }
  }

  async onFilesReceived(files: Array<File>) {
    let addedPages = 0;
    for (const file of files) {
      if (file.type === 'application/pdf') {
        addedPages += await this.editorService.addPdfFromFile(file);
      } else if (ALLOWED_IMAGE_TYPES.includes(file.type)) {
        await this.editorService.addImageFromFile(file);
        addedPages++;
      } else {
        this.messageService.error(`Filetype ".${file.name.split('.').at(-1)} "not supported!`);
      }
    }
    this.isLoading = false;
    this.messageService.remove(this.loadingMessageId);
    this.messageService.success(`Successfully added ${addedPages} page${addedPages > 1 ? 's' : ''}`, { nzDuration: 1800 });
  }

  handleChange({ file, fileList }: NzUploadChangeParam): void {
    const status = file.status;
    const files = fileList.map(f => f.originFileObj!);
    const isDone = files.indexOf(file.originFileObj!) === fileList.length - 1;
    if (status === 'done') {
    } else if (status === 'error' && isDone) {
      this.loadingMessageId = this.messageService.loading(`Loading ${files.length} files...`, { nzDuration: 0 }).messageId;
      this.isLoading = true;
      this.cdr.detectChanges();
      this.onFilesReceived(files);
    }
  }

  rotateCurrentPage(clockWise = true) {
    const { currentPageIdx } = this.editorService;
    const newAngle = this.editorService.rotatePage(currentPageIdx, clockWise);
    const nativeElement = this.fullpageViewComponents.get(currentPageIdx)?.elementRef.nativeElement as HTMLElement;
    nativeElement.style.rotate = `${newAngle}deg`;
    console.log(nativeElement);
  }

  deleteCurrentPage() {
    this.editorService.deleteCurrentPage();
    if (this.editorService.pages.length > 0) {
      this.moveToPage(this.editorService.currentPageIdx);
    }
  }

  moveCurrentPageUp() {
    const { currentPageIdx } = this.editorService;
    this.editorService.movePageUp(currentPageIdx);
    this.selectAndMoveToPage(currentPageIdx - 1);
  }

  moveCurrentPageDown() {
    const { currentPageIdx } = this.editorService;
    this.editorService.movePageDown(currentPageIdx);
    this.selectAndMoveToPage(currentPageIdx + 1);
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

  async ngOnInit(): Promise<void> {
    // await this.editorService.setSampleFile();
    // this.moveToPage(0);
  }

}
