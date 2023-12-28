import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { EditorComponent } from './router/editor/editor.component';
import { NZ_I18N } from 'ng-zorro-antd/i18n';
import { en_US } from 'ng-zorro-antd/i18n';
import { registerLocaleData } from '@angular/common';
import en from '@angular/common/locales/en';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppInitializerProvider } from './app-initializer.provider';
import { ZorroModule } from './modules/zorro/zorro.module';
import { DropzoneDirective } from './directives/dropzone.directive';
import { SlotComponent } from './components/slot/slot.component';

registerLocaleData(en);

@NgModule({
  declarations: [
    AppComponent,
    EditorComponent,
    DropzoneDirective,
    SlotComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    ZorroModule,
  ],
  providers: [
    AppInitializerProvider,
    { provide: NZ_I18N, useValue: en_US }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
