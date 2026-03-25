import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../../core/services/admin.service';
import { OrderStatus } from '../../../core/models/order.models';
import { OrderPublicResponse } from '../../../core/services/order.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
    selector: 'app-admin-order-list',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="admin-orders-container">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 class="h3 fw-bold mb-1">Shipment Tracking</h2>
          <p class="text-secondary small mb-0">Monitor all system orders and shippements.</p>
        </div>
        <div class="search-box">
          <i class="fas fa-search"></i>
          <input type="text" placeholder="Search orders (ID, Buyer, Seller)..." class="form-control" (input)="onSearch($event)">
        </div>
      </div>

      <div class="bidly-card p-0 overflow-hidden shadow-lg border-0 bg-dark-subtle bg-opacity-10">
        <div class="table-responsive">
          <table class="table table-dark table-hover mb-0 align-middle">
            <thead class="bg-dark bg-opacity-50">
              <tr>
                <th class="ps-4 py-3 text-secondary small">ORDER ID / DATE</th>
                <th class="py-3 text-secondary small">PARTIES</th>
                <th class="py-3 text-secondary small text-center">AMOUNT</th>
                <th class="py-3 text-secondary small">LOGISTICS</th>
                <th class="py-3 text-secondary small">STATUS</th>
                <th class="py-3 text-secondary small text-end pe-4">DESTINATION</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let order of filteredOrders">
                <td class="ps-4 py-3">
                  <div class="fw-bold text-primary small">#{{ order.id.substring(0, 8).toUpperCase() }}</div>
                  <div class="text-secondary x-small">{{ order.createdAt | date:'shortDate' }}</div>
                </td>
                <td class="py-3">
                  <div class="d-flex flex-column gap-1">
                    <div class="d-flex align-items-center gap-2 small">
                      <span class="text-secondary x-small fw-bold text-uppercase" style="width: 45px;">Seller:</span>
                      <span class="text-truncate" style="max-width: 150px;">{{ order.seller?.firstName }} {{ order.seller?.lastName }}</span>
                    </div>
                    <div class="d-flex align-items-center gap-2 small">
                      <span class="text-secondary x-small fw-bold text-uppercase" style="width: 45px;">Buyer:</span>
                      <span class="text-truncate" style="max-width: 150px;">{{ order.buyer?.firstName }} {{ order.buyer?.lastName }}</span>
                    </div>
                  </div>
                </td>
                <td class="py-3 text-center fw-bold text-success font-monospace">
                   {{ order.amount | currency }}
                </td>
                <td class="py-3">
                  <div *ngIf="order.carrier || order.trackingNumber">
                    <div class="small fw-bold">{{ order.carrier }}</div>
                    <div class="text-secondary x-small font-monospace">{{ order.trackingNumber }}</div>
                  </div>
                  <div *ngIf="!order.carrier && !order.trackingNumber" class="text-secondary x-small italic text-opacity-50 text-white">
                    Not Shipped Yet
                  </div>
                </td>
                <td class="py-3">
                  <span [class]="'status-pill ' + getStatusClass(order.status)">
                    {{ order.status.replace('_', ' ') }}
                  </span>
                </td>
                <td class="py-3 text-end pe-4">
                  <div class="small fw-bold">{{ order.shippingCity }}, {{ order.shippingCountry }}</div>
                  <div class="text-secondary x-small">{{ order.shippingFullName }}</div>
                </td>
              </tr>
              <tr *ngIf="filteredOrders.length === 0">
                <td colspan="6" class="text-center py-5 text-secondary">
                  <i class="fas fa-shipping-fast d-block mb-3 h2 opacity-25"></i>
                  No orders found
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .admin-orders-container { }
    
    .search-box {
      position: relative;
      width: 350px;
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

    .x-small { font-size: 0.65rem; }
    
    .status-pill {
        display: inline-block;
        padding: 4px 10px;
        border-radius: 100px;
        font-size: 0.7rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }
    
    .bg-pending { background: rgba(255, 193, 7, 0.1); color: #ffc107; border: 1px solid rgba(255, 193, 7, 0.2); }
    .bg-shipped { background: rgba(13, 110, 253, 0.1); color: #0d6efd; border: 1px solid rgba(13, 110, 253, 0.2); }
    .bg-delivered { background: rgba(57, 255, 136, 0.1); color: #39ff88; border: 1px solid rgba(57, 255, 136, 0.2); }
    .bg-cancelled { background: rgba(220, 53, 69, 0.1); color: #dc3545; border: 1px solid rgba(220, 53, 69, 0.2); }
  `]
})
export class AdminOrderListComponent implements OnInit {
    private readonly adminService = inject(AdminService);
    private readonly toasts = inject(ToastService);

    orders: OrderPublicResponse[] = [];
    filteredOrders: OrderPublicResponse[] = [];
    searchTerm = '';

    ngOnInit() {
        this.loadOrders();
    }

    loadOrders() {
        this.adminService.getOrders().subscribe({
            next: (orders) => {
                this.orders = orders;
                this.applyFilter();
            },
            error: () => this.toasts.error('Failed to load orders')
        });
    }

    onSearch(event: Event) {
        this.searchTerm = (event.target as HTMLInputElement).value.toLowerCase();
        this.applyFilter();
    }

    applyFilter() {
        this.filteredOrders = this.orders.filter(o =>
            o.id.toLowerCase().includes(this.searchTerm) ||
            o.buyer?.firstName?.toLowerCase().includes(this.searchTerm) ||
            o.buyer?.lastName?.toLowerCase().includes(this.searchTerm) ||
            o.seller?.firstName?.toLowerCase().includes(this.searchTerm) ||
            o.seller?.lastName?.toLowerCase().includes(this.searchTerm) ||
            o.shippingFullName?.toLowerCase().includes(this.searchTerm) ||
            o.shippingCity?.toLowerCase().includes(this.searchTerm) ||
            o.status?.toLowerCase().includes(this.searchTerm)
        );
    }

    getStatusClass(status: OrderStatus): string {
        switch (status) {
            case OrderStatus.PENDING_SHIPMENT: return 'bg-pending';
            case OrderStatus.SHIPPED: return 'bg-shipped';
            case OrderStatus.DELIVERED: return 'bg-delivered';
            case OrderStatus.CANCELLED: return 'bg-cancelled';
            default: return 'bg-secondary';
        }
    }
}
