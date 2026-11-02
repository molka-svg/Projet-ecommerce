import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { AdminProductFormComponent } from './admin-product-form';

describe('AdminProductFormComponent', () => {
  let fixture: ComponentFixture<AdminProductFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminProductFormComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([{ path: '**', children: [] }])],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminProductFormComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});
