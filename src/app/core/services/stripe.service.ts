import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { loadStripe, Stripe, StripeElements } from '@stripe/stripe-js';
import { environment } from '../../../environments/environment';
import { Observable, from, switchMap, map } from 'rxjs';
import { ApiResponse } from '../models/api-response.model';

interface PaymentIntentResponse {
  clientSecret: string;
  publishableKey: string;
}

@Injectable({
  providedIn: 'root'
})
export class StripeService {
  private stripePromise?: Promise<Stripe | null>;
  private currentKey?: string;

  constructor(private http: HttpClient) {}

  initializeStripe(publishableKey: string) {
    if (!publishableKey) return;
    
    if (!this.stripePromise || this.currentKey !== publishableKey) {
      console.log('Initializing Stripe with key:', publishableKey.substring(0, 10) + '...');
      this.currentKey = publishableKey;
      this.stripePromise = loadStripe(publishableKey);
    }
  }

  createPaymentIntent(amount: number): Observable<ApiResponse<PaymentIntentResponse>> {
    return this.http.post<ApiResponse<PaymentIntentResponse>>(`${environment.apiUrl}/core-service/stripe/create-payment-intent`, { amount });
  }

  getElements(clientSecret: string, publishableKey: string): Observable<StripeElements> {
    this.initializeStripe(publishableKey);
    return from(this.stripePromise!).pipe(
      map(stripe => {
        if (!stripe) throw new Error('Stripe failed to load');
        return stripe.elements({ clientSecret });
      })
    );
  }

  confirmPayment(elements: StripeElements): Observable<any> {
    return from(this.stripePromise!).pipe(
      switchMap(stripe => {
        if (!stripe) throw new Error('Stripe failed to load');
        return from(stripe.confirmPayment({
          elements,
          confirmParams: {
            return_url: `${window.location.origin}/app/wallet?payment_intent_return=true`,
          },
        }));
      })
    );
  }
}
