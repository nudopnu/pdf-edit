import { ChangeDetectorRef, Component, ElementRef, HostListener, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzUploadChangeParam } from 'ng-zorro-antd/upload';
import { PageviewComponent } from '../../components/pageview/pageview.component';
import { EditorService } from '../../services/editor.service';
import { ALLOWED_FILE_TYPES, ALLOWED_IMAGE_TYPES } from '../../utils/file-utils';
import Sortable, { MultiDrag } from 'sortablejs';
import { PDFPageProxy } from 'pdfjs-dist';
Sortable.mount(new MultiDrag);

@Component({
  selector: 'pdf-editor',
  templateUrl: './editor.component.html',
  styleUrl: './editor.component.scss'
})
export class EditorComponent implements OnInit {

  supportedFiles = ALLOWED_FILE_TYPES.join(',');
  isLoading = false;
  isSelecting = false;
  chosenPages = [] as HTMLElement[];
  chosenPageIndices = [] as number[];

  @ViewChildren('fullpage') fullpageViewComponents!: QueryList<PageviewComponent>;
  @ViewChild('previewList') previewListElementRef!: ElementRef;
  loadingMessageId: string | undefined;
  sortable!: Sortable;

  constructor(
    public editorService: EditorService,
    public cdr: ChangeDetectorRef,
    private messageService: NzMessageService,
  ) { }

  @HostListener('window:keydown', ['$event'])
  async onKeyDown(event: KeyboardEvent) {
    if (this.editorService.isTitleEditing) return;
    const { key } = event;
    switch (key) {
      case 'j':
      case 'ArrowDown':
        if (event.altKey) {
          this.moveCurrentPageDown();
        } else {
          const { currentPageIdx } = this.editorService;
          const newPageIdx = currentPageIdx + 1;
          this.selectPage(newPageIdx);
          this.moveToPage(newPageIdx);
        }
        break;
      case 'k':
      case 'ArrowUp':
        if (event.altKey) {
          this.moveCurrentPageUp();
        } else {
          const { currentPageIdx } = this.editorService;
          const newPageIdx = currentPageIdx - 1;
          this.selectPage(newPageIdx);
          this.moveToPage(newPageIdx);
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

  enterSelectMode(index: number) {
    if (this.isSelecting) return;
    this.isSelecting = true;
    this.sortable.options.disabled = false;
    this.selectPage(index);
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
    this.initSortable();
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
  }

  deleteCurrentPage() {
    const idx = this.editorService.currentPageIdx;
    if (idx < 0 || idx >= this.editorService.pages.length) return;
    this.editorService.deleteCurrentPage();
    this.cdr.detectChanges();
    this.chosenPageIndices = [];
    this.chosenPages = [];
    if (this.editorService.pages.length > 0) {
      this.moveToPage(this.editorService.currentPageIdx);
      this.selectPage(this.editorService.currentPageIdx);
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
    this.cdr.detectChanges();
    this.selectPage(idx);
    this.moveToPage(idx);
  }

  selectPage(idx: number) {
    if (idx < 0 || idx >= this.editorService.pages.length) return;
    this.editorService.selectPage(idx);
    this.chosenPages.forEach(page => Sortable.utils.deselect(page));
    const chosenPage = this.previewListElementRef.nativeElement.children[idx];
    this.chosenPages = [chosenPage];
    Sortable.utils.select(chosenPage);
  }

  moveToPage(idx: number) {
    if (idx < 0 || idx >= this.editorService.pages.length) return;
    this.cdr.detectChanges();
    const nativeElement = this.fullpageViewComponents.get(idx)?.elementRef.nativeElement as HTMLElement;
    nativeElement.scrollIntoView();
  }

  async ngOnInit(): Promise<void> {
    // await this.editorService.setSampleFile();
    // this.moveToPage(0);
    // this.initSortable();
  }

  onBlur() {
    console.log("asdfasdf");
  }

  private initSortable() {
    this.cdr.detectChanges();
    if (this.sortable) this.sortable.destroy();
    this.sortable = Sortable.create(this.previewListElementRef.nativeElement, {
      multiDrag: true,
      // multiDragKey: 'ctrl' as any,
      selectedClass: 'selected',
      chosenClass: 'chosen',
      delayOnTouchOnly: true,
      delay: 100,
      animation: 199,
      onSelect: (evt) => {
        this.chosenPages = evt.items;
        this.chosenPageIndices = evt.newIndicies.map((o) => o.index);
        if (this.chosenPageIndices.length === 0) return;
        this.editorService.currentPageIdx = this.chosenPageIndices.at(-1)!;
        this.moveToPage(this.editorService.currentPageIdx);
      },
      onDeselect: (evt) => {
        this.chosenPages = evt.items;
        this.chosenPageIndices = evt.newIndicies.map((o) => o.index);
        if (this.chosenPageIndices.length === 0) {
          this.isSelecting = false;
          this.sortable.options.disabled = true;
          this.chosenPageIndices = [];
          this.chosenPages = [];
          return;
        };
        this.editorService.currentPageIdx = this.chosenPageIndices.at(-1)!;
        this.moveToPage(this.editorService.currentPageIdx);
      },
      onUpdate: (evt: Sortable.SortableEvent) => {
        const idcs = this.sortable.toArray().map(id => parseInt(id));
        const pages = [] as PDFPageProxy[];
        idcs.forEach(idx => pages.push(this.editorService.pages[idx]));
        this.editorService.pages = [...pages];
        evt.items.forEach((item) => {
          Sortable.utils.deselect(item);
        });
        this.isSelecting = false;
        this.sortable.options.disabled = true;
        this.chosenPageIndices = [];
        this.chosenPages = [];
        this.cdr.detectChanges();
      }
    });
    this.sortable.options.disabled = true;
  }
}
