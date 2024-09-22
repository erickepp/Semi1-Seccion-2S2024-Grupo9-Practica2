import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ExtraerPage } from './extraer.page';

describe('ExtraerPage', () => {
  let component: ExtraerPage;
  let fixture: ComponentFixture<ExtraerPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ExtraerPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
