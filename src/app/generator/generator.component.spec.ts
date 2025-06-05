import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { GeneratorPageComponent } from './generator.component';
import { ApiService } from '../api.service';
import { ToastService } from '../toast/toast.service';
import { of } from 'rxjs';

class MockApiService {
  getGrid = jasmine.createSpy('getGrid').and.returnValue(of({grid: [['a']]}));
  realTimeUpdates$ = of();
}

describe('GeneratorPageComponent', () => {
  let component: GeneratorPageComponent;
  let fixture: ComponentFixture<GeneratorPageComponent>;
  let apiService: MockApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [GeneratorPageComponent],
      providers: [
        { provide: ApiService, useClass: MockApiService },
        { provide: ToastService, useValue: { showSuccess: () => {}, showError: () => {} } }
      ]
    });
    fixture = TestBed.createComponent(GeneratorPageComponent);
    component = fixture.componentInstance;
    apiService = TestBed.inject(ApiService) as unknown as MockApiService;
  });

  it('should reject invalid bias characters', () => {
    component.biasChar = '1';
    component.onGenerateClick();
    expect(apiService.getGrid).not.toHaveBeenCalled();
    expect(component.gridErrorMessage).toBe('Bias character must be a letter a-z.');
    expect(component.biasInputDisabled).toBeFalse();
  });

  it('should lowercase and send valid bias character with cooldown', fakeAsync(() => {
    component.biasChar = 'B';
    component.onGenerateClick();
    expect(apiService.getGrid).toHaveBeenCalledOnceWith('b');
    expect(component.biasInputDisabled).toBeTrue();
    tick(4000);
    expect(component.biasInputDisabled).toBeFalse();
    expect(component.biasChar).toBe('b');
  }));
});
