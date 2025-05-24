// src/app/app.component.ts

import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { ApiService, GridResponse, Payment, WebSocketMessage } from './api.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    FormsModule
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'Altar.io Full-Stack Exercise';

  grid: string[][] = [];
  code: string = '00';
  liveIndicator: boolean = false;

  biasChar: string = '';
  biasInputDisabled: boolean = false;
  private biasTimer: any;

  newPaymentName: string = '';
  newPaymentAmount: number | null = null;

  payments: Payment[] = [];

  private realTimeUpdatesSubscription!: Subscription;

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.realTimeUpdatesSubscription = this.apiService.realTimeUpdates$.subscribe({
      next: (message: WebSocketMessage) => {
        this.grid = message.grid;
        this.code = message.code;
        this.liveIndicator = true;
        setTimeout(() => this.liveIndicator = false, 300);
      },
      error: (err) => console.error('Error receiving real-time updates:', err),
      complete: () => console.log('Real-time updates completed.')
    });

    this.loadPayments();
  }

  ngOnDestroy(): void {
    if (this.realTimeUpdatesSubscription) {
      this.realTimeUpdatesSubscription.unsubscribe();
    }
    this.apiService.closeWebSocket();
  }

  /**
   * Generates a new grid using optional bias input.
   */
  generateGridWithBias(): void {
    this.biasInputDisabled = true;
    clearTimeout(this.biasTimer);
    this.biasTimer = setTimeout(() => {
      this.biasInputDisabled = false;
      this.biasChar = '';
    }, 4000);

    this.apiService.getGrid(this.biasChar || null).subscribe({
      next: (response: GridResponse) => {
        this.grid = response.grid;
        console.log('Grid generated via button:', response.grid);
      },
      error: (err) => console.error('Error generating grid:', err)
    });
  }

  /**
   * Submits a new payment entry with current grid and code.
   */
  addPayment(): void {
    if (!this.newPaymentName || this.newPaymentAmount === null || this.newPaymentAmount <= 0) {
      alert('Please enter a valid payment name and amount.');
      return;
    }

    const paymentToAdd: Payment = {
      name: this.newPaymentName,
      amount: this.newPaymentAmount,
      code: this.code,
      grid: this.grid
    };

    this.apiService.addPayment(paymentToAdd).subscribe({
      next: (addedPayment: Payment) => {
        console.log('Payment added:', addedPayment);
        this.loadPayments();
        this.newPaymentName = '';
        this.newPaymentAmount = null;
      },
      error: (err) => console.error('Error adding payment:', err)
    });
  }

  /**
   * Fetches all stored payments from backend.
   */
  loadPayments(): void {
    this.apiService.getPayments().subscribe({
      next: (payments: Payment[]) => {
        this.payments = payments;
        console.log('Payments loaded:', payments);
      },
      error: (err) => console.error('Error loading payments:', err)
    });
  }
}
