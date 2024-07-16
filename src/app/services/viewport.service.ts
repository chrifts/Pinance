import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject, fromEvent } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ViewportService {
  private viewportHeight = new BehaviorSubject<number>(window.innerHeight);
  public viewportHeight$ = this.viewportHeight.asObservable();

  constructor(private ngZone: NgZone) {
    // Escuchar eventos de redimensionamiento
    this.ngZone.runOutsideAngular(() => {
      fromEvent(window, 'resize').subscribe(() => {
        this.ngZone.run(() => {
          this.updateViewportHeight();
        });
      });
    });
  }

  private updateViewportHeight() {
    this.viewportHeight.next(window.innerHeight);
  }
}
