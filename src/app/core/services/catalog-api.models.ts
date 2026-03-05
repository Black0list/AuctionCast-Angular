import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { ProductResponseDTO } from '../models/catalog.models';

@Injectable({ providedIn: 'root' })
export class CatalogApiService {
  constructor(private readonly http: HttpClient) {}

  listActiveProducts() {
    return this.http.get<ApiResponse<ProductResponseDTO[]>>(
      `${environment.apiUrl}/catalog-service/products/my-products`,
    );
  }
}
