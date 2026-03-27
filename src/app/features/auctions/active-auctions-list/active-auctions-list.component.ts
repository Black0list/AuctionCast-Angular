import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuctionService } from '../../../core/services/auction.service';
import { AuctionResponse } from '../../../core/models/auction.models';
import { MediaUrlPipe } from '../../../shared/pipes/media-url.pipe';
import { finalize } from 'rxjs/operators';

@Component({
    selector: 'app-active-auctions-list',
    standalone: true,
    imports: [CommonModule, RouterLink, MediaUrlPipe],
    template: `
    <div class="container py-5">
      <div class="d-flex justify-content-between align-items-center mb-5">
        <div>
          <h2 class="display-6 fw-bold text-white mb-2">Live Auctions</h2>
          <p class="text-bidly-muted">Browse active auctions and start bidding in real-time.</p>
        </div>
      </div>

      <div *ngIf="loading" class="text-center py-5">
        <div class="spinner-border text-bidly" role="status"></div>
        <p class="text-bidly-muted mt-2">Loading active auctions...</p>
      </div>

      <div *ngIf="!loading && auctions.length === 0" class="text-center py-5 bg-bidly-surface rounded border border-bidly-border border-dashed">
        <div class="mb-3">
          <i class="fas fa-gavel fs-1 text-bidly-muted opacity-25"></i>
        </div>
        <h4 class="text-white">No active auctions right now</h4>
        <p class="text-bidly-muted mb-0">Check back later or explore other categories.</p>
      </div>

      <div class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4" *ngIf="!loading && auctions.length > 0">
        <div class="col" *ngFor="let auction of auctions">
          <div class="card bidly-card h-100 shadow-lg border-0 overflow-hidden">
            <div class="position-relative">
              <img *ngIf="auction.product?.imageUrls?.length; else placeholder"
                   [src]="auction.product.imageUrls![0].imageUrl | mediaUrl" 
                   class="card-img-top" [alt]="auction.product.title"
                   style="height: 220px; object-fit: cover;">
              <ng-template #placeholder>
                <div class="bg-secondary d-flex justify-content-center align-items-center" style="height: 220px;">
                  <i class="fas fa-image text-white opacity-25" style="font-size: 3rem;"></i>
                </div>  
              </ng-template>     
              
              <div class="position-absolute top-0 start-0 m-3">
                <span class="badge bg-danger px-3 py-2 rounded-pill shadow-sm animate-pulse">
                  <i class="fas fa-circle me-1 small"></i> LIVE
                </span>
              </div>
            </div>

            <div class="card-body p-4 d-flex flex-column">
              <div class="d-flex justify-content-between mb-2">
                <span class="text-bidly-accent x-small fw-bold text-uppercase">{{ auction.product.categoryName }}</span>
                <span class="text-bidly-muted x-small fw-bold text-uppercase">{{ auction.product.condition }}</span>
              </div>
              
              <div class="d-flex justify-content-between align-items-start mb-2">
                <h5 class="card-title h6 fw-bold mb-0 text-white">{{ auction.product.title }}</h5>
                <a [routerLink]="['/app/products', auction.product.id]" class="text-bidly-accent x-small fw-bold text-decoration-none ms-2 flex-shrink-0" title="View Product Details">
                  <i class="fas fa-info-circle"></i> INFO
                </a>
              </div>
              
              <div class="d-flex justify-content-between align-items-end mt-auto pt-3 border-top border-bidly-border">
                <div>
                  <span class="text-bidly-muted x-small d-block mb-1">Current Bid</span>
                  <span class="text-bidly-accent fw-bold fs-4">{{ (auction.currentPrice || auction.startPrice) | currency }}</span>
                </div>
                <div class="text-end">
                  <span class="text-bidly-muted x-small d-block mb-1">{{ auction.bidCount }} Bids</span>
                  <a [routerLink]="['/app/auctions', auction.id, 'bid']" class="btn btn-bidly btn-sm px-4">
                    Join & Bid
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .x-small { font-size: 0.7rem; letter-spacing: 0.5px; }
    .animate-pulse {
      animation: pulse-red 2s infinite;
    }
    @keyframes pulse-red {
      0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(220, 53, 69, 0.7); }
      70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(220, 53, 69, 0); }
      100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(220, 53, 69, 0); }
    }
    .border-dashed { border-style: dashed !important; }
  `]
})
export class ActiveAuctionsListComponent implements OnInit {
    private auctionService = inject(AuctionService);

    auctions: AuctionResponse[] = [];
    loading = true;

    ngOnInit(): void {
        this.loadActiveAuctions();
    }

    loadActiveAuctions(): void {
        this.loading = true;
        this.auctionService.listActive().subscribe({
            next: (res) => {
                this.auctions = res;
                this.loading = false;
            },
            error: () => {
                this.loading = false;
            }
        });
    }
}
