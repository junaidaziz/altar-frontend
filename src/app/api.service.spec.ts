import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ApiService } from './api.service';
import { environment } from '../environments/environment';

describe('ApiService', () => {
  let service: ApiService;
  let httpMock: HttpTestingController;
  const OriginalEventSource = (window as any).EventSource;
  class MockEventSource {
    constructor(url: string) {}
    close() {}
    onmessage: any;
    onerror: any;
  }

  beforeEach(() => {
    (window as any).EventSource = MockEventSource as any;
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ApiService]
    });
    service = TestBed.inject(ApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    (window as any).EventSource = OriginalEventSource;
  });

  it('should request grid without bias', () => {
    service.getGrid().subscribe();
    const req = httpMock.expectOne(`${environment.apiUrl}/api/grid`);
    expect(req.request.method).toBe('GET');
  });

  it('should request grid with bias', () => {
    service.getGrid('a').subscribe();
    const req = httpMock.expectOne(`${environment.apiUrl}/api/grid?bias=a`);
    expect(req.request.method).toBe('GET');
  });
});
