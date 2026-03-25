import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { ProductResponseDTO } from '../models/catalog.models';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CatalogApiService {
    private readonly baseUrl = `${environment.apiUrl}/catalog-service`;

    constructor(private readonly http: HttpClient) { }

    getProducts(): Observable<ApiResponse<ProductResponseDTO[]>> {
        return this.http.get<ApiResponse<ProductResponseDTO[]>>(`${this.baseUrl}/products`);
    }

    getActiveProducts(): Observable<ApiResponse<ProductResponseDTO[]>> {
        return this.http.get<ApiResponse<ProductResponseDTO[]>>(`${this.baseUrl}/products/active`);
    }

    getMyProducts(): Observable<ApiResponse<ProductResponseDTO[]>> {
        return this.http.get<ApiResponse<ProductResponseDTO[]>>(`${this.baseUrl}/products/my-products`);
    }

    getProductById(id: string): Observable<ApiResponse<ProductResponseDTO>> {
        return this.http.get<ApiResponse<ProductResponseDTO>>(`${this.baseUrl}/products/${id}`);
    }

    createProduct(data: FormData): Observable<ApiResponse<ProductResponseDTO>> {
        return this.http.post<ApiResponse<ProductResponseDTO>>(`${this.baseUrl}/products`, data);
    }

    updateProduct(id: string, data: FormData): Observable<ApiResponse<ProductResponseDTO>> {
        return this.http.put<ApiResponse<ProductResponseDTO>>(`${this.baseUrl}/products/${id}`, data);
    }

    deleteProduct(id: string, hard = false): Observable<ApiResponse<void>> {
        const params = new HttpParams().set('hard', hard.toString());
        return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/products/${id}`, { params });
    }

    getActiveCategories(): Observable<ApiResponse<any[]>> {
        return this.http.get<ApiResponse<any[]>>(`${this.baseUrl}/categories/active`);
    }

    isProductOwner(productId: string, userId: string): Observable<ApiResponse<boolean>> {
        return this.http.get<ApiResponse<boolean>>(`${this.baseUrl}/products/${productId}/isProductOwner/${userId}`);
    }
}
