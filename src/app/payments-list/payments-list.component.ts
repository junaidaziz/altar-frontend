import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ApiService, Payment, WebSocketMessage } from '../api.service';
import { ToastService } from '../toast/toast.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-payments-list',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe
  ],
  template: `
    <div class="payments-container">
      <h2>Payments History</h2>

      <div class="payments-list">
        <table>
          <thead>
            <tr>
              <th>NAME</th>
              <th>AMOUNT</th>
              <th>CODE</th>
              <th>GRID (first 10 chars)</th>
              <th>TIMESTAMP</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let payment of payments">
              <td>{{ payment.name }}</td>
              <td>{{ payment.amount }}</td>
              <td>{{ payment.code }}</td>
              <td>{{ payment.grid[0].slice(0, 10).join('') }}...</td>
              <td>{{ payment.timestamp | date:'short' }}</td>
            </tr>
            <tr *ngIf="payments.length === 0">
              <td colspan="5" style="text-align: center;">No payments added yet.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    /* Basic styling for the payments list page */
    .payments-container {
      font-family: 'Inter', sans-serif;
      max-width: 960px;
      margin: 20px auto;
      padding: 20px;
      background-color: #f9f9f9;
      border-radius: 12px;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }

    h2 {
      text-align: center;
      color: #333;
      margin-bottom: 20px;
    }

    .payments-list table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 20px;
      background-color: #fff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }

    .payments-list th,
    .payments-list td {
      border: 1px solid #eee;
      padding: 12px 15px;
      text-align: left;
    }

    .payments-list th {
      background-color: #f2f2f2;
      font-weight: bold;
      color: #333;
      text-transform: uppercase;
      font-size: 0.9em;
    }

    .payments-list tr:nth-child(even) {
      background-color: #f8f8f8;
    }

    .payments-list tr:hover {
      background-color: #eef;
    }

    /* Responsive adjustments */
    @media (max-width: 768px) {
      .payments-list th,
      .payments-list td {
        padding: 8px 10px; /* Smaller padding on mobile */
        font-size: 0.8em;
      }
    }
  `]
})
export class PaymentsListComponent implements OnInit, OnDestroy {
  payments: Payment[] = [];
  private realTimeUpdatesSubscription!: Subscription;

  constructor(private apiService: ApiService, private toastService: ToastService) {}

  ngOnInit(): void {
    // Load initial payments from the API
    this.loadPayments();

    // Subscribe to real-time updates for new payments
    this.realTimeUpdatesSubscription = this.apiService.realTimeUpdates$.subscribe({
      next: (message: WebSocketMessage) => {
        if (message.type === 'new_payment' && message.payment) {
          // Add new payment to the beginning of the list in real-time
          this.payments.unshift(message.payment);
          console.log('New payment received via WebSocket:', message.payment);
        }
      },
      error: (err) => console.error('Error receiving real-time updates for payments:', err)
    });
  }

  ngOnDestroy(): void {
    // Unsubscribe from WebSocket updates to prevent memory leaks
    if (this.realTimeUpdatesSubscription) {
      this.realTimeUpdatesSubscription.unsubscribe();
    }
  }

  /**
   * Loads the list of payments from the backend.
   */
  loadPayments(): void {
    this.apiService.getPayments().subscribe({
      next: (payments: Payment[]) => {
        this.payments = payments;
        console.log('Payments loaded:', payments);
        this.toastService.showSuccess('Payments loaded');
      },
      error: (err) => {
        console.error('Error loading payments:', err);
        this.toastService.showError('Error loading payments');
      }
    });
  }
}
