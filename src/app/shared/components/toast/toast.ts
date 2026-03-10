import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { animate, style, transition, trigger } from '@angular/animations';
import { ToastService } from '../../../core/services/toast.service';

@Component({
    selector: 'app-toast',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="toast-container">
      @for (toast of toastService.activeToasts(); track toast.id) {
        <div
          class="custom-toast"
          [class]="toast.type"
          [@toastAnimation]
        >
          <div class="toast-content">
            <div class="toast-icon">
              @if (toast.type === 'success') {
                <i class="fas fa-check-circle"></i>
              } @else if (toast.type === 'danger') {
                <i class="fas fa-exclamation-circle"></i>
              } @else if (toast.type === 'warning') {
                <i class="fas fa-exclamation-triangle"></i>
              } @else {
                <i class="fas fa-info-circle"></i>
              }
            </div>
            <span class="message">{{ toast.message }}</span>
            <button class="close-btn" (click)="toastService.remove(toast.id)">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" [style.animationDuration]="toast.duration + 'ms'"></div>
          </div>
        </div>
      }
    </div>
  `,
    styles: [`
    .toast-container {
      position: fixed;
      top: 24px;
      right: 24px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 12px;
      pointer-events: none;
    }

    .custom-toast {
      pointer-events: auto;
      min-width: 320px;
      max-width: 450px;
      background: rgba(30, 30, 35, 0.95);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
      position: relative;
    }

    .toast-content {
      padding: 16px;
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .toast-icon {
      font-size: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .message {
      flex: 1;
      font-size: 14px;
      font-weight: 500;
      color: #fff;
    }

    .close-btn {
      background: transparent;
      border: none;
      color: rgba(255, 255, 255, 0.5);
      cursor: pointer;
      padding: 4px;
      font-size: 16px;
      transition: all 0.2s;
    }

    .close-btn:hover {
      color: #fff;
      transform: scale(1.1);
    }

    /* Progress Bar */
    .progress-bar {
      height: 3px;
      background: rgba(255, 255, 255, 0.05);
      width: 100%;
    }

    .progress-fill {
      height: 100%;
      width: 100%;
      background: #fff;
      animation: shrink linear forwards;
    }

    @keyframes shrink {
      from { width: 100%; }
      to { width: 0%; }
    }

    /* Types Styling */
    .success {
      border-left: 4px solid #10b981;
      background: rgba(16, 185, 129, 0.15);
    }
    .success .toast-icon { color: #10b981; }
    .success .progress-fill { background: #10b981; }

    .danger {
      border-left: 4px solid #ef4444;
      background: rgba(239, 68, 68, 0.15);
    }
    .danger .toast-icon { color: #ef4444; }
    .danger .progress-fill { background: #ef4444; }

    .warning {
      border-left: 4px solid #f59e0b;
      background: rgba(245, 158, 11, 0.15);
    }
    .warning .toast-icon { color: #f59e0b; }
    .warning .progress-fill { background: #f59e0b; }

    .info {
      border-left: 4px solid #3b82f6;
      background: rgba(59, 130, 246, 0.15);
    }
    .info .toast-icon { color: #3b82f6; }
    .info .progress-fill { background: #3b82f6; }
  `],
    animations: [
        trigger('toastAnimation', [
            transition(':enter', [
                style({ transform: 'translateX(100%)', opacity: 0 }),
                animate('300ms cubic-bezier(0.175, 0.885, 0.32, 1.275)', style({ transform: 'translateX(0)', opacity: 1 }))
            ]),
            transition(':leave', [
                animate('200ms ease-in', style({ transform: 'translateX(100%)', opacity: 0 }))
            ])
        ])
    ]
})
export class ToastComponent {
    toastService = inject(ToastService);
}
