import { NgModule } from "@angular/core";
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { IconDefinition } from '@ant-design/icons-angular';
import { UserOutline, BgColorsOutline } from '@ant-design/icons-angular/icons';

const icons: IconDefinition[] = [
    UserOutline,
    BgColorsOutline,
];

@NgModule({
    imports: [
        NzIconModule.forRoot(icons)
    ],
    exports: [
        NzButtonModule,
        NzIconModule,
    ]
})
export class ZorroModule { }