import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { environment } from '../environments/environment';
import { map } from 'rxjs/operators'; // Import the map operator

export interface GridResponse {
  grid: string[][];
}

export interface CodeResponse {
  code: string;
}

export interface Payment {
  id?: string;
  name: string;
  amount: number;
  code: string;
  grid: string[][];
  timestamp?: Date;
}

// Ensure this interface correctly includes 'new_payment'
export interface WebSocketMessage {
  type: 'initial_state' | 'update' | 'new_payment';
  grid?: string[][];
  code?: string;
  payment?: Payment;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = environment.apiUrl;
  private wsUrl = environment.wsUrl;
  private websocket!: WebSocketSubject<WebSocketMessage>;

  private realTimeUpdatesSubject = new Subject<WebSocketMessage>();
  public realTimeUpdates$ = this.realTimeUpdatesSubject.asObservable();

  constructor(private http: HttpClient) {
    this.connectWebSocket();
  }

  private connectWebSocket(): void {
    this.websocket = webSocket<WebSocketMessage>(this.wsUrl);

    this.websocket.subscribe({
      next: msg => {
        // Convert timestamp string to Date object for payments if it exists
        // This handles payments received via WebSocket
        if (msg.type === 'new_payment' && msg.payment && typeof msg.payment.timestamp === 'string') {
          msg.payment.timestamp = new Date(msg.payment.timestamp);
        }
        this.realTimeUpdatesSubject.next(msg);
      },
      error: err => {
        console.error('WebSocket error:', err);
        setTimeout(() => this.connectWebSocket(), 5000);
      },
      complete: () => {
        console.log('WebSocket connection completed. Attempting to reconnect...');
        setTimeout(() => this.connectWebSocket(), 5000);
      }
    });
  }

  getGrid(biasChar: string | null = null): Observable<GridResponse> {
    let url = `${this.apiUrl}/api/grid`;
    if (biasChar) {
      url += `?bias=${biasChar}`;
    }
    return this.http.get<GridResponse>(url);
  }

  postCode(grid: string[][]): Observable<CodeResponse> {
    return this.http.post<CodeResponse>(`${this.apiUrl}/api/code`, { grid });
  }

  getPayments(): Observable<Payment[]> {
    return this.http.get<Payment[]>(`${this.apiUrl}/api/payments`).pipe(
      map(payments => payments.map(payment => ({
        ...payment,
        timestamp: payment.timestamp ? new Date(payment.timestamp) : undefined
      })))
    );
  }

  addPayment(payment: Payment): Observable<Payment> {
    return this.http.post<Payment>(`${this.apiUrl}/api/payments`, payment);
  }

  closeWebSocket(): void {
    if (this.websocket) {
      this.websocket.complete();
    }
  }
}
