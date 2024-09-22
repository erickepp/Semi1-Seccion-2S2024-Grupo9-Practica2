import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReconocimientoPage } from './reconocimiento.page';

describe('ReconocimientoPage', () => {
  let component: ReconocimientoPage;
  let fixture: ComponentFixture<ReconocimientoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ReconocimientoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
