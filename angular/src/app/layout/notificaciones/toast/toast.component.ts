import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ToastType } from '../toast.service';

@Component({
  selector: 'app-toast',
  standalone: true, 
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.css']
})
export class ToastComponent {
  @Input() type: ToastType = 'info';
  @Input() message: string = '';
  
  @Output() close = new EventEmitter<void>();
  
  onClose() {
    this.close.emit();
  }

  get bgClass() {
    switch (this.type) {
      case 'info': return 'bg-info';
      case 'warning': return 'bg-warning';
      case 'error': return 'bg-danger';
      case 'success': return 'bg-success';

      case 'info-outline': return 'bg-white border border-info border-2';
      case 'warning-outline': return 'bg-white border border-warning border-2';
      case 'error-outline': return 'bg-white border border-danger border-2';
      case 'success-outline': return 'bg-white border border-success border-2';

      default: return 'bg-secondary';
    }
  }

  get textClass() {
    if (this.type.includes('outline')) {
      if (this.type.startsWith('info')) return 'text-info';
      if (this.type.startsWith('warning')) return 'text-warning';
      if (this.type.startsWith('error')) return 'text-danger';
      if (this.type.startsWith('success')) return 'text-success';
    }
    return 'text-white';
  }

  get iconClass() {
    switch (this.type) {
      case 'info':
      case 'info-outline': return 'bi bi-info-circle';
      case 'warning':
      case 'warning-outline': return 'bi bi-exclamation-triangle';
      case 'error':
      case 'error-outline': return 'bi bi-x-circle';
      case 'success':
      case 'success-outline': return 'bi bi-check-circle';
      default: return 'bi bi-bell';
    }
  }

  get btnClose() {
    if (this.type.includes('outline')) {
      return "btn-close"
    }
    return 'btn-close btn-close-white';
  }
  
}
