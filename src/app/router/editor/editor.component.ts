import { Component } from '@angular/core';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'pdf-editor',
  templateUrl: './editor.component.html',
  styleUrl: './editor.component.scss'
})
export class EditorComponent {

  constructor(private themeService: ThemeService) { }

  onToggleDarkmode() {
    this.themeService.toggleTheme();
  }

}
