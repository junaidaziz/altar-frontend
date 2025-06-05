import { ToastService } from './toast.service';

describe('ToastService', () => {
  it('should emit success messages', (done) => {
    const service = new ToastService();
    service.toast$.subscribe(msg => {
      expect(msg).toEqual({ text: 'ok', type: 'success' });
      done();
    });
    service.showSuccess('ok');
  });

  it('should emit error messages', (done) => {
    const service = new ToastService();
    service.toast$.subscribe(msg => {
      expect(msg).toEqual({ text: 'bad', type: 'error' });
      done();
    });
    service.showError('bad');
  });
});
