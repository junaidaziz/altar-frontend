import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface ToastMessage {
  text: string;
  type: 'success' | 'error';
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private toastSubject = new Subject<ToastMessage>();
  toast$ = this.toastSubject.asObservable();

  showSuccess(text: string) {
    this.toastSubject.next({ text, type: 'success' });
  }

  showError(text: string) {
    this.toastSubject.next({ text, type: 'error' });
  }
}
