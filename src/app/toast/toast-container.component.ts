import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, ToastMessage } from './toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      <div *ngFor="let toast of toasts" class="toast" [class.success]="toast.type==='success'" [class.error]="toast.type==='error'">
        {{ toast.text }}
      </div>
    </div>
  `,
  styleUrls: ['./toast-container.component.css']
})
export class ToastContainerComponent implements OnInit {
  toasts: ToastMessage[] = [];

  constructor(private toastService: ToastService) {}

  ngOnInit(): void {
    this.toastService.toast$.subscribe(toast => {
      this.toasts.push(toast);
      setTimeout(() => this.toasts.shift(), 3000);
    });
  }
}
