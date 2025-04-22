import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CameraService } from '../../services/camera.service';
import { GeminiService } from '../../services/gemini.service';
import { ProximityService } from '../../../app/services/proximity.service';

@Component({
  selector: 'app-photo-analyzer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container">
      <h1>Clasificador de Residuos</h1>
      
      <div class="status-indicator" [class.active]="isInRange">
        <span class="indicator-text">{{ proximityMessage }}</span>
      </div>

      <div class="actions">
        <button 
          (click)="takePicture()" 
          class="btn primary" 
          [disabled]="!isInRange || analyzing">
          {{ isCapturing ? 'Detener Captura (' + captureTimeLeft + 's)' : 'Iniciar Captura' }}
        </button>
      </div>

      <div *ngIf="imageBase64" class="preview">
        <img [src]="'data:image/jpeg;base64,' + imageBase64" alt="Preview" />
      </div>

      <div *ngIf="classification" class="classification">
        <h2>Clasificación del Residuo</h2>
        <div class="result" [class]="classification.toLowerCase()">
          {{ classification }}
        </div>
      </div>

      <div *ngIf="error" class="error">
        <p>{{ error }}</p>
      </div>
    </div>
  `,
  styles: [`
    .container {
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      text-align: center;
    }

    h1 {
      color: #2c3e50;
      margin-bottom: 30px;
    }

    .status-indicator {
      padding: 15px;
      background-color: #f8d7da;
      border-radius: 8px;
      margin-bottom: 20px;
      transition: all 0.3s ease;
    }

    .status-indicator.active {
      background-color: #d4edda;
    }

    .indicator-text {
      font-size: 16px;
      color: #721c24;
    }

    .status-indicator.active .indicator-text {
      color: #155724;
    }

    .actions {
      margin: 20px 0;
    }

    .btn {
      padding: 15px 30px;
      border: none;
      border-radius: 25px;
      cursor: pointer;
      font-size: 18px;
      transition: all 0.3s ease;
    }

    .btn:disabled {
      background-color: #cccccc;
      cursor: not-allowed;
    }

    .primary {
      background-color: #2ecc71;
      color: white;
    }

    .primary:not(:disabled):hover {
      background-color: #27ae60;
    }

    .preview {
      margin: 20px auto;
      max-width: 400px;
    }

    .preview img {
      width: 100%;
      border-radius: 12px;
      box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    }

    .classification {
      margin-top: 30px;
    }

    .result {
      display: inline-block;
      padding: 15px 30px;
      border-radius: 25px;
      font-size: 20px;
      font-weight: bold;
      margin-top: 10px;
    }

    .result.orgánico {
      background-color: #a5d6a7;
      color: #1b5e20;
    }

    .result.inorgánico {
      background-color: #90caf9;
      color: #0d47a1;
    }

    .error {
      color: #dc3545;
      margin-top: 20px;
    }
  `]
})
export class PhotoAnalyzerComponent {
  imageBase64: string | undefined;
  classification: string | undefined;
  analyzing = false;
  isInRange = false;
  proximityMessage = 'Acerque el residuo entre 5-10 cm de la cámara';
  error: string | undefined;
  isCapturing = false;
  captureInterval: any;
  captureTimeLeft = 300; // 5 minutos en segundos

  private cameraService = inject(CameraService);
  private geminiService = inject(GeminiService);
  private proximityService = inject(ProximityService);

  constructor() {
    this.startProximityDetection();
  }

  private startProximityDetection() {
    this.proximityService.startDetection().subscribe((distance: number) => {
      this.isInRange = distance >= 5 && distance <= 10;
      this.proximityMessage = this.isInRange
        ? 'Distancia correcta - Listo para capturar'
        : 'Acerque el residuo entre 5-10 cm de la cámara';
    });
  }

  async takePicture() {
    if (this.isCapturing) {
      this.stopCapture();
      return;
    }

    this.error = undefined;
    this.isCapturing = true;
    this.captureTimeLeft = 300;

    try {
      this.imageBase64 = await this.cameraService.takePicture();
      if (this.imageBase64) {
        await this.classifyWaste();
        this.captureInterval = setInterval(async () => {
          if (this.captureTimeLeft <= 0) {
            this.stopCapture();
            return;
          }
          this.captureTimeLeft--;
        }, 1000);
      }
    } catch (error) {
      console.error('Error al capturar:', error);
      this.error = 'Error al acceder a la cámara. Por favor, verifica los permisos.';
      this.stopCapture();
    }
  }

  stopCapture() {
    if (this.captureInterval) {
      clearInterval(this.captureInterval);
    }
    this.isCapturing = false;
    this.captureTimeLeft = 300;
  }

  private async classifyWaste() {
    if (!this.imageBase64) return;

    try {
      this.analyzing = true;
      const result = await this.geminiService.analyzeImage(this.imageBase64);
      this.classification = result;
      this.error = undefined;
    } catch (error) {
      this.error = 'Error al analizar la imagen. Por favor, intente de nuevo.';
      console.error('Error al analizar:', error);
    } finally {
      this.analyzing = false;
    }
  }
}