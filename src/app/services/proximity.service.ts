import { Injectable } from '@angular/core';
import { Observable, interval } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ProximityService {
  private readonly POLL_INTERVAL = 100; // Intervalo de actualización en ms

  constructor() {}

  startDetection(): Observable<number> {
    return new Observable<number>(observer => {
      let subscription: any;

      // Solicitar permiso para usar el sensor de proximidad
      if ('ProximitySensor' in window) {
        try {
          const sensor = new (window as any).ProximitySensor();
          sensor.addEventListener('reading', () => {
            // El valor se convierte a centímetros y se redondea
            const distance = Math.round(sensor.distance * 100);
            observer.next(distance);
          });
          sensor.start();

          return () => {
            sensor.stop();
          };
        } catch (error) {
          console.warn('Error al inicializar el sensor de proximidad:', error);
          // Fallback: simulación de distancia para desarrollo
          subscription = this.simulateProximitySensor().subscribe(observer);
        }
      } else {
        console.warn('Sensor de proximidad no disponible');
        // Fallback: simulación de distancia para desarrollo
        subscription = this.simulateProximitySensor().subscribe(observer);
      }

      return () => {
        if (subscription) {
          subscription.unsubscribe();
        }
      };
    });
  }

  private simulateProximitySensor(): Observable<number> {
    return interval(this.POLL_INTERVAL).pipe(
      map(() => {
        // Simula una distancia entre 3 y 15 cm
        return Math.floor(Math.random() * (15 - 3 + 1)) + 3;
      })
    );
  }
}