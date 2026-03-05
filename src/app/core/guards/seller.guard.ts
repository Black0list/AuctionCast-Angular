import { Component, Injectable, inject } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { map, Observable, take } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SellerGuard implements CanActivate {
    private auth = inject(AuthService);
    private router = inject(Router);

    canActivate(): Observable<boolean> {
        if (!this.auth.isLoggedIn()) {
            this.router.navigate(['/login']);
            return new Observable(obs => { obs.next(false); obs.complete(); });
        }
        return this.auth.me().pipe(
            take(1),
            map(user => {
                // Simple logic for now: all logged in users can access seller features
                // In a real app, we'd check for a specific role or sellerStatus
                return true;
            })
        );
    }
}
