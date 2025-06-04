import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, GridResponse, Payment, WebSocketMessage } from '../api.service';
import { Subscription } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http'; // Import HttpErrorResponse

@Component({
  selector: 'app-generator-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  template: `
    <div class="generator-content">
      <div class="header-controls">
        <div class="character-input">
          <label for="biasChar">CHARACTER</label>
          <input
            id="biasChar"
            type="text"
            maxlength="1"
            [(ngModel)]="biasChar"
            [disabled]="biasInputDisabled"
            placeholder="a-z"
            (keyup.enter)="generateGridWithBias()"
          />
        </div>
        <div class="live-status">
          <span class="live-dot" [class.active]="liveIndicator"></span> LIVE
        </div>
        <div class="code-display">
          YOUR CODE: {{ code }}
        </div>
        <button (click)="generateGridWithBias()" [disabled]="biasInputDisabled">GENERATE 2D GRID</button>
      </div>
      <div *ngIf="gridErrorMessage" class="error-message">
        {{ gridErrorMessage }}
      </div>

      <div class="grid-container">
        <div class="grid-row" *ngFor="let row of grid; let i = index">
          <div class="grid-cell" *ngFor="let char of row; let j = index">
            {{ char }}
          </div>
        </div>
      </div>

      <hr>

      <h2>Add Payment</h2>
      <div class="payments-form">
        <input type="text" placeholder="Payment Name" [(ngModel)]="newPaymentName">
        <input type="number" placeholder="Amount" [(ngModel)]="newPaymentAmount">
        <button (click)="addPayment()">+ ADD</button>
      </div>
      <div *ngIf="paymentErrorMessage" class="error-message">
        {{ paymentErrorMessage }}
      </div>
    </div>
  `,
  styleUrls: ['../app.component.css'] // Re-use the existing CSS for generator-specific elements
})
export class GeneratorPageComponent implements OnInit, OnDestroy {
  grid: string[][] = [];
  code: string = '00';
  liveIndicator: boolean = false;

  biasChar: string = '';
  biasInputDisabled: boolean = false;
  private biasTimer: any;

  newPaymentName: string = '';
  newPaymentAmount: number | null = null;
  paymentErrorMessage: string | null = null; // Property for payment error messages
  gridErrorMessage: string | null = null;    // New property for grid error messages

  private realTimeUpdatesSubscription!: Subscription;

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    // Initial call to generate grid and handle potential server errors on page load
    this.generateGridWithBias(); // This will attempt to fetch a grid and set error if server is down

    this.realTimeUpdatesSubscription = this.apiService.realTimeUpdates$.subscribe({
      next: (message: WebSocketMessage) => {
        if (message.type === 'update') {
          this.grid = message.grid!;
          this.code = message.code!;
          this.liveIndicator = true;
          setTimeout(() => this.liveIndicator = false, 300);
          this.gridErrorMessage = null; // Clear grid error if WebSocket updates start flowing
        } else if (message.type === 'initial_state') {
          this.grid = message.grid!;
          this.code = message.code!;
          this.gridErrorMessage = null; // Clear grid error if initial state is received
        }
      },
      error: (err) => {
        console.error('Error receiving real-time updates:', err);
        // If WebSocket connection fails, also show a grid error message
        this.gridErrorMessage = 'Real-time updates disconnected. Please ensure backend server is running.';
      },
      complete: () => {
        console.log('Real-time updates completed.');
        this.gridErrorMessage = 'Real-time updates completed. Please ensure backend server is running.';
      }
    });
  }

  ngOnDestroy(): void {
    if (this.realTimeUpdatesSubscription) {
      this.realTimeUpdatesSubscription.unsubscribe();
    }
  }

  generateGridWithBias(): void {
    this.gridErrorMessage = null; // Clear previous error messages for grid

    if (this.biasChar && !/^[a-z]$/i.test(this.biasChar)) {
      this.gridErrorMessage = 'Bias character must be a letter a-z.';
      return;
    }

    if (this.biasChar) {
      this.biasChar = this.biasChar.toLowerCase();
    }

    this.biasInputDisabled = true;
    clearTimeout(this.biasTimer);
    this.biasTimer = setTimeout(() => {
      this.biasInputDisabled = false;
    }, 4000);

    this.apiService.getGrid(this.biasChar || null).subscribe({
      next: (response: GridResponse) => {
        console.log('Grid generation request sent via button.');
        this.gridErrorMessage = null; // Clear error on successful response
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error generating grid:', err);
        if (err.status === 0) {
          this.gridErrorMessage = 'Could not connect to the backend server to generate grid. Please ensure the server is running.';
        } else if (err.error && err.error.error) {
          this.gridErrorMessage = `Server Error: ${err.error.error}`;
        } else {
          this.gridErrorMessage = 'An unexpected error occurred while generating grid.';
        }
      }
    });
  }

  addPayment(): void {
    this.paymentErrorMessage = null; // Clear previous error messages for payment

    // Client-side validation
    if (!this.newPaymentName.trim()) {
      this.paymentErrorMessage = 'Payment Name cannot be empty.';
      return;
    }
    if (this.newPaymentAmount === null || this.newPaymentAmount <= 0) {
      this.paymentErrorMessage = 'Amount must be a positive number.';
      return;
    }

    const paymentToAdd: Payment = {
      name: this.newPaymentName.trim(),
      amount: this.newPaymentAmount,
      code: this.code,
      grid: this.grid,
      timestamp: new Date()
    };

    this.apiService.addPayment(paymentToAdd).subscribe({
      next: (addedPayment: Payment) => {
        console.log('Payment added:', addedPayment);
        this.newPaymentName = '';
        this.newPaymentAmount = null;
        this.paymentErrorMessage = null; // Clear error on success
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error adding payment:', err);
        if (err.status === 0) {
          this.paymentErrorMessage = 'Could not connect to the backend server. Please ensure the server is running.';
        } else if (err.error && err.error.error) {
          this.paymentErrorMessage = `Server Error: ${err.error.error}`;
        } else {
          this.paymentErrorMessage = 'An unexpected error occurred while adding payment.';
        }
      }
    });
  }
}
