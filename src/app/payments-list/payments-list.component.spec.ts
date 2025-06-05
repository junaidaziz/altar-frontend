import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { PaymentsListComponent } from './payments-list.component';
import { ApiService, Payment } from '../api.service';
import { ToastService } from '../toast/toast.service';

class MockApiService {
  getPayments = jasmine.createSpy('getPayments').and.returnValue(of([] as Payment[]));
  realTimeUpdates$ = of();
}

describe('PaymentsListComponent', () => {
  let component: PaymentsListComponent;
  let fixture: ComponentFixture<PaymentsListComponent>;
  let apiService: MockApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [PaymentsListComponent],
      providers: [
        { provide: ApiService, useClass: MockApiService },
        { provide: ToastService, useValue: { showSuccess: () => {}, showError: () => {} } }
      ]
    });
    fixture = TestBed.createComponent(PaymentsListComponent);
    component = fixture.componentInstance;
    apiService = TestBed.inject(ApiService) as unknown as MockApiService;
  });

  it('should load payments on init', () => {
    component.ngOnInit();
    expect(apiService.getPayments).toHaveBeenCalled();
  });
});
