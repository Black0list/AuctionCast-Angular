import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CatalogService } from '../../../core/services/catalog.service';
import { AuthService } from '../../../core/auth/auth.service';
import { ProductResponseDTO } from '../../../core/models/catalog.models';
import { MediaUrlPipe } from '../../../shared/pipes/media-url.pipe';
import { finalize, switchMap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
    selector: 'app-product-details',
    standalone: true,
    imports: [CommonModule, RouterLink, MediaUrlPipe],
    template: `
    <div class="container py-5">
      <nav aria-label="breadcrumb" class="mb-4">
        <ol class="breadcrumb">
          <li class="breadcrumb-item"><a routerLink="/app/products">Market</a></li>
          <li class="breadcrumb-item active text-bidly-accent">Product Details</li>
        </ol>
      </nav>

      <div *ngIf="loading" class="text-center py-5">
        <div class="spinner-border text-bidly-accent" role="status"></div>
      </div>

      <div *ngIf="error" class="alert alert-danger bidly-card">{{ error }}</div>

      <div *ngIf="!loading && product" class="row g-5">
        <!-- Image Gallery -->
        <div class="col-lg-7">
          <div class="bidly-card overflow-hidden shadow-lg border-0">
            <div class="main-image-container d-flex align-items-center justify-content-center p-3" style="height: 500px; background: rgba(255,255,255,0.02);">
              <img [src]="selectedImage || (getCoverImage(product) | mediaUrl)"
                   class="img-fluid rounded"
                   style="max-height: 100%; object-fit: contain;">
            </div>

            <div class="thumbnails-container d-flex gap-2 p-3 border-top border-bidly-muted overflow-auto" style="background: rgba(0,0,0,0.2);">
              <div *ngFor="let img of product.imageUrls"
                   (click)="selectImage(img.imageUrl)"
                   class="thumbnail-item cursor-pointer border rounded border-bidly-muted"
                   [class.active-thumbnail]="selectedImage === transformUrl(img.imageUrl)">
                <img [src]="img.imageUrl | mediaUrl" style="width: 70px; height: 70px; object-fit: cover;">
              </div>
            </div>
          </div>
        </div>

        <!-- Product Info -->
        <div class="col-lg-5">
          <div class="product-header mb-4">
            <div class="d-flex justify-content-between align-items-start gap-3">
              <h1 class="h2 fw-bold mb-0" style="color: var(--bidly-text);">{{ product.title }}</h1>
            </div>
            <div class="mt-3 flex-wrap d-flex gap-2">
              <span class="badge" [ngClass]="getStatusClass(product.status)">{{ product.status }}</span>
              <span class="badge bg-bidly-surface border-bidly-muted text-bidly-accent">{{ product.categoryName }}</span>
              <span class="badge bg-bidly-surface border-bidly-muted text-bidly-muted">{{ product.condition }}</span>
            </div>
          </div>

          <div class="seller-info bidly-card mb-4 p-3 d-flex flex-row align-items-center gap-3" style="background: var(--bidly-surface-2);">
            <div class="avatar-bg border-bidly-muted rounded-circle d-flex align-items-center justify-content-center" style="width: 48px; height: 48px; background: rgba(255,255,255,0.05);">
               <i class="bi bi-person text-bidly-accent h4 mb-0"></i>
            </div>
            <div>
              <small class="text-bidly-muted d-block">Seller</small>
              <span class="fw-semibold text-white">{{ product.user?.firstName }} {{ product.user?.lastName }}</span>
            </div>
          </div>

          <div class="product-description mb-5">
            <h5 class="fw-bold mb-3 border-bottom border-bidly-muted pb-2 text-bidly-accent">Description</h5>
            <p class="text-bidly-muted" style="white-space: pre-wrap; line-height: 1.6;">{{ product.description || 'No description provided.' }}</p>
          </div>

          <div class="actions-container d-grid gap-3 pt-4 border-top border-bidly-muted">
            <button class="btn btn-bidly btn-lg py-3">Place Bid (Coming Soon)</button>
            <div *ngIf="isOwner" class="d-flex gap-2">
               <a [routerLink]="['/app/seller/products', product.id, 'edit']" class="btn btn-bidly-outline flex-fill py-2">Edit My Product</a>
            </div>
          </div>

          <div class="mt-4 text-bidly-muted small">
            <div class="d-flex justify-content-between">
              <span>Published: {{ product.createdAt | date:'longDate' }}</span>
              <span>ID: {{ product.id | slice:0:8 }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .thumbnail-item {
      transition: all 0.2s ease;
      opacity: 0.5;
      background: var(--bidly-surface);
    }
    .thumbnail-item:hover, .thumbnail-item.active-thumbnail {
      opacity: 1;
      border-color: var(--bidly-accent) !important;
    }
    .cursor-pointer { cursor: pointer; }
    .active-thumbnail { border-width: 2px !important; }
    .text-bidly-accent { color: var(--bidly-accent); }
    .text-bidly-muted { color: var(--bidly-muted); }
    .bg-bidly-surface { background: var(--bidly-surface); border: 1px solid var(--bidly-border); }
    .border-bidly-muted { border: 1px solid var(--bidly-border) !important; }
  `]
})
export class ProductDetailsComponent {
    private route = inject(ActivatedRoute);
    private catalogService = inject(CatalogService);
    private authService = inject(AuthService);
    private mediaUrlPipe = new MediaUrlPipe();

    product?: ProductResponseDTO;
    loading = true;
    error: string | null = null;
    isOwner = false;
    selectedImage?: string;

    ngOnInit() {
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.loadProduct(id);
        } else {
            this.error = 'Product not found';
            this.loading = false;
        }
    }

    loadProduct(id: string) {
        this.catalogService.getProduct(id).pipe(
            switchMap(p => {
                this.product = p;
                return this.authService.me().pipe(
                    switchMap(user => this.catalogService.checkOwnership(id, user.id)),
                    catchError(() => of(false))
                );
            }),
            finalize(() => this.loading = false)
        ).subscribe({
            next: isOwner => this.isOwner = isOwner,
            error: () => this.error = 'Failed to load product details'
        });
    }

    selectImage(url: string) {
        this.selectedImage = this.transformUrl(url);
    }

    transformUrl(url: string): string {
        return this.mediaUrlPipe.transform(url);
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
    }
}
