export enum ToastType {
  INFO = 'info',
  WARNING = 'warning',
  DANGER = 'danger',
  SUCCESS = 'success'
}

export interface Toast {
  id: number;
  message: string;
  type: ToastType;
  duration: number;
}
