import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SubirPage } from './subir.page';

describe('SubirPage', () => {
  let component: SubirPage;
  let fixture: ComponentFixture<SubirPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(SubirPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
