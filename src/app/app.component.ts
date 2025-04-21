import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PhotoAnalyzerComponent } from './components/photo-analyzer/photo-analyzer.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, PhotoAnalyzerComponent],
  template: `
    <main class="main-container">
      <app-photo-analyzer></app-photo-analyzer>
    </main>
  `,
  styles: [`
    .main-container {
      min-height: 100vh;
      background-color: #f0f2f5;
      padding: 20px;
    }
  `]
})
export class AppComponent {}
