import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderService, OrderPublicResponse } from '../../../core/services/order.service';
import { ToastService } from '../../../core/services/toast.service';
import { MediaUrlPipe } from '../../../shared/pipes/media-url.pipe';

@Component({
  selector: 'app-my-purchases',
  standalone: true,
  imports: [CommonModule, MediaUrlPipe],
  template: `
    <div class="container py-5">
      <div class="header-section mb-5">
        <h1 class="display-6 fw-bold mb-2">My Purchases</h1>
        <p class="text-secondary">Track your winning bids and order history.</p>
      </div>

      <div *ngIf="loading" class="text-center py-5">
        <div class="spinner-border text-bidly-accent" role="status"></div>
      </div>

      <div *ngIf="!loading && orders.length === 0" class="text-center py-5 bg-bidly-surface rounded-4 border border-bidly-border border-dashed">
         <i class="fas fa-shopping-bag fa-3x text-secondary mb-3 opacity-25"></i>
         <h3 class="h5 mb-2">No purchases yet</h3>
         <p class="text-secondary mb-4">Win an auction to see your orders here.</p>
         <a routerLink="/app/auctions" class="btn btn-bidly px-4">Browse Auctions</a>
      </div>

      <div class="row g-4" *ngIf="!loading && orders.length > 0">
        <div class="col-12" *ngFor="let order of orders">
          <div class="order-card p-4 rounded-4 shadow-sm border border-bidly-border bg-bidly-surface">
            <div class="row align-items-center g-4">
              <!-- Product Info -->
              <div class="col-md-5">
                <div class="d-flex align-items-center gap-4">
                  <div class="product-img-box rounded-3 overflow-hidden shadow-sm">
                    <img [src]="order.product.coverImage | mediaUrl" class="img-fluid" [alt]="order.product.title">
                  </div>
                  <div class="overflow-hidden">
                    <span class="badge bg-primary bg-opacity-10 text-primary small mb-2">#{{ order.id.substring(0,8).toUpperCase() }}</span>
                    <h4 class="h6 fw-bold mb-1 text-truncate">{{ order.product.title }}</h4>
                    <div class="text-secondary x-small mb-2">Ordered on {{ order.createdAt | date:'longDate' }}</div>
                    <div class="d-flex align-items-center gap-2 small">
                      <span class="text-secondary x-small fw-bold text-uppercase">Seller:</span>
                      <span class="text-white opacity-75">{{ order.seller?.firstName }} {{ order.seller?.lastName }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Status & Logistics -->
              <div class="col-md-4">
                <div class="d-flex flex-column gap-3 ps-md-4 border-md-start border-bidly-border">
                  <div>
                    <div class="text-secondary x-small fw-bold text-uppercase mb-2">Order Status</div>
                    <span [class]="'status-pill ' + getStatusClass(order.status)">
                       <i class="fas fa-circle x-small me-2"></i> {{ order.status.replace('_', ' ') }}
                    </span>
                  </div>
                  <div *ngIf="order.carrier">
                    <div class="text-secondary x-small fw-bold text-uppercase mb-1">Shipping Info</div>
                    <div class="small text-white opacity-75 d-flex align-items-center gap-2">
                       <i class="fas fa-truck x-small text-bidly-accent"></i>
                       {{ order.carrier }} &middot; <span class="font-monospace">{{ order.trackingNumber }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Pricing & Action -->
              <div class="col-md-3 text-md-end">
                <div class="mb-3">
                   <div class="text-secondary x-small fw-bold text-uppercase mb-1">Amount Paid</div>
                   <div class="h4 fw-bold text-bidly-accent mb-0">{{ order.amount | currency }}</div>
                </div>
                <button *ngIf="order.status === 'SHIPPED'" 
                        class="btn btn-sm btn-bidly w-100 py-2 rounded-pill"
                        (click)="confirmDelivery(order.id)">
                  Confirm Delivery
                </button>
                <div *ngIf="order.status === 'DELIVERED'" class="text-success small d-flex align-items-center justify-content-md-end gap-2">
                   <i class="fas fa-check-circle"></i> Item Delivered
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .order-card {
      transition: transform 0.2s, border-color 0.2s;
    }
    .order-card:hover {
      transform: translateY(-2px);
      border-color: rgba(57, 255, 136, 0.3) !important;
    }
    .product-img-box {
      width: 100px;
      height: 100px;
      flex-shrink: 0;
      background: #1a1f26;
    }
    .product-img-box img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .border-dashed { border-style: dashed !important; }
    .status-pill {
      display: inline-flex;
      align-items: center;
      padding: 6px 14px;
      border-radius: 100px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .bg-pending { background: rgba(255, 193, 7, 0.08); color: #ffc107; border: 1px solid rgba(255, 193, 7, 0.2); }
    .bg-shipped { background: rgba(13, 110, 253, 0.08); color: #0d6efd; border: 1px solid rgba(13, 110, 253, 0.2); }
    .bg-delivered { background: rgba(57, 255, 136, 0.08); color: #39ff88; border: 1px solid rgba(57, 255, 136, 0.2); }
    .bg-cancelled { background: rgba(220, 53, 69, 0.08); color: #dc3545; border: 1px solid rgba(220, 53, 69, 0.2); }
    .x-small { font-size: 0.65rem; }
    
    @media (min-width: 768px) {
      .border-md-start { border-left: 1px solid var(--bidly-border) !important; }
    }
  `]
})
export class MyPurchasesComponent implements OnInit {
  private orderService = inject(OrderService);
  private toasts = inject(ToastService);

  orders: OrderPublicResponse[] = [];
  loading = true;

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders() {
    this.loading = true;
    this.orderService.myPurchases().subscribe({
      next: (data) => {
        this.orders = data;
        this.loading = false;
      },
      error: () => {
        this.toasts.error('Failed to load purchases');
        this.loading = false;
      }
    });
  }

  confirmDelivery(orderId: string) {
    if (confirm('Mark this item as delivered and complete the order?')) {
      this.orderService.confirmDelivery(orderId).subscribe({
        next: () => {
          this.toasts.success('Order completed successfully!');
          this.loadOrders();
        },
        error: () => this.toasts.error('Failed to confirm delivery')
      });
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'PENDING_SHIPMENT': return 'bg-pending';
      case 'SHIPPED': return 'bg-shipped';
      case 'DELIVERED': return 'bg-delivered';
      case 'CANCELLED': return 'bg-cancelled';
      default: return 'bg-secondary';
    }
  }
}
