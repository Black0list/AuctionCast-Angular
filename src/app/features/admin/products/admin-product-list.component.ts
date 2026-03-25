import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CatalogService } from '../../../core/services/catalog.service';
import { ProductResponseDTO } from '../../../core/models/catalog.models';
import { ToastService } from '../../../core/services/toast.service';
import { MediaUrlPipe } from '../../../shared/pipes/media-url.pipe';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';

@Component({
  selector: 'app-admin-product-list',
  standalone: true,
  imports: [CommonModule, MediaUrlPipe, PaginationComponent],
    template: `
    <div class="admin-products-container">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 class="h3 fw-bold mb-1">Product Inventory</h2>
          <p class="text-secondary small mb-0">Monitor and manage all system products.</p>
        </div>
        <div class="search-box">
          <i class="fas fa-search"></i>
          <input type="text" placeholder="Search products..." class="form-control" (input)="onSearch($event)">
        </div>
      </div>

      <div class="bidly-card p-0 overflow-hidden shadow-lg border-0 bg-dark-subtle bg-opacity-10">
        <div class="table-responsive">
          <table class="table table-dark table-hover mb-0 align-middle">
            <thead class="bg-dark bg-opacity-50">
              <tr>
                <th class="ps-4 py-3 text-secondary small">PRODUCT</th>
                <th class="py-3 text-secondary small">SELLER</th>
                <th class="py-3 text-secondary small">CATEGORY</th>
                <th class="py-3 text-secondary small">STATUS</th>
                <th class="py-3 text-secondary small text-end pe-4">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let product of paginatedProducts">
                <td class="ps-4 py-3">
                  <div class="d-flex align-items-center gap-3">
                    <img [src]="(product.coverImage || 'assets/placeholder.png') | mediaUrl" class="product-thumb" alt="thumb">
                    <div>
                      <div class="fw-bold">{{ product.title }}</div>
                      <div class="text-secondary x-small">ID: {{ product.id.substring(0, 8) }}...</div>
                    </div>
                  </div>
                </td>
                <td class="py-3 text-secondary">
                  <div class="d-flex align-items-center gap-2">
                    <div class="seller-dot"></div>
                    {{ getSellerName(product) }}
                  </div>
                </td>
                <td class="py-3">
                  <span class="badge bg-secondary bg-opacity-25 text-secondary">{{ product.categoryName || 'No Category' }}</span>
                </td>
                <td class="py-3">
                  <span [class]="'badge bg-opacity-25 ' + getStatusClass(product.status || 'DRAFT')">
                    {{ product.status }}
                  </span>
                </td>
                <td class="py-3 text-end pe-4">
                  <div class="d-flex justify-content-end gap-2">
                    <button class="btn btn-sm btn-icon-only text-danger" title="Delete" (click)="onDelete(product.id)">
                      <i class="fas fa-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
              <tr *ngIf="filteredProducts.length === 0">
                <td colspan="5" class="text-center py-5 text-secondary">
                  <i class="fas fa-box-open d-block mb-3 h2 opacity-25"></i>
                  No products found
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <app-pagination 
          [totalItems]="filteredProducts.length" 
          [pageSize]="pageSize" 
          [currentPage]="currentPage"
          (pageChanged)="onPageChange($event)">
        </app-pagination>
      </div>
    </div>
  `,
    styles: [`
    .admin-products-container { }
    
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
    
    .btn-icon-only {
      width: 32px;
      height: 32px;
      padding: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 8px;
      background: rgba(255, 255, 255, 0.03);
      border: none;
      transition: all 0.2s;
    }
    
    .btn-icon-only:hover {
      background: rgba(255, 255, 255, 0.1);
    }

    .x-small { font-size: 0.7rem; }
  `]
})
export class AdminProductListComponent implements OnInit {
    private readonly catalogService = inject(CatalogService);
    private readonly toasts = inject(ToastService);

    products: ProductResponseDTO[] = [];
    filteredProducts: ProductResponseDTO[] = [];
    searchTerm = '';
    
    // Pagination fields
    pageSize = 10;
    currentPage = 1;

    get paginatedProducts(): ProductResponseDTO[] {
        const start = (this.currentPage - 1) * this.pageSize;
        return this.filteredProducts.slice(start, start + this.pageSize);
    }

    ngOnInit() {
        this.loadProducts();
    }

    loadProducts() {
        this.catalogService.listAllProducts().subscribe({
            next: (products) => {
                this.products = products;
                this.applyFilter();
            },
            error: () => this.toasts.error('Failed to load products')
        });
    }

    getCoverImage(product: ProductResponseDTO): string {
        return product.imageUrls?.find(img => img.cover)?.imageUrl || 'assets/placeholder.png';
    }

    getSellerName(product: ProductResponseDTO): string {
        if (!product.user) return 'Unknown';
        const name = `${product.user.firstName || ''} ${product.user.lastName || ''}`.trim();
        return name || 'Anonymous';
    }

    onSearch(event: Event) {
        this.searchTerm = (event.target as HTMLInputElement).value.toLowerCase();
        this.currentPage = 1; // Reset to first page on search
        this.applyFilter();
    }

    onPageChange(page: number) {
        this.currentPage = page;
    }

    applyFilter() {
        this.filteredProducts = this.products.filter(p =>
            p.title.toLowerCase().includes(this.searchTerm) ||
            this.getSellerName(p).toLowerCase().includes(this.searchTerm) ||
            (p.categoryName || '').toLowerCase().includes(this.searchTerm)
        );
    }

    getStatusClass(status: string): string {
        switch (status) {
            case 'DRAFT': return 'bg-secondary text-secondary';
            case 'ACTIVE': return 'bg-success text-success';
            case 'IN_AUCTION': return 'bg-warning text-warning';
            case 'SOLD': return 'bg-info text-info';
            case 'UNSOLD': return 'bg-danger text-danger';
            default: return 'bg-dark text-white';
        }
    }

    onDelete(id: string) {
        if (confirm('Are you sure you want to delete this product?')) {
            this.catalogService.deleteProduct(id, true).subscribe({
                next: () => {
                    this.toasts.success('Product deleted successfully');
                    this.loadProducts();
                },
                error: () => this.toasts.error('Failed to delete product')
            });
        }
    }
}
