import { Component, OnInit } from '@angular/core';
import { ToastService, ToastData } from '../toast.service';
import { ToastComponent } from '../toast/toast.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-toast-container',
  standalone: true, 
  imports: [CommonModule, ToastComponent],
  templateUrl: './toast-container.component.html',
  styleUrls: ['./toast-container.component.css']
})
export class ToastContainerComponent implements OnInit {
  toasts: ToastData[] = [];

  constructor(private toastService: ToastService) {}

  ngOnInit() {
    this.toastService.toast$.subscribe(toasts => {
      this.toasts = toasts;
    });
  }
  removeToast(toast: ToastData) {
    this.toastService.remove(toast);
}
}
