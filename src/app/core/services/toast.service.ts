import { Injectable, signal } from '@angular/core';
import { Toast, ToastType } from '../models/toast';

@Injectable({
    providedIn: 'root'
})
export class ToastService {
    private toasts = signal<Toast[]>([]);
    readonly activeToasts = this.toasts.asReadonly();
    private counter = 0;

    show(message: string, type: ToastType = ToastType.INFO, duration: number = 5000) {
        const id = ++this.counter;
        const toast: Toast = { id, message, type, duration };

        this.toasts.update(current => [...current, toast]);

        setTimeout(() => {
            this.remove(id);
        }, duration);
    }

    success(message: string, duration?: number) {
        this.show(message, ToastType.SUCCESS, duration);
    }

    error(message: string, duration?: number) {
        this.show(message, ToastType.DANGER, duration);
    }

    warning(message: string, duration?: number) {
        this.show(message, ToastType.WARNING, duration);
    }

    info(message: string, duration?: number) {
        this.show(message, ToastType.INFO, duration);
    }

    remove(id: number) {
        this.toasts.update(current => current.filter(t => t.id !== id));
    }
}
