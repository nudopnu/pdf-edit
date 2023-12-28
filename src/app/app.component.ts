import { Component } from '@angular/core';
import { ThemeService } from './services/theme.service';

@Component({
  selector: 'pdf-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {

  constructor(private themeService: ThemeService) { }

  onToggleDarkmode() {
    this.themeService.toggleTheme();
  }


  title = 'pdf-edit';
}
