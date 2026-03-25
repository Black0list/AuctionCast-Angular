import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { ProductResponseDTO } from '../models/catalog.models';
import { CatalogApiService } from './catalog-api.service';

@Injectable({ providedIn: 'root' })
export class CatalogService {
  constructor(private readonly api: CatalogApiService) { }

  listAllProducts(): Observable<ProductResponseDTO[]> {
    return this.api.getProducts().pipe(map((res) => res.data));
  }

  listActiveProducts(): Observable<ProductResponseDTO[]> {
    return this.api.getActiveProducts().pipe(map((res) => res.data));
  }

  listMyProducts(): Observable<ProductResponseDTO[]> {
    return this.api.getMyProducts().pipe(map((res) => res.data));
  }

  getProduct(id: string): Observable<ProductResponseDTO> {
    return this.api.getProductById(id).pipe(map(res => res.data));
  }

  createProduct(formData: FormData): Observable<ProductResponseDTO> {
    return this.api.createProduct(formData).pipe(map(res => res.data));
  }

  updateProduct(id: string, formData: FormData): Observable<ProductResponseDTO> {
    return this.api.updateProduct(id, formData).pipe(map(res => res.data));
  }

  deleteProduct(id: string, hard = false): Observable<void> {
    return this.api.deleteProduct(id, hard).pipe(map(() => void 0));
  }

  getActiveCategories(): Observable<any[]> {
    return this.api.getActiveCategories().pipe(map(res => res.data));
  }

  checkOwnership(productId: string, userId: string): Observable<boolean> {
    return this.api.isProductOwner(productId, userId).pipe(map(res => res.data));
  }
}
