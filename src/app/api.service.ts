import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { environment } from '../environments/environment';
import { map } from 'rxjs/operators';

export interface GridResponse {
  grid: string[][];
  code: string;
}

export interface Payment {
  id?: string;
  name: string;
  amount: number;
  code: string;
  grid: { cells: string[] }[];
  gridSnippet?: string;
  timestamp?: Date;
}

export interface WebSocketMessage {
  type: 'initial_state' | 'update' | 'new_payment';
  grid?: string[][];
  code?: string;
  payment?: Payment & { timestamp: { _seconds: number; _nanoseconds: number } | Date };
}

@Injectable({
  providedIn: 'root',
})
export class ApiService implements OnDestroy {
  private apiUrl = environment.apiUrl;
  private gridEventSource!: EventSource;
  private paymentsEventSource!: EventSource;

  private realTimeUpdatesSubject = new Subject<WebSocketMessage>();
  public realTimeUpdates$ = this.realTimeUpdatesSubject.asObservable();

  constructor(private http: HttpClient) {
    this.connectSSE();
  }

  private connectSSE(): void {
    this.gridEventSource = new EventSource(`${this.apiUrl}/api/grid/stream`);
    this.gridEventSource.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data) as WebSocketMessage;
        this.realTimeUpdatesSubject.next(payload);
      } catch {
        // ignore parse errors
      }
    };
    this.gridEventSource.onerror = () => {
      this.gridEventSource.close();
    };

    this.paymentsEventSource = new EventSource(
      `${this.apiUrl}/api/payments/stream`
    );
    this.paymentsEventSource.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data) as WebSocketMessage;
        this.realTimeUpdatesSubject.next(payload);
      } catch {
        // ignore parse errors
      }
    };
    this.paymentsEventSource.onerror = () => {
      this.paymentsEventSource.close();
    };
  }

  getGrid(biasChar: string | null = null): Observable<GridResponse> {
    let url = `${this.apiUrl}/api/grid`;
    if (biasChar) {
      url += `?bias=${biasChar}`;
    }
    return this.http.get<GridResponse>(url);
  }

  postCode(grid: string[][]): Observable<{ code: string }> {
    return this.http.post<{ code: string }>(`${this.apiUrl}/api/code`, { grid });
  }

  getPayments(): Observable<Payment[]> {
    return this.http.get<any[]>(`${this.apiUrl}/api/payments`).pipe(
      map((payments) =>
        payments.map((p) => {
          let date: Date | undefined;
          if (
            p.timestamp &&
            typeof p.timestamp === 'object' &&
            '_seconds' in p.timestamp &&
            '_nanoseconds' in p.timestamp
          ) {
            const ts = p.timestamp as any;
            date = new Date(ts._seconds * 1000 + ts._nanoseconds / 1e6);
          }
          return {
            ...p,
            timestamp: date,
          } as Payment;
        })
      )
    );
  }

  addPayment(payment: Payment): Observable<Payment> {
    return this.http.post<Payment>(`${this.apiUrl}/api/payments`, payment);
  }

  ngOnDestroy(): void {
    this.gridEventSource?.close();
    this.paymentsEventSource?.close();
  }
}
