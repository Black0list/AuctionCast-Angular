import { Component, OnInit, inject, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { WalletService } from '../../core/services/wallet.service';
import { StripeService } from '../../core/services/stripe.service';
import { ToastService } from '../../core/services/toast.service';
import { WalletResponse } from '../../core/models/wallet.models';
import { finalize } from 'rxjs/operators';
import { StripeElements } from '@stripe/stripe-js';

@Component({
  selector: 'app-wallet',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="container py-5">
      <div class="row g-4">
        <!-- Balance Card -->
        <div class="col-lg-5">
          <div class="card bidly-card border-0 shadow-lg h-100 overflow-hidden">
            <div class="card-body p-4 p-md-5 d-flex flex-column justify-content-center text-center">
              <div class="mb-4">
                <div class="bg-bidly-surface rounded-circle d-inline-flex align-items-center justify-content-center p-4 mb-3 border border-bidly-border">
                  <i class="fas fa-wallet text-bidly-accent fs-1"></i>
                </div>
                <h2 class="h4 fw-bold text-white mb-1">Your Balance</h2>
                <p class="text-bidly-muted small">Manage your bidding funds</p>
              </div>

              <div class="display-5 fw-bold text-white mb-2">
                {{ wallet ? (wallet.availableBalance | currency) : '$0.00' }}
              </div>

              <div *ngIf="wallet?.reservedBalance && wallet!.reservedBalance > 0" class="mb-4">
                <span class="badge bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25 px-3 py-2 rounded-pill">
                  <i class="fas fa-lock me-2"></i>{{ wallet!.reservedBalance | currency }} Reserved
                </span>
                <p class="text-bidly-muted x-small mt-2 px-4">Reserved funds are held for your active leading bids and will be released if you are outbid.</p>
              </div>

              <div *ngIf="loading && !wallet" class="py-3">
                <div class="spinner-border text-bidly" role="status"></div>
              </div>
            </div>
            <div class="bg-bidly-surface p-3 text-center border-top border-bidly-border">
               <span class="text-bidly-muted small">Member since {{ wallet?.createdAt | date:'longDate' }}</span>
            </div>
          </div>
        </div>

        <!-- Recharge Card -->
        <div class="col-lg-7">
          <div class="card bidly-card border-0 shadow-lg h-100">
            <div class="card-body p-4 p-md-5">
              <h3 class="h4 fw-bold text-white mb-4">Recharge Funds</h3>

              <div *ngIf="!showStripe" class="animate-fade-in">
                <div class="mb-4">
                  <label class="form-label text-bidly-accent small fw-bold text-uppercase mb-3">Quick Select</label>
                  <div class="row g-2">
                    <div class="col-4" *ngFor="let amount of presets">
                      <button (click)="setAmount(amount)"
                              class="btn btn-bidly-outline w-100 py-2 border-bidly-border"
                              [class.active]="rechargeForm.get('amount')?.value === amount">
                        {{ amount | currency }}
                      </button>
                    </div>
                  </div>
                </div>

                <form [formGroup]="rechargeForm" (ngSubmit)="initiateStripePayment()">
                  <div class="mb-4">
                    <label class="form-label text-bidly-accent small fw-bold text-uppercase mb-2">Custom Amount</label>
                    <div class="input-group bidly-input-group">
                      <span class="input-group-text bg-transparent border-0 text-white">$</span>
                      <input type="number" formControlName="amount" class="form-control bidly-input ps-0" placeholder="0.00" step="0.01">
                    </div>
                    <div *ngIf="submitted && f['amount'].errors" class="text-danger small mt-2">
                      Please enter a valid amount (min $1.00).
                    </div>
                  </div>

                  <button type="submit" [disabled]="rechargeLoading" class="btn btn-bidly w-100 py-3 mt-2 shadow-none">
                    <span *ngIf="rechargeLoading" class="spinner-border spinner-border-sm me-2"></span>
                    <i class="fas fa-bolt me-2" *ngIf="!rechargeLoading"></i>
                    Proceed to Payment
                  </button>

                  <div class="mt-3 pt-3 border-top border-bidly-border text-center">
                    <p class="text-bidly-muted x-small mb-3">Testing purposes only:</p>
                    <button type="button" (click)="demoRecharge()" [disabled]="rechargeLoading"
                            class="btn btn-outline-warning w-100 py-2 shadow-none small">
                      <i class="fas fa-flask me-2"></i>
                      Demo Recharge (Instant)
                    </button>
                  </div>
                </form>
              </div>

              <!-- Stripe Element Container -->
              <div [hidden]="!showStripe" class="animate-fade-in">
                <div class="mb-4 d-flex align-items-center justify-content-between">
                  <div>
                    <h4 class="h5 text-white mb-1">Complete Payment</h4>
                    <p class="text-bidly-muted small mb-0">Recharge amount: {{ f['amount'].value | currency }}</p>
                  </div>
                  <button (click)="cancelStripe()" class="btn btn-link text-bidly-muted p-0 text-decoration-none small">
                    <i class="fas fa-times me-1"></i> Cancel
                  </button>
                </div>

                <div id="payment-element" class="mb-4 p-3 rounded bg-white overflow-hidden">
                  <!-- Stripe Payment Element will be injected here -->
                </div>

                <div id="payment-message" [hidden]="!errorMessage" class="alert alert-danger mb-4 py-2 small">
                  {{ errorMessage }}
                </div>

                <button (click)="confirmPayment()" [disabled]="rechargeLoading" class="btn btn-bidly w-100 py-3 shadow-none">
                  <span *ngIf="rechargeLoading" class="spinner-border spinner-border-sm me-2"></span>
                  <i class="fas fa-shield-alt me-2" *ngIf="!rechargeLoading"></i>
                  Pay Safely Now
                </button>

                <div class="mt-4 text-center">
                  <span class="text-bidly-muted x-small">
                    <i class="fas fa-lock me-1"></i> Secure payment processed by Stripe
                  </span>
                </div>
              </div>

              <div *ngIf="!showStripe" class="mt-4 p-3 rounded bg-bidly-surface border border-bidly-border">
                <p class="text-bidly-muted small mb-0">
                  <i class="fas fa-info-circle me-2 text-bidly-accent"></i>
                  All recharges are processed instantly via Stripe.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .x-small { font-size: 0.75rem; }
    .display-5 { letter-spacing: -1px; }
    .btn-bidly-outline.active { background: var(--bidly-accent); color: white; border-color: var(--bidly-accent) !important; }
    .bidly-input-group { background: var(--bidly-surface-2); border-radius: 8px; border: 1px solid var(--bidly-border); }
    .bidly-input-group .input-group-text { color: var(--bidly-muted) !important; }
    .bidly-input-group .form-control { border: none !important; box-shadow: none !important; }
    .animate-fade-in { animation: fadeIn 0.3s ease-out; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    #payment-element { min-height: 200px; }
  `]
})
export class WalletComponent implements OnInit {
  private walletService = inject(WalletService);
  private stripeService = inject(StripeService);
  private fb = inject(FormBuilder);
  private toast = inject(ToastService);
  private route = inject(ActivatedRoute);

  wallet?: WalletResponse;
  loading = true;
  rechargeLoading = false;
  submitted = false;
  presets = [50, 100, 250, 500, 1000, 2500];

  // Stripe state
  showStripe = false;
  elements?: StripeElements;
  errorMessage?: string;

  rechargeForm = this.fb.group({
    amount: [100, [Validators.required, Validators.min(1.00)]]
  });

  get f() { return this.rechargeForm.controls; }

  ngOnInit(): void {
    this.walletService.wallet$.subscribe(w => {
      if (w) this.wallet = w;
    });
    this.loadWallet();

    this.route.queryParams.subscribe(params => {
      if (params['payment_intent_return'] === 'true') {
        this.verifyPaymentStatus(params['payment_intent'], params['payment_intent_client_secret']);
      }
    });
  }

  loadWallet(): void {
    this.loading = true;
    this.walletService.getMyWallet()
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        error: () => this.toast.error('Failed to load wallet data')
      });
  }

  setAmount(amount: number): void {
    this.rechargeForm.patchValue({ amount });
  }

  demoRecharge(): void {
    this.submitted = true;
    if (this.rechargeForm.invalid) return;

    this.rechargeLoading = true;
    const amount = this.rechargeForm.get('amount')?.value as number;

    this.walletService.recharge(amount)
      .pipe(finalize(() => this.rechargeLoading = false))
      .subscribe({
        next: () => {
          this.toast.success('Demo recharge successful!');
          this.loadWallet();
        },
        error: (err) => this.toast.error(err?.error?.message || 'Demo recharge failed')
      });
  }

  initiateStripePayment(): void {
    this.submitted = true;
    if (this.rechargeForm.invalid) return;

    this.rechargeLoading = true;
    const amount = this.rechargeForm.get('amount')?.value as number;

    this.stripeService.createPaymentIntent(amount)
      .pipe(finalize(() => this.rechargeLoading = false))
      .subscribe({
        next: (response) => {
          this.showStripe = true;
          this.stripeService.getElements(response.data.clientSecret, response.data.publishableKey)
            .subscribe({
              next: (elements) => {
                this.elements = elements;
                const paymentElement = elements.create('payment');
                setTimeout(() => {
                  paymentElement.mount('#payment-element');
                }, 0);
              },
              error: (err) => this.toast.error('Failed to load Stripe Elements')
            });
        },
        error: (err) => this.toast.error(err?.error?.message || 'Failed to initiate payment')
      });
  }

  confirmPayment(): void {
    if (!this.elements) return;

    this.rechargeLoading = true;
    this.stripeService.confirmPayment(this.elements)
      .subscribe({
        next: (result) => {
          if (result.error) {
            this.errorMessage = result.error.message;
            this.rechargeLoading = false;
          }
          // Redirect handled by Stripe
        },
        error: (err) => {
          this.errorMessage = 'An unexpected error occurred.';
          this.rechargeLoading = false;
        }
      });
  }

  cancelStripe(): void {
    this.showStripe = false;
    this.errorMessage = undefined;
    this.elements = undefined;
  }

  private verifyPaymentStatus(id: string, secret: string): void {
    // This is essentially waiting for the webhook, but we can also poll or show a success message based on URL params
    this.toast.info('Processing your payment...');
    // The webhook will handle the wallet update.
    // We just need to reload the wallet data after a short delay.
    setTimeout(() => this.loadWallet(), 3000);
  }
}
