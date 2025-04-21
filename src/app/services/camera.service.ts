import { Injectable } from '@angular/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

@Injectable({
  providedIn: 'root'
})
export class CameraService {
  constructor() {}

  async takePicture() {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Base64,
        source: CameraSource.Camera,
        saveToGallery: false,
        webUseInput: false,
        promptLabelHeader: 'Cámara',
        promptLabelCancel: 'Cancelar',
        promptLabelPhoto: 'Tomar Foto',
        width: 1280,
        height: 720,
        correctOrientation: true
      });
      
      return image.base64String;
    } catch (error) {
      console.error('Error al capturar la foto:', error);
      throw error;
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