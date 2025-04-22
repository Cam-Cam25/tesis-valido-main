import { Injectable } from '@angular/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

@Injectable({
  providedIn: 'root'
})
export class CameraService {
  constructor() {}

  async takePicture() {
    try {
      // Verificar si hay cámaras disponibles
      const devices = await navigator.mediaDevices.enumerateDevices();
      const cameras = devices.filter(device => device.kind === 'videoinput');
      
      if (cameras.length === 0) {
        throw new Error('No se detectó ninguna cámara web en el dispositivo. Por favor, verifica que tu dispositivo tenga una cámara web y que esté funcionando correctamente.');
      }

      const permissionStatus = await Camera.checkPermissions();
      
      if (permissionStatus.camera !== 'granted') {
        const requestResult = await Camera.requestPermissions();
        if (requestResult.camera !== 'granted') {
          throw new Error('Permisos de cámara denegados. Por favor, habilita el acceso a la cámara en la configuración de tu navegador.');
        }
      }

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