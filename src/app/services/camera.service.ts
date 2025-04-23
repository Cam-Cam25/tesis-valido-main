import { Injectable } from '@angular/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

@Injectable({
  providedIn: 'root'
})
export class CameraService {
  constructor() {}

  private stream: MediaStream | null = null;
  private videoElement: HTMLVideoElement | null = null;

  stopVideoStream() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    if (this.videoElement) {
      this.videoElement.srcObject = null;
      this.videoElement = null;
    }
  }

  async startVideoStream(): Promise<HTMLVideoElement> {
    try {
      // Verificar si hay cámaras disponibles
      const devices = await navigator.mediaDevices.enumerateDevices();
      const cameras = devices.filter(device => device.kind === 'videoinput');
      
      if (cameras.length === 0) {
        throw new Error('No se detectó ninguna cámara web en el dispositivo. Por favor, verifica que tu dispositivo tenga una cámara web y que esté funcionando correctamente.');
      }

      // Solicitar acceso a la cámara directamente
      if (!this.stream) {
        this.stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: 'environment'
          }
        });
      }

      // Crear o reutilizar el elemento de video
      if (!this.videoElement) {
        this.videoElement = document.createElement('video');
        this.videoElement.autoplay = true;
        this.videoElement.playsInline = true;
      }

      this.videoElement.srcObject = this.stream;
      await this.videoElement.play();

      return this.videoElement;
    } catch (error: any) {
      console.error('Error al capturar la foto:', error);
      if (error.message.includes('User denied')) {
        throw new Error('Permisos de cámara denegados. Por favor, habilita el acceso a la cámara en la configuración de tu navegador.');
      }
      if (error.message.includes('No se detectó ninguna cámara')) {
        throw error;
      }
      throw new Error('Error al acceder a la cámara. Por favor, verifica que tu cámara web esté conectada y funcionando correctamente.');
    }
  }

  async selectFromGallery() {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Base64,
        source: CameraSource.Photos
      });
      
      return image.base64String;
    } catch (error) {
      console.error('Error al seleccionar la foto:', error);
      throw error;
    }
  }
}