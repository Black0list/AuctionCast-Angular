import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { UserMe } from '../models/auth.models';
import { AuctionResponse } from '../models/auction.models';
import { OrderResponse, OrderStatus } from '../models/order.models';
import { OrderPublicResponse } from './order.service';

export interface AdminUser extends UserMe {
    isActive: boolean;
    lastLoginAt?: string;
}

@Injectable({ providedIn: 'root' })
export class AdminService {
    private readonly http = inject(HttpClient);
    private readonly baseUrl = `${environment.apiUrl}/user-service/admin`;

    getUsers(): Observable<AdminUser[]> {
        return this.http.get<ApiResponse<AdminUser[]>>(`${this.baseUrl}/users`).pipe(
            map(res => res.data)
        );
    }

    approveSeller(userId: string): Observable<void> {
        return this.http.post<ApiResponse<void>>(`${this.baseUrl}/users/${userId}/approve-seller`, {}).pipe(
            map(() => void 0)
        );
    }

    rejectSeller(userId: string): Observable<void> {
        return this.http.post<ApiResponse<void>>(`${this.baseUrl}/users/${userId}/reject-seller`, {}).pipe(
            map(() => void 0)
        );
    }

    deleteUser(userId: string, hard = false): Observable<void> {
        return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/users/${userId}?hardDelete=${hard}`).pipe(
            map(() => void 0)
        );
    }

    getAuctions(): Observable<AuctionResponse[]> {
        return this.http.get<ApiResponse<AuctionResponse[]>>(`${environment.apiUrl}/core-service/auctions/admin`).pipe(
            map(res => res.data)
        );
    }

    getOrders(): Observable<OrderPublicResponse[]> {
        return this.http.get<ApiResponse<OrderPublicResponse[]>>(`${environment.apiUrl}/core-service/orders/admin`).pipe(
            map(res => res.data)
        );
    }

    getDashboardStats(): Observable<any> {
        return this.http.get<ApiResponse<any>>(`${environment.apiUrl}/core-service/auctions/admin/stats`).pipe(
            map(res => res.data)
        );
    }

    updateUserStatus(userId: string, isActive: boolean): Observable<void> {
        return this.http.patch<ApiResponse<void>>(`${this.baseUrl}/users/${userId}/status?isActive=${isActive}`, {}).pipe(
            map(() => void 0)
        );
    }
}
