import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import {
    AuctionResponse,
    CreateAuctionRequest,
    ScheduleAuctionRequest,
    UpdateAuctionRequest
} from '../models/auction.models';

@Injectable({
    providedIn: 'root'
})
export class AuctionService {
    private apiUrl = `${environment.apiUrl}/core-service/auctions`;

    constructor(private http: HttpClient) { }

    create(body: CreateAuctionRequest): Observable<AuctionResponse> {
        return this.http.post<ApiResponse<AuctionResponse>>(this.apiUrl, body).pipe(
            map(res => res.data)
        );
    }

    update(id: string, body: UpdateAuctionRequest): Observable<AuctionResponse> {
        return this.http.put<ApiResponse<AuctionResponse>>(`${this.apiUrl}/${id}`, body).pipe(
            map(res => res.data)
        );
    }

    schedule(id: string, body: ScheduleAuctionRequest): Observable<AuctionResponse> {
        return this.http.post<ApiResponse<AuctionResponse>>(`${this.apiUrl}/${id}/schedule`, body).pipe(
            map(res => res.data)
        );
    }

    publishNow(id: string): Observable<AuctionResponse> {
        return this.http.post<ApiResponse<AuctionResponse>>(`${this.apiUrl}/${id}/publish`, {}).pipe(
            map(res => res.data)
        );
    }

    cancel(id: string): Observable<AuctionResponse> {
        return this.http.post<ApiResponse<AuctionResponse>>(`${this.apiUrl}/${id}/cancel`, {}).pipe(
            map(res => res.data)
        );
    }

    end(id: string): Observable<AuctionResponse> {
        return this.http.post<ApiResponse<AuctionResponse>>(`${this.apiUrl}/${id}/end`, {}).pipe(
            map(res => res.data)
        );
    }

    get(id: string): Observable<AuctionResponse> {
        return this.http.get<ApiResponse<AuctionResponse>>(`${this.apiUrl}/${id}`).pipe(
            map(res => res.data)
        );
    }

    listActive(): Observable<AuctionResponse[]> {
        return this.http.get<ApiResponse<AuctionResponse[]>>(`${this.apiUrl}/active`).pipe(
            map(res => res.data)
        );
    }

    listMyAuctions(): Observable<AuctionResponse[]> {
        return this.http.get<ApiResponse<AuctionResponse[]>>(`${this.apiUrl}/me`).pipe(
            map(res => res.data)
        );
    }
}
