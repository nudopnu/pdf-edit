import { Component } from '@angular/core';
import { EditorService } from './services/editor.service';
import { ThemeService } from './services/theme.service';

@Component({
  selector: 'pdf-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {

  GITHUB_URL = 'https://github.com/nudopnu/pdf-edit';

  constructor(
    private themeService: ThemeService,
    public editorService: EditorService,
  ) { }

  onToggleDarkmode() {
    this.themeService.toggleTheme();
  }

  onToggleTitleEditingmode() {
    this.editorService.isTitleEditing = !this.editorService.isTitleEditing;
    console.log(this.editorService.isTitleEditing);
  }

  onClickHelp() {
    window.open(this.GITHUB_URL, '_blank');
  }

}
