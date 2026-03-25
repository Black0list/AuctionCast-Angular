import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuctionService } from '../../../core/services/auction.service';
import { BidService } from '../../../core/services/bid.service';
import { WalletService } from '../../../core/services/wallet.service';
import { ToastService } from '../../../core/services/toast.service';
import { AuctionResponse, AuctionStatus } from '../../../core/models/auction.models';
import { AuthService } from '../../../core/auth/auth.service';
import { MediaUrlPipe } from '../../../shared/pipes/media-url.pipe';
import {
  timer,
  Subscription,
  of,
  fromEvent,
  merge,
  EMPTY
} from 'rxjs';
import {
  switchMap,
  catchError,
  filter,
  map,
  distinctUntilChanged,
  tap
} from 'rxjs/operators';

@Component({
  selector: 'app-live-bidding',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, MediaUrlPipe],
  template: `
    <div class="container py-4" *ngIf="auction">
      <nav aria-label="breadcrumb" class="mb-4">
        <ol class="breadcrumb">
          <li class="breadcrumb-item"><a routerLink="/app/auctions" class="text-bidly-accent text-decoration-none">Auctions</a></li>
          <li class="breadcrumb-item active text-white" aria-current="page">Live Bid: {{ auction.product.title }}</li>
        </ol>
      </nav>

      <div class="row g-4">
        <!-- Main Bidding Section -->
        <div class="col-lg-8">
          <div class="card bidly-card border-0 shadow-lg overflow-hidden position-relative">
            <!-- Live Status Overlay -->
            <div class="position-absolute top-0 end-0 m-4 z-1">
              <span class="badge bg-danger px-3 py-2 rounded-pill shadow-lg animate-pulse" *ngIf="auction.status === 'ACTIVE'">
                <i class="fas fa-circle me-1 small"></i> LIVE
              </span>
              <span class="badge bg-warning px-3 py-2 rounded-pill shadow-lg" *ngIf="auction.status === 'ENDED'">
                <i class="fas fa-flag-checkered me-1 small"></i> ENDED
              </span>
            </div>

            <div class="row g-0">
              <div class="col-md-6">
                <img *ngIf="auction.product?.imageUrls?.length; else placeholder"
                     [src]="auction.product.imageUrls![0].imageUrl | mediaUrl" 
                     class="img-fluid h-100 w-100" [alt]="auction.product.title"
                     style="object-fit: cover; min-height: 400px;">
                <ng-template #placeholder>
                  <div class="h-100 w-100 bg-secondary d-flex justify-content-center align-items-center" style="min-height: 400px;">
                    <i class="fas fa-image text-white opacity-25 fs-1"></i>
                  </div>
                </ng-template>
              </div>
              
              <div class="col-md-6 bg-bidly-surface-2">
                <div class="card-body p-4 p-md-5 d-flex flex-column h-100">
                  <div class="mb-4">
                    <span class="text-bidly-accent x-small fw-bold text-uppercase d-block mb-1">{{ auction.product.categoryName }}</span>
                    <h2 class="h3 fw-bold text-white mb-2">{{ auction.product.title }}</h2>
                    <p class="text-bidly-muted small line-clamp-3">{{ auction.product.description }}</p>
                  </div>

                  <div class="row g-3 mb-4 mt-auto">
                    <div class="col-6">
                      <div class="bg-bidly-surface p-3 rounded border border-bidly-border text-center">
                        <span class="text-bidly-muted x-small d-block mb-1">CURRENT BID</span>
                        <span class="text-bidly-accent fw-bold fs-4">{{ (auction.currentPrice || auction.startPrice) | currency }}</span>
                      </div>
                    </div>
                    <div class="col-6">
                      <div class="bg-bidly-surface p-3 rounded border border-bidly-border text-center" [class.border-danger]="timeRemaining < 15">
                        <span class="text-bidly-muted x-small d-block mb-1">ENDS IN</span>
                        <span class="text-white fw-bold fs-4" [class.text-danger]="timeRemaining < 15">{{ countdownDisplay }}</span>
                      </div>
                    </div>
                  </div>

                  <div class="p-4 rounded-4 shadow-sm" 
                       [class.bg-success-dark]="isLeading" 
                       [class.bg-danger-dark]="!isLeading && auction.bidCount > 0"
                       [class.bg-bidly-surface]="auction.bidCount === 0">
                    <div class="d-flex align-items-center gap-3">
                      <div class="bg-white bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center flex-shrink-0" style="width: 48px; height: 48px;">
                        <i class="fas" [ngClass]="isLeading ? 'fa-medal text-warning' : 'fa-gavel text-white'"></i>
                      </div>
                      <div>
                        <h4 class="h6 fw-bold text-white mb-0" *ngIf="isLeading">You are the current leader!</h4>
                        <h4 class="h6 fw-bold text-white mb-0" *ngIf="!isLeading && auction.bidCount > 0">You are outbid!</h4>
                        <h4 class="h6 fw-bold text-white mb-0" *ngIf="auction.bidCount === 0">Be the first to bid!</h4>
                        <p class="text-white opacity-75 small mb-0" *ngIf="auction.bidCount > 0">
                          {{ auction.bidCount }} bids total {{ auction.winner ? '• Leading: ' + auction.winner.firstName : '' }}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Bidding Controls & Sidebar -->
        <div class="col-lg-4">
          <div class="card bidly-card border-0 shadow-lg h-100">
            <div class="card-body p-4 p-md-5 d-flex flex-column">
              <h3 class="h5 fw-bold text-white mb-4">Place Your Bid</h3>

              <div class="mb-4">
                <div class="alert bg-bidly-surface border-bidly-border d-flex align-items-center gap-3 py-3 px-4">
                  <i class="fas fa-info-circle text-bidly-accent"></i>
                  <div class="small text-bidly-muted">
                    Min Increment: <strong class="text-white">{{ (auction.minIncrement || 1) | currency }}</strong><br>
                    Next minimum bid: <strong class="text-bidly-accent">{{ minNextBid | currency }}</strong>
                  </div>
                </div>
              </div>

              <form [formGroup]="bidForm" (ngSubmit)="onPlaceBid()" class="mb-4">
                 <div class="input-group bidly-input-group mb-3">
                    <span class="input-group-text bg-transparent border-0 text-white shadow-none">$</span>
                    <input type="number" formControlName="amount" class="form-control bidly-input ps-0" placeholder="Enter amount">
                 </div>
                 
                 <div class="row g-2 mb-4">
                   <div class="col-4" *ngFor="let step of [1, 5, 10]">
                     <button type="button" (click)="addAmount(step)" class="btn btn-bidly-outline btn-sm w-100 py-2">
                       +{{ step | currency }}
                     </button>
                   </div>
                 </div>

                 <button type="submit" [disabled]="submitting || !auctionActive" class="btn btn-bidly w-100 py-3 mb-3 h-auto fw-bold">
                   <span *ngIf="submitting" class="spinner-border spinner-border-sm me-2"></span>
                   {{ auctionActive ? 'PLACE BID NOW' : 'AUCTION NOT ACTIVE' }}
                 </button>
                 
                 <p class="text-center x-small text-bidly-muted mb-0">
                    Your bid will reserve {{ bidForm.get('amount')?.value || 0 | currency }} from your wallet.
                 </p>
              </form>

              <div class="mt-auto">
                <div class="d-flex justify-content-between align-items-center p-3 rounded bg-bidly-surface border border-bidly-border">
                  <div class="d-flex align-items-center gap-2">
                    <i class="fas fa-wallet text-bidly-accent"></i>
                    <span class="text-bidly-muted small">Available</span>
                  </div>
                  <span class="text-white fw-bold">{{ balance | currency }}</span>
                </div>
                <a routerLink="/app/wallet" class="btn btn-link btn-sm w-100 mt-2 text-bidly-muted text-decoration-none">Add funds</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div *ngIf="!auction" class="container py-5 text-center">
       <div class="spinner-border text-bidly" role="status"></div>
       <p class="text-bidly-muted mt-3">Connecting to auction server...</p>
    </div>
  `,
  styles: [`
    .x-small { font-size: 0.75rem; letter-spacing: 0.5px; }
    .bg-success-dark { background: rgba(25, 135, 84, 0.2); border: 2px solid var(--bidly-accent); }
    .bg-danger-dark { background: rgba(220, 53, 69, 0.15); border: 1px solid rgba(220, 53, 69, 0.3); }
    .bg-bidly-surface { background: rgba(255,255,255,0.05); }
    .bg-bidly-surface-2 { background: rgba(255,255,255,0.02); }
    .border-bidly-border { border-color: rgba(255,255,255,0.1) !important; }
    .animate-pulse { animation: pulse-red 2s infinite; }
    @keyframes pulse-red {
      0% { transform: scale(0.95); opacity: 0.9; }
      70% { transform: scale(1.05); opacity: 1; }
      100% { transform: scale(0.95); opacity: 0.9; }
    }
    .bidly-input-group { background: var(--bidly-surface-2); border-radius: 8px; border: 1px solid var(--bidly-border); }
    .bidly-input-group .input-group-text { color: var(--bidly-muted) !important; }
    .bidly-input-group .form-control { border: none !important; box-shadow: none !important; font-size: 1.25rem; font-weight: bold; }
    .line-clamp-3 { display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
  `]
})
export class LiveBiddingComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private auctionService = inject(AuctionService);
  private bidService = inject(BidService);
  private walletService = inject(WalletService);
  private authService = inject(AuthService);
  private toast = inject(ToastService);
  private fb = inject(FormBuilder);

  auctionId: string = '';
  auction: AuctionResponse | null = null;
  balance: number = 0;
  timeRemaining: number = 0; // in seconds
  countdownDisplay: string = '00:00:00';

  private pollingSub: Subscription | null = null;
  private visibilitySub: Subscription | null = null;
  private timerSub: Subscription | null = null;

  submitting = false;
  bidForm = this.fb.group({
    amount: [0, [Validators.required, Validators.min(0.01)]]
  });

  get minNextBid(): number {
    if (!this.auction) return 0;
    const current = this.auction.currentPrice || this.auction.startPrice;
    return current + (this.auction.minIncrement || 1);
  }

  get isLeading(): boolean {
    if (!this.auction || !this.auction.winner) return false;
    return this.auction.winner.id === this.authService.getUserId();
  }

  get auctionActive(): boolean {
    return this.auction?.status === 'ACTIVE';
  }

  ngOnInit(): void {
    this.auctionId = this.route.snapshot.paramMap.get('id') || '';

    this.walletService.balance$.subscribe(b => this.balance = b);

    // Start Polling
    this.initIntelligentPolling();

    // Start Countdown internal timer
    this.initCountdown();

    // Setup Visibility Pausing
    this.visibilitySub = fromEvent(document, 'visibilitychange').subscribe(() => {
      this.initIntelligentPolling(); // Restart or pause based on visibility
    });
  }

  ngOnDestroy(): void {
    this.pollingSub?.unsubscribe();
    this.visibilitySub?.unsubscribe();
    this.timerSub?.unsubscribe();
  }

  private initIntelligentPolling(): void {
    if (this.pollingSub) {
      this.pollingSub.unsubscribe();
    }

    if (document.hidden) return; // Pause polling when hidden

    // User requirements:
    // - While ACTIVE: poll every 1s
    // - If < 15s: poll every 500ms
    // - Pause when tab hidden

    const getPollingInterval = () => (this.timeRemaining < 15 && this.timeRemaining > 0) ? 500 : 1000;

    this.pollingSub = timer(0, 1000).pipe(
      map(() => getPollingInterval()),
      distinctUntilChanged(),
      switchMap(interval => timer(0, interval)),
      switchMap(() => this.auctionService.get(this.auctionId).pipe(
        catchError(() => EMPTY)
      )),
      // Stop polling when not ACTIVE
      tap(data => {
        if (data.status !== 'ACTIVE') {
          this.pollingSub?.unsubscribe();
        }
      })
    ).subscribe(data => {
      this.updateAuctionState(data);
    });
  }

  private initCountdown(): void {
    this.timerSub = timer(0, 1000).subscribe(() => {
      this.calculateTimeRemaining();
    });
  }

  private updateAuctionState(data: AuctionResponse): void {
    this.auction = data;
    this.calculateTimeRemaining();

    // Update bid form minimum if empty or lower than min
    const currentVal = this.bidForm.get('amount')?.value || 0;
    if (currentVal < this.minNextBid) {
      this.bidForm.patchValue({ amount: this.minNextBid });
    }
  }

  private calculateTimeRemaining(): void {
    if (!this.auction?.endsAt) return;

    const end = new Date(this.auction.endsAt).getTime();
    const now = new Date().getTime();
    this.timeRemaining = Math.max(0, Math.floor((end - now) / 1000));

    const hours = Math.floor(this.timeRemaining / 3600);
    const minutes = Math.floor((this.timeRemaining % 3600) / 60);
    const seconds = this.timeRemaining % 60;

    this.countdownDisplay = [hours, minutes, seconds]
      .map(v => v < 10 ? '0' + v : v)
      .join(':');

    if (this.timeRemaining === 0 && this.auction?.status === 'ACTIVE') {
      // Force refresh to catch ENDED status
      this.refreshAuction();
    }
  }

  refreshAuction(): void {
    this.auctionService.get(this.auctionId).subscribe(data => this.updateAuctionState(data));
  }

  addAmount(val: number): void {
    const current = this.bidForm.get('amount')?.value || this.minNextBid;
    this.bidForm.patchValue({ amount: current + val });
  }

  onPlaceBid(): void {
    if (this.bidForm.invalid || this.submitting) return;

    const amount = this.bidForm.get('amount')?.value as number;

    if (amount < this.minNextBid) {
      this.toast.error(`Minimum bid is \$${this.minNextBid}`);
      return;
    }

    if (amount > this.balance) {
      this.toast.error('Insufficient funds in wallet');
      return;
    }

    this.submitting = true;
    this.bidService.placeBid(this.auctionId, amount).subscribe({
      next: (bid) => {
        this.toast.success(`Bid placed: \$${amount}`);
        this.submitting = false;
        // User Requirement: "After a successful POST /bids, immediately update UI from response, then force one GET /auctions/{id} refresh"
        // Since the bid response won't have the full auction status, we refresh the auction.
        this.refreshAuction();
        // Also refresh wallet balance
        this.walletService.getMyWallet().subscribe();
      },
      error: (err) => {
        this.toast.error(err?.error?.message || 'Bid failed');
        this.submitting = false;
        this.refreshAuction();
      }
    });
  }
}
