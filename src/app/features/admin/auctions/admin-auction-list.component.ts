import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../../core/services/admin.service';
import { AuctionResponse, AuctionStatus } from '../../../core/models/auction.models';
import { ToastService } from '../../../core/services/toast.service';
import { MediaUrlPipe } from '../../../shared/pipes/media-url.pipe';

@Component({
    selector: 'app-admin-auction-list',
    standalone: true,
    imports: [CommonModule, MediaUrlPipe],
    template: `
    <div class="admin-auctions-container">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 class="h3 fw-bold mb-1">Auction Management</h2>
          <p class="text-secondary small mb-0">Monitor and manage all system auctions.</p>
        </div>
        <div class="search-box">
          <i class="fas fa-search"></i>
          <input type="text" placeholder="Search auctions..." class="form-control" (input)="onSearch($event)">
        </div>
      </div>

      <div class="bidly-card p-0 overflow-hidden shadow-lg border-0 bg-dark-subtle bg-opacity-10">
        <div class="table-responsive">
          <table class="table table-dark table-hover mb-0 align-middle">
            <thead class="bg-dark bg-opacity-50">
              <tr>
                <th class="ps-4 py-3 text-secondary small">PRODUCT / AUCTION</th>
                <th class="py-3 text-secondary small">SELLER</th>
                <th class="py-3 text-secondary small text-center">BIDS</th>
                <th class="py-3 text-secondary small">CURRENT PRICE</th>
                <th class="py-3 text-secondary small">STATUS</th>
                <th class="py-3 text-secondary small text-end pe-4">ENDS AT</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let auction of filteredAuctions">
                <td class="ps-4 py-3">
                  <div class="d-flex align-items-center gap-3">
                    <img [src]="getCoverImage(auction) | mediaUrl" class="product-thumb" alt="thumb">
                    <div>
                      <div class="fw-bold text-truncate" style="max-width: 250px;">{{ auction.product.title }}</div>
                      <div class="text-secondary x-small">ID: {{ auction.id.substring(0, 8) }}...</div>
                    </div>
                  </div>
                </td>
                <td class="py-3 text-secondary">
                  <div class="d-flex align-items-center gap-2">
                    <div class="seller-dot"></div>
                    {{ getSellerName(auction) }}
                  </div>
                </td>
                <td class="py-3 text-center">
                   <span class="badge rounded-pill bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 py-2 px-3">
                     {{ auction.bidCount }}
                   </span>
                </td>
                <td class="py-3">
                  <div class="fw-bold text-success">{{ auction.currentPrice | currency }}</div>
                  <div class="text-secondary x-small">Start: {{ auction.startPrice | currency }}</div>
                </td>
                <td class="py-3">
                  <span [class]="'badge bg-opacity-10 ' + getStatusClass(auction.status)">
                    {{ auction.status }}
                  </span>
                </td>
                <td class="py-3 text-end pe-4 text-secondary small">
                  {{ auction.endsAt ? (auction.endsAt | date:'short') : 'Not Set' }}
                </td>
              </tr>
              <tr *ngIf="filteredAuctions.length === 0">
                <td colspan="6" class="text-center py-5 text-secondary">
                  <i class="fas fa-hammer d-block mb-3 h2 opacity-25"></i>
                  No auctions found
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .admin-auctions-container { }

    .search-box {
      position: relative;
      width: 300px;
    }

    .search-box i {
      position: absolute;
      left: 12px;
      top: 50%;
      transform: translateY(-50%);
      color: rgba(255, 255, 255, 0.4);
    }

    .search-box input {
      padding-left: 38px;
      background: #0f1620;
      border: 1px solid rgba(255, 255, 255, 0.05);
      color: #fff;
    }

    .product-thumb {
      width: 48px;
      height: 48px;
      object-fit: cover;
      border-radius: 8px;
      background: #222;
    }

    .seller-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--bidly-accent);
    }

    .x-small { font-size: 0.7rem; }

    .badge {
        font-weight: 500;
        letter-spacing: 0.5px;
    }

    .bg-draft { color: #6c757d; border: 1px solid #6c757d; }
    .bg-active { color: #39ff88; border: 1px solid #39ff88; }
    .bg-scheduled { color: #ffc107; border: 1px solid #ffc107; }
    .bg-ended { color: #0dcaf0; border: 1px solid #0dcaf0; }
    .bg-cancelled { color: #dc3545; border: 1px solid #dc3545; }
  `]
})
export class AdminAuctionListComponent implements OnInit {
    private readonly adminService = inject(AdminService);
    private readonly toasts = inject(ToastService);

    auctions: AuctionResponse[] = [];
    filteredAuctions: AuctionResponse[] = [];
    searchTerm = '';

    ngOnInit() {
        this.loadAuctions();
    }

    loadAuctions() {
        this.adminService.getAuctions().subscribe({
            next: (auctions) => {
                this.auctions = auctions;
                this.applyFilter();
            },
            error: () => console.log("Failed to load auctions")
        });
    }

    getCoverImage(auction: AuctionResponse): string {
        return auction.product.imageUrls?.find(img => img.cover)?.imageUrl || 'assets/placeholder.png';
    }

    getSellerName(auction: AuctionResponse): string {
        if (!auction.seller) return 'Unknown';
        const name = `${auction.seller.firstName || ''} ${auction.seller.lastName || ''}`.trim();
        return name || 'Anonymous';
    }

    onSearch(event: Event) {
        this.searchTerm = (event.target as HTMLInputElement).value.toLowerCase();
        this.applyFilter();
    }

    applyFilter() {
        this.filteredAuctions = this.auctions.filter(a =>
            a.product.title.toLowerCase().includes(this.searchTerm) ||
            this.getSellerName(a).toLowerCase().includes(this.searchTerm) ||
            a.status.toLowerCase().includes(this.searchTerm)
        );
    }

    getStatusClass(status: AuctionStatus): string {
        switch (status) {
            case AuctionStatus.DRAFT: return 'bg-draft';
            case AuctionStatus.ACTIVE: return 'bg-active';
            case AuctionStatus.SCHEDULED: return 'bg-scheduled';
            case AuctionStatus.ENDED: return 'bg-ended';
            case AuctionStatus.CANCELLED: return 'bg-cancelled';
            default: return 'bg-secondary';
        }
    }
}
