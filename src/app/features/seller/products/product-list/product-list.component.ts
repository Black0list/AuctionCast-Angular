import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CatalogService } from '../../../../core/services/catalog.service';
import { MediaUrlPipe } from '../../../../shared/pipes/media-url.pipe';
import { ProductResponseDTO } from '../../../../core/models/catalog.models';
import { finalize } from 'rxjs';

@Component({
    selector: 'app-product-list',
    standalone: true,
    imports: [CommonModule, RouterLink, MediaUrlPipe],
    template: `
      <div class="container py-4">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <h2 class="h3 mb-0">My Inventory</h2>
          <a routerLink="new" class="btn btn-bidly">Add Product</a>
        </div>

        <div *ngIf="loading" class="text-center py-5">
          <div class="spinner-border text-bidly" role="status"></div>
        </div>

        <div *ngIf="products.length === 0 && !loading" class="text-center py-5 bg-light rounded border border-dashed">
          <p class="text-muted">You haven't listed any products yet.</p>
          <a routerLink="new" class="btn btn-outline-bidly">Create your first listing</a>
        </div>

        <div class="row g-4" *ngIf="!loading">
          <div class="col-md-6 col-lg-4" *ngFor="let product of products">
            <div class="bidly-card h-100 shadow-lg border-0 overflow-hidden">
              <div class="position-relative">
                <img [src]="getCoverImage(product) | mediaUrl" class="card-img-top" [alt]="product.title"
                     style="height: 200px; object-fit: cover; filter: brightness(0.9);">
                <div class="position-absolute top-0 end-0 m-2">
                  <span class="badge" [ngClass]="getStatusClass(product.status)">{{ product.status }}</span>
                </div>
              </div>
              <div class="card-body d-flex flex-column p-4">
                <h5 class="card-title h6 fw-bold mb-2 text-white">{{ product.title }}</h5>
                <p class="card-text text-bidly-muted small flex-grow-1"
                   style="line-height: 1.5;">{{ product.description | slice:0:80 }}{{ (product.description?.length || 0) > 80 ? '...' : '' }}</p>
                <div class="mt-3 mb-4 d-flex gap-2 flex-wrap">
                  <span
                    class="badge bg-bidly-surface border-bidly-muted text-bidly-accent px-2 py-1">{{ product.categoryName }}</span>
                  <span
                    class="badge bg-bidly-surface border-bidly-muted text-bidly-muted px-2 py-1">{{ product.condition }}</span>
                </div>
                <div class="d-flex gap-2">
                  <a [routerLink]="['/app/products', product.id]"
                     class="btn btn-sm btn-bidly-outline flex-grow-1">View</a>
                  <a [routerLink]="['/app/seller/products', product.id, 'edit']"
                     class="btn btn-sm btn-bidly flex-grow-1">Edit</a>
                  <button (click)="onDelete(product.id)" class="btn btn-sm btn-danger px-3">
                    <i class="bi bi-trash"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `,
    styles: [`
    .text-bidly-accent { color: var(--bidly-accent); }
    .text-bidly-muted { color: var(--bidly-muted); }
    .bg-bidly-surface { background: rgba(255,255,255,0.05); }
    .border-bidly-muted { border: 1px solid var(--bidly-border) !important; }
    .btn-danger { background: var(--bidly-danger); border: none; }
    .btn-danger:hover { background: #ff7875; }
  `]
})
export class ProductListComponent {
    private catalogService = inject(CatalogService);
    products: ProductResponseDTO[] = [];
    loading = true;

    ngOnInit() {
        this.loadProducts();
    }

    loadProducts() {
        this.loading = true;
        this.catalogService.listMyProducts()
            .pipe(finalize(() => this.loading = false))
            .subscribe({
                next: products => this.products = products.filter(p => !p.deleted),
                error: () => alert('Failed to load your products')
            });
    }

    getCoverImage(product: ProductResponseDTO): string {
        const cover = product.imageUrls?.find(img => img.cover);
        return cover ? cover.imageUrl : (product.imageUrls?.[0]?.imageUrl || '');
    }

    getStatusClass(status: string | undefined): string {
        switch (status?.toUpperCase()) {
            case 'ACTIVE': return 'bg-success';
            case 'DRAFT': return 'bg-secondary';
            case 'IN_AUCTION': return 'bg-primary';
            case 'SOLD': return 'bg-danger';
            case 'UNSOLD': return 'bg-warning text-dark';
            case 'ARCHIVED': return 'bg-dark border border-secondary';
            default: return 'bg-info';
        }
    }

    onDelete(id: string) {
        if (confirm('Are you sure you want to delete this product?')) {
            this.catalogService.deleteProduct(id)
                .subscribe({
                    next: () => this.loadProducts(),
                    error: () => alert('Failed to delete product')
                });
        }
    }
}
