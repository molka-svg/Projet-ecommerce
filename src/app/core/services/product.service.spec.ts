import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ProductService, mediaUrl } from './product.service';
import { environment } from '../../../environments/environment';

describe('ProductService', () => {
  let service: ProductService;
  let http: HttpTestingController;
  const endpoint = `${environment.apiUrl}/products`;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(ProductService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('builds Strapi filters, sort and pagination', () => {
    service
      .getProducts({ search: ' sac ', category: 'maison', minPrice: 5, sortBy: 'price_asc', page: 2, pageSize: 12 })
      .subscribe();
    const req = http.expectOne((r) => r.url === endpoint);
    const p = req.request.params;
    expect(p.get('filters[name][$containsi]')).toBe('sac');
    expect(p.get('filters[categorie][slug][$eq]')).toBe('maison');
    expect(p.get('filters[price][$gte]')).toBe('5');
    expect(p.get('sort')).toBe('price:asc');
    expect(p.get('pagination[page]')).toBe('2');
    req.flush({ data: [] });
  });

  it('finds a product by numeric id through a filter (Strapi 5)', () => {
    service.getProductByIdOrSlug('12').subscribe();
    const req = http.expectOne((r) => r.url === endpoint);
    expect(req.request.params.get('filters[id][$eq]')).toBe('12');
    req.flush({ data: [] });
  });

  it('finds a product by slug or documentId', () => {
    let name = '';
    service.getProductByIdOrSlug('sac-cabas').subscribe((p) => (name = p?.name ?? ''));
    const req = http.expectOne((r) => r.url === endpoint);
    expect(req.request.params.get('filters[$or][0][slug][$eq]')).toBe('sac-cabas');
    expect(req.request.params.get('filters[$or][1][documentId][$eq]')).toBe('sac-cabas');
    req.flush({ data: [{ id: 1, name: 'Sac cabas', price: 34 }] });
    expect(name).toBe('Sac cabas');
  });

  it('updates and deletes by documentId', () => {
    service.updateProduct('abc', { price: 10 }).subscribe();
    http.expectOne({ method: 'PUT', url: `${endpoint}/abc` }).flush({ data: {} });
    service.deleteProduct('abc').subscribe();
    http.expectOne({ method: 'DELETE', url: `${endpoint}/abc` }).flush(null);
  });

  it('builds absolute media URLs', () => {
    expect(mediaUrl({ url: '/uploads/a.png' })).toBe(`${environment.serverUrl}/uploads/a.png`);
    expect(mediaUrl({ url: 'https://cdn.x/a.png' })).toBe('https://cdn.x/a.png');
    expect(mediaUrl(null)).toBe('');
  });
});
