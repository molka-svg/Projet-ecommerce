import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  text: string;
}

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private messagesSubject = new BehaviorSubject<ToastMessage[]>([]);
  messages$ = this.messagesSubject.asObservable();

  show(text: string, type: 'success' | 'error' | 'warning' | 'info' = 'info', durationMs = 4000): void {
    const id = Math.random().toString(36).substring(2, 9);
    const message: ToastMessage = { id, type, text };
    const current = this.messagesSubject.getValue();
    this.messagesSubject.next([...current, message]);

    setTimeout(() => {
      this.remove(id);
    }, durationMs);
  }

  success(text: string, durationMs = 4000): void {
    this.show(text, 'success', durationMs);
  }

  error(text: string, durationMs = 5000): void {
    this.show(text, 'error', durationMs);
  }

  warning(text: string, durationMs = 4000): void {
    this.show(text, 'warning', durationMs);
  }

  info(text: string, durationMs = 4000): void {
    this.show(text, 'info', durationMs);
  }

  remove(id: string): void {
    const current = this.messagesSubject.getValue();
    this.messagesSubject.next(current.filter((m) => m.id !== id));
  }
}
