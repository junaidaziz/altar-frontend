// src/app/api.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket'; // For RxJS WebSocket
import { environment } from '../environments/environment'; // Import environment variables

// Define interfaces for data structures
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
  timestamp?: Date; // Optional for new payments
}

export interface WebSocketMessage {
  type: 'initial_state' | 'update';
  grid: string[][];
  code: string;
}

@Injectable({
  providedIn: 'root' // Makes the service a singleton and available throughout the app
})
export class ApiService {
  private apiUrl = environment.apiUrl; // HTTP API
  private wsUrl = environment.wsUrl;   // WebSocket
  private websocket!: WebSocketSubject<WebSocketMessage>;

  // Subject to push real-time updates to components
  private realTimeUpdatesSubject = new Subject<WebSocketMessage>();
  public realTimeUpdates$ = this.realTimeUpdatesSubject.asObservable();

  constructor(private http: HttpClient) {
    this.connectWebSocket(); // Establish WebSocket connection when service is initialized
  }

  // Connects to the WebSocket server
  private connectWebSocket(): void {
    // Create a WebSocketSubject using the webSocket factory from RxJS
    this.websocket = webSocket<WebSocketMessage>(this.wsUrl);

    // Subscribe to messages from the WebSocket
    this.websocket.subscribe({
      next: msg => {
        // When a message is received, push it to the realTimeUpdatesSubject
        this.realTimeUpdatesSubject.next(msg);
      },
      error: err => {
        console.error('WebSocket error:', err);
        // Implement reconnection logic here if needed
        setTimeout(() => this.connectWebSocket(), 5000); // Attempt to reconnect after 5 seconds
      },
      complete: () => {
        console.log('WebSocket connection completed. Attempting to reconnect...');
        // Implement reconnection logic here
        setTimeout(() => this.connectWebSocket(), 5000); // Attempt to reconnect after 5 seconds
      }
    });
  }

  /**
   * Fetches the 10x10 grid from the backend.
   * @param biasChar Optional character to bias the grid generation.
   * @returns An Observable of GridResponse.
   */
  getGrid(biasChar: string | null = null): Observable<GridResponse> {
    let url = `${this.apiUrl}/api/grid`;
    if (biasChar) {
      url += `?bias=${biasChar}`; // Add bias query parameter if provided
    }
    return this.http.get<GridResponse>(url);
  }

  /**
   * Posts the current grid to the backend to compute the 2-digit code.
   * @param grid The 2D array representing the grid.
   * @returns An Observable of CodeResponse.
   */
  postCode(grid: string[][]): Observable<CodeResponse> {
    return this.http.post<CodeResponse>(`${this.apiUrl}/api/code`, { grid });
  }

  /**
   * Fetches all payments from the backend.
   * @returns An Observable of an array of Payment objects.
   */
  getPayments(): Observable<Payment[]> {
    return this.http.get<Payment[]>(`${this.apiUrl}/api/payments`);
  }

  /**
   * Adds a new payment to the backend.
   * @param payment The Payment object to add.
   * @returns An Observable of the newly created Payment object.
   */
  addPayment(payment: Payment): Observable<Payment> {
    return this.http.post<Payment>(`${this.apiUrl}/api/payments`, payment);
  }

  // Method to close the WebSocket connection, useful on app shutdown
  closeWebSocket(): void {
    if (this.websocket) {
      this.websocket.complete(); // Close the WebSocket connection
    }
  }
}
