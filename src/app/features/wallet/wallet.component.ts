import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { WalletService } from '../../core/services/wallet.service';
import { ToastService } from '../../core/services/toast.service';
import { WalletResponse } from '../../core/models/wallet.models';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-wallet',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
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

              <form [formGroup]="rechargeForm" (ngSubmit)="onRecharge()">
                <div class="mb-4">
                  <label class="form-label text-bidly-accent small fw-bold text-uppercase mb-2">Custom Amount</label>
                  <div class="input-group bidly-input-group">
                    <span class="input-group-text bg-transparent border-0 text-white">$</span>
                    <input type="number" formControlName="amount" class="form-control bidly-input ps-0" placeholder="0.00" step="0.01">
                  </div>
                  <div *ngIf="submitted && f['amount'].errors" class="text-danger small mt-2">
                    Please enter a valid amount (min $0.01).
                  </div>
                </div>

                <button type="submit" [disabled]="rechargeLoading" class="btn btn-bidly w-100 py-3 mt-2 shadow-none">
                  <span *ngIf="rechargeLoading" class="spinner-border spinner-border-sm me-2"></span>
                  <i class="fas fa-bolt me-2" *ngIf="!rechargeLoading"></i>
                  Recharge Now
                </button>
              </form>

              <div class="mt-4 p-3 rounded bg-bidly-surface border border-bidly-border">
                <p class="text-bidly-muted small mb-0">
                  <i class="fas fa-info-circle me-2 text-bidly-accent"></i>
                  All recharges are processed instantly and funds are available for immediate bidding.
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
  `]
})
export class WalletComponent implements OnInit {
  private walletService = inject(WalletService);
  private fb = inject(FormBuilder);
  private toast = inject(ToastService);

  wallet?: WalletResponse;
  loading = true;
  rechargeLoading = false;
  submitted = false;
  presets = [50, 100, 250, 500, 1000, 2500];

  rechargeForm = this.fb.group({
    amount: [100, [Validators.required, Validators.min(0.01)]]
  });

  get f() { return this.rechargeForm.controls; }

  ngOnInit(): void {
    this.walletService.wallet$.subscribe(w => {
      if (w) this.wallet = w;
    });
    this.loadWallet();
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

  onRecharge(): void {
    this.submitted = true;
    if (this.rechargeForm.invalid) return;

    this.rechargeLoading = true;
    const amount = this.rechargeForm.get('amount')?.value as number;

    this.walletService.recharge(amount)
      .pipe(finalize(() => this.rechargeLoading = false))
      .subscribe({
        next: (res) => {
          this.wallet = res;
          this.toast.success(`Successfully recharged ${amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}`);
          this.rechargeForm.patchValue({ amount: 100 });
          this.submitted = false;
        },
        error: (err) => this.toast.error(err?.error?.message || 'Recharge failed')
      });
  }
}
