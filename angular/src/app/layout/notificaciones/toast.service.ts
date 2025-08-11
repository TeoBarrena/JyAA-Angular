import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type ToastType =
  | 'info' | 'warning' | 'error' | 'success'
  | 'info-outline' | 'warning-outline' | 'error-outline' | 'success-outline';

export interface ToastData {
  type: ToastType;
  message: string;
  time?: number;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private toasts: ToastData[] = [];
  private toastSubject = new BehaviorSubject<ToastData[]>([]);
  toast$ = this.toastSubject.asObservable();

  show(type: ToastType, message: string, time: number = 4000) {
    const toast: ToastData = { type, message,  time};
    this.toasts.push(toast);
    this.toastSubject.next(this.toasts);
    setTimeout(() => {
      this.remove(toast);
    }, toast.time);
  }

  remove(toast: ToastData) {
    this.toasts = this.toasts.filter(t => t !== toast);
    this.toastSubject.next(this.toasts);
  }
}
