import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { OrderResponse, OrderStatus } from '../models/order.models';

export interface OrderPublicResponse {
    id: string;
    createdAt: string;
    amount: number;
    status: OrderStatus;
    shippingFullName: string;
    shippingAddress: string;
    shippingCity: string;
    shippingCountry: string;
    carrier?: string;
    trackingNumber?: string;
    product: {
        id: string;
        title: string;
        coverImage?: string;
    };
    seller?: {
        id: string;
        firstName: string;
        lastName: string;
    };
    buyer?: {
        id: string;
        firstName: string;
        lastName: string;
    };
}

@Injectable({ providedIn: 'root' })
export class OrderService {
    private readonly http = inject(HttpClient);
    private readonly apiUrl = `${environment.apiUrl}/core-service/orders`;

    myPurchases(): Observable<OrderPublicResponse[]> {
        return this.http.get<ApiResponse<OrderPublicResponse[]>>(`${this.apiUrl}/me/purchases`).pipe(
            map(res => res.data)
        );
    }

    mySales(): Observable<OrderPublicResponse[]> {
        return this.http.get<ApiResponse<OrderPublicResponse[]>>(`${this.apiUrl}/me/sales`).pipe(
            map(res => res.data)
        );
    }

    get(id: string): Observable<OrderPublicResponse> {
        return this.http.get<ApiResponse<OrderPublicResponse>>(`${this.apiUrl}/${id}`).pipe(
            map(res => res.data)
        );
    }

    ship(id: string, carrier: string, trackingNumber: string): Observable<OrderPublicResponse> {
        return this.http.post<ApiResponse<OrderPublicResponse>>(`${this.apiUrl}/${id}/ship`, { carrier, trackingNumber }).pipe(
            map(res => res.data)
        );
    }

    confirmDelivery(id: string): Observable<OrderPublicResponse> {
        return this.http.post<ApiResponse<OrderPublicResponse>>(`${this.apiUrl}/${id}/deliver`, {}).pipe(
            map(res => res.data)
        );
    }
}
