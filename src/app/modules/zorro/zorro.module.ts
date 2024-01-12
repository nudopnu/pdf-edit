import { NgModule } from "@angular/core";
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { IconDefinition } from '@ant-design/icons-angular';
import { NzMessageModule } from 'ng-zorro-antd/message';
import { NzUploadModule } from 'ng-zorro-antd/upload';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { UserOutline, BgColorsOutline, PlusOutline, RotateRightOutline, SwapOutline, FileSyncOutline, SyncOutline, DeleteOutline, DownOutline, CaretUpOutline, DownloadOutline, InboxOutline } from '@ant-design/icons-angular/icons';

const icons: IconDefinition[] = [
    UserOutline,
    BgColorsOutline,
    PlusOutline,
    RotateRightOutline,
    SwapOutline,
    FileSyncOutline,
    SyncOutline,
    DeleteOutline,
    DownOutline,
    CaretUpOutline,
    DownloadOutline,
    InboxOutline,
];

@NgModule({
    imports: [
        NzIconModule.forRoot(icons)
    ],
    exports: [
        NzButtonModule,
        NzIconModule,
        NzMessageModule,
        NzUploadModule,
        NzSpinModule,
        NzDividerModule,
    ]
})
export class ZorroModule { }