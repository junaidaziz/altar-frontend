import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ToastContainerComponent } from './toast-container.component';
import { ToastService } from './toast.service';

class MockToastService {
  toast$ = of({ text: 'hello', type: 'success' });
}

describe('ToastContainerComponent', () => {
  let component: ToastContainerComponent;
  let fixture: ComponentFixture<ToastContainerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ToastContainerComponent],
      providers: [{ provide: ToastService, useClass: MockToastService }]
    });
    fixture = TestBed.createComponent(ToastContainerComponent);
    component = fixture.componentInstance;
  });

  it('should display toasts from the service', () => {
    fixture.detectChanges();
    expect(component.toasts.length).toBe(1);
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.toast')?.textContent).toContain('hello');
  });
});
