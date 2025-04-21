import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ESP32Service {
  private ws: WebSocket | null = null;
  private objectDetected = new Subject<void>();

  objectDetected$ = this.objectDetected.asObservable();

  constructor() {
    this.connectWebSocket();
  }

  private connectWebSocket() {
    // Asumimos que el ESP32 está ejecutando un servidor WebSocket en esta dirección
    this.ws = new WebSocket('ws://192.168.1.100:81');

    this.ws.onopen = () => {
      console.log('Conexión WebSocket establecida con ESP32');
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'object_detected') {
          this.objectDetected.next();
        }
      } catch (error) {
        console.error('Error al procesar mensaje del ESP32:', error);
      }
    };

    this.ws.onerror = (error) => {
      console.error('Error en la conexión WebSocket:', error);
    };

    this.ws.onclose = () => {
      console.log('Conexión WebSocket cerrada');
      // Intentar reconectar después de un tiempo
      setTimeout(() => this.connectWebSocket(), 5000);
    };
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}