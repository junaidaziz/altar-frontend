import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, GridResponse, WebSocketMessage } from '../api.service';
import { ToastService } from '../toast/toast.service';
import { Subscription } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-generator-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
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
            (keyup.enter)="onGenerateClick()"
          />
        </div>
        <div class="live-status">
          <span class="live-dot" [class.active]="liveIndicator"></span> LIVE
        </div>
        <div class="code-display">
          YOUR CODE: {{ code }}
        </div>
        <button (click)="onGenerateClick()" [disabled]="biasInputDisabled">
          GENERATE 2D GRID
        </button>
      </div>
      <div *ngIf="gridErrorMessage" class="error-message">
        {{ gridErrorMessage }}
      </div>

      <div class="grid-container">
        <div class="grid-row" *ngFor="let rowObj of grid; let i = index">
          <div class="grid-cell" *ngFor="let char of rowObj.cells; let j = index">
            {{ char }}
          </div>
        </div>
      </div>

      <hr />

      <h2>Add Payment</h2>
      <div class="payments-form">
        <input
          type="text"
          placeholder="Payment Name"
          [(ngModel)]="newPaymentName"
        />
        <input
          type="number"
          placeholder="Amount"
          [(ngModel)]="newPaymentAmount"
        />
        <button (click)="addPayment()">+ ADD</button>
      </div>
      <div *ngIf="paymentErrorMessage" class="error-message">
        {{ paymentErrorMessage }}
      </div>

      <div *ngIf="lastPaymentGridSnippet" class="snippet-display">
        Saved grid snippet: {{ lastPaymentGridSnippet }}
      </div>
    </div>
  `,
  styleUrls: ['../app.component.css'],
})
export class GeneratorPageComponent implements OnInit, OnDestroy {
  grid: { cells: string[] }[] = [];
  code: string = '00';
  liveIndicator: boolean = false;

  biasChar: string = '';
  biasInputDisabled: boolean = false;
  private biasTimer!: ReturnType<typeof setTimeout>;

  newPaymentName: string = '';
  newPaymentAmount: number | null = null;

  paymentErrorMessage: string | null = null;
  gridErrorMessage: string | null = null;

  lastPaymentGridSnippet: string | null = null;

  private realTimeUpdatesSubscription!: Subscription;

  constructor(
    private apiService: ApiService,
    private toastService: ToastService,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    this.realTimeUpdatesSubscription = this.apiService.realTimeUpdates$.subscribe(
      (message: WebSocketMessage) => {
        const gridData = message.grid;
        const codeData = message.code;
        if (
          (message.type === 'update' || message.type === 'initial_state') &&
          Array.isArray(gridData) &&
          typeof codeData === 'string'
        ) {
          this.ngZone.run(() => {
            this.grid = gridData.map((row) => ({ cells: row }));
            this.code = codeData;
            this.flashLiveIndicator();
            this.gridErrorMessage = null;
          });
        }
      },
      (err) => {
        console.error('Error receiving real-time grid updates:', err);
        this.ngZone.run(() => {
          this.gridErrorMessage =
            'Real-time updates disconnected. Please ensure backend server is running.';
        });
      }
    );

    this.fetchAndUpdateGrid(false);
  }

  ngOnDestroy(): void {
    if (this.realTimeUpdatesSubscription) {
      this.realTimeUpdatesSubscription.unsubscribe();
    }
    clearTimeout(this.biasTimer);
  }

  onGenerateClick(): void {
    this.gridErrorMessage = null;

    if (this.biasChar && !/^[a-z]$/i.test(this.biasChar)) {
      this.gridErrorMessage = 'Bias character must be a letter a–z.';
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

    this.fetchAndUpdateGrid(true);
  }

  private fetchAndUpdateGrid(showToast: boolean): void {
    this.apiService.getGrid(this.biasChar || null).subscribe({
      next: (response: GridResponse) => {
        this.ngZone.run(() => {
          this.grid = response.grid.map((row) => ({ cells: row }));
          this.code = response.code;
          this.flashLiveIndicator();
          if (showToast) {
            this.toastService.showSuccess('Grid data & code loaded');
          }
        });
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error fetching grid via HTTP:', err);
        this.ngZone.run(() => {
          if (err.status === 0) {
            this.gridErrorMessage =
              'Could not connect to the backend server. Please ensure it is running.';
          } else if (err.error && err.error.error) {
            this.gridErrorMessage = `Server Error: ${err.error.error}`;
          } else {
            this.gridErrorMessage =
              'An unexpected error occurred while generating grid.';
          }
          this.toastService.showError(this.gridErrorMessage);
        });
      },
    });
  }

  addPayment(): void {
    this.paymentErrorMessage = null;

    if (this.grid.length === 0) {
      this.paymentErrorMessage =
        'No grid data available. Cannot save payment.';
      this.toastService.showError(this.paymentErrorMessage);
      return;
    }
    if (!this.newPaymentName.trim()) {
      this.paymentErrorMessage = 'Payment Name cannot be empty.';
      return;
    }
    if (this.newPaymentAmount === null || this.newPaymentAmount <= 0) {
      this.paymentErrorMessage = 'Amount must be a positive number.';
      return;
    }

    const flatChars = this.grid.flatMap((r) => r.cells);
    const snippetChars = flatChars.slice(0, 10);
    const gridSnippet = snippetChars.join('');

    const paymentToAdd: any = {
      name: this.newPaymentName.trim(),
      amount: this.newPaymentAmount,
      code: this.code,
      grid: this.grid,
      gridSnippet,
      timestamp: new Date(),
    };

    this.apiService.addPayment(paymentToAdd).subscribe({
      next: (addedPayment: any) => {
        this.newPaymentName = '';
        this.newPaymentAmount = null;
        this.paymentErrorMessage = null;
        this.lastPaymentGridSnippet = gridSnippet;
        this.toastService.showSuccess('Payment added successfully');
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error adding payment:', err);
        this.ngZone.run(() => {
          if (err.status === 0) {
            this.paymentErrorMessage =
              'Could not connect to the backend server. Please ensure it is running.';
          } else if (err.error && err.error.error) {
            this.paymentErrorMessage = `Server Error: ${err.error.error}`;
          } else {
            this.paymentErrorMessage =
              'An unexpected error occurred while adding payment.';
          }
          this.toastService.showError(this.paymentErrorMessage);
        });
      },
    });
  }

  private flashLiveIndicator(): void {
    this.liveIndicator = true;
    setTimeout(() => (this.liveIndicator = false), 300);
  }
}
