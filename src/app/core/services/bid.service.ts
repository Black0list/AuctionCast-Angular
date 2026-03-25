import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { BidResponse, PlaceBidRequest } from '../models/bid.models';

@Injectable({
    providedIn: 'root'
})
export class BidService {
    private apiUrl = `${environment.apiUrl}/core-service/bids`;

    constructor(private http: HttpClient) { }

    placeBid(auctionId: string, amount: number): Observable<BidResponse> {
        const body: PlaceBidRequest = { auctionId, amount };
        return this.http.post<ApiResponse<BidResponse>>(this.apiUrl, body).pipe(
            map(res => res.data)
        );
    }
}
