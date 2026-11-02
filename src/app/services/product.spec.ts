import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ProductService } from './product';
import { ProductService as CoreProductService } from '../core/services/product.service';

describe('legacy services/product', () => {
  it('re-exports the core ProductService', () => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    expect(TestBed.inject(ProductService)).toBe(TestBed.inject(CoreProductService));
  });
});
