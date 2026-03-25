import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { WalletResponse, WalletRechargeRequest } from '../models/wallet.models';

@Injectable({
    providedIn: 'root'
})
export class WalletService {
    private apiUrl = `${environment.apiUrl}/core-service/wallet`;
    private walletSubject = new BehaviorSubject<WalletResponse | null>(null);

    public wallet$ = this.walletSubject.asObservable();
    public balance$ = this.wallet$.pipe(map(w => w?.availableBalance || 0));

    constructor(private http: HttpClient) { }

    getMyWallet(): Observable<WalletResponse> {
        return this.http.get<ApiResponse<WalletResponse>>(`${this.apiUrl}/me`).pipe(
            map(res => res.data),
            tap(wallet => this.walletSubject.next(wallet))
        );
    }

    recharge(amount: number): Observable<WalletResponse> {
        const body: WalletRechargeRequest = { amount };
        return this.http.post<ApiResponse<WalletResponse>>(`${this.apiUrl}/me/recharge`, body).pipe(
            map(res => res.data),
            tap(wallet => this.walletSubject.next(wallet))
        );
    }

    clearWallet(): void {
        this.walletSubject.next(null);
    }
}
