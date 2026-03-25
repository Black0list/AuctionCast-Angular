import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CatalogService } from '../../../../core/services/catalog.service';
import { ToastService } from '../../../../core/services/toast.service';
import { MediaUrlPipe } from '../../../../shared/pipes/media-url.pipe';
import { ProductResponseDTO } from '../../../../core/models/catalog.models';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-product-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, MediaUrlPipe],
  template: `
    <div class="container py-4">
      <nav aria-label="breadcrumb" class="mb-4">
        <ol class="breadcrumb">
          <li class="breadcrumb-item"><a routerLink="/app/seller/products">My Inventory</a></li>
          <li class="breadcrumb-item active text-bidly-accent">Edit Product</li>
        </ol>
      </nav>

      <div class="card bidly-card max-w-700 mx-auto border-0 shadow-lg" *ngIf="product">
        <div class="card-body p-4 p-md-5">
          <h2 class="card-title h4 mb-4 fw-bold text-white">Edit Product</h2>

          <form [formGroup]="productForm" (ngSubmit)="onSubmit()">
            <div class="mb-4">
              <label class="form-label fw-semibold text-bidly-accent">Title</label>
              <input type="text" formControlName="title" class="form-control bidly-input" [class.is-invalid]="productForm.get('title')?.touched && productForm.get('title')?.invalid">
            </div>

            <div class="mb-4">
              <label class="form-label fw-semibold text-bidly-accent">Description</label>
              <textarea formControlName="description" class="form-control bidly-input" rows="4"></textarea>
            </div>

            <div class="row">
              <div class="col-md-4 mb-4">
                <label class="form-label fw-semibold text-bidly-accent">Category</label>
                <select formControlName="categoryName" class="form-select bidly-input">
                  <option *ngFor="let cat of categories" [value]="cat.name" class="bg-bidly-surface">{{ cat.name }}</option>
                </select>
              </div>
              <div class="col-md-4 mb-4">
                <label class="form-label fw-semibold text-bidly-accent">Condition</label>
                <select formControlName="condition" class="form-select bidly-input">
                  <option value="NEW" class="bg-bidly-surface">New</option>
                  <option value="LIKE_NEW" class="bg-bidly-surface">Like New</option>
                  <option value="USED_GOOD" class="bg-bidly-surface">Used - Good</option>
                  <option value="USED_FAIR" class="bg-bidly-surface">Used - Fair</option>
                  <option value="REFURBISHED" class="bg-bidly-surface">Refurbished</option>
                </select>
              </div>
              <div class="col-md-4 mb-4">
                <label class="form-label fw-semibold text-bidly-accent">Status</label>
                <select formControlName="status" class="form-select bidly-input">
                  <option value="DRAFT" class="bg-bidly-surface">Draft</option>
                  <option value="ACTIVE" class="bg-bidly-surface">Active</option>
                  <option value="IN_AUCTION" class="bg-bidly-surface">In Auction</option>
                  <option value="SOLD" class="bg-bidly-surface">Sold</option>
                  <option value="UNSOLD" class="bg-bidly-surface">Unsold</option>
                  <option value="ARCHIVED" class="bg-bidly-surface">Archived</option>
                </select>
              </div>
            </div>

            <div class="mb-4 pt-4 border-top border-bidly-border">
              <label class="form-label fw-semibold text-bidly-accent d-block mb-3">Current Images</label>
              <div class="d-flex flex-wrap gap-3 mb-4">
                <div *ngFor="let img of product.imageUrls" class="position-relative">
                  <img [src]="img.imageUrl | mediaUrl" class="img-thumbnail border-bidly-border" style="width: 80px; height: 80px; object-fit: cover; background: var(--bidly-surface-2);">
                  <span *ngIf="img.cover" class="badge bg-bidly-accent text-dark position-absolute bottom-0 start-50 translate-middle-x mb-2" style="font-size: 0.6rem;">Cover</span>
                </div>
              </div>

              <label class="form-label fw-semibold text-bidly-accent">Replace Images</label>
              <input type="file" multiple (change)="onFileChange($event)" class="form-control bidly-input" accept="image/*">
              <div class="mt-2 text-bidly-muted small">Selecting new images will replace existing ones.</div>
              
              <div class="mt-4 d-flex flex-wrap gap-3" *ngIf="previews.length > 0">
                <div *ngFor="let preview of previews; let i = index" class="position-relative">
                  <img [src]="preview" class="img-thumbnail border-bidly-accent" style="width: 100px; height: 100px; object-fit: cover; background: var(--bidly-surface-2);">
                  <button type="button" (click)="removeFile(i)" class="btn-close position-absolute top-0 end-0 bg-white p-1" style="transform: translate(50%, -50%); border-radius: 50%;"></button>
                </div>
              </div>
            </div>

            <div class="d-flex gap-3 pt-4">
              <button type="button" routerLink="/app/seller/products" class="btn btn-bidly-outline flex-fill py-3">Cancel</button>
              <button type="submit" [disabled]="loading || productForm.invalid" class="btn btn-bidly flex-fill py-3 shadow-none">
                <span *ngIf="loading" class="spinner-border spinner-border-sm me-2"></span>
                Apply Changes
              </button>
            </div>
          </form>
        </div>
      </div>

      <div *ngIf="!product && !loading" class="alert alert-warning text-center bidly-card border-0">
        Product not found or access denied.
      </div>
    </div>
  `,
  styles: [`
    .max-w-700 { max-width: 700px; }
    .text-bidly-accent { color: var(--bidly-accent); font-size: 0.9rem; }
    .text-bidly-muted { color: var(--bidly-muted); }
    .bg-bidly-surface { background-color: var(--bidly-surface); }
    .border-bidly-border { border-color: var(--bidly-border) !important; }
    .form-control::placeholder { color: var(--bidly-muted); opacity: 0.5; }
  `]
})
export class ProductEditComponent {
  private fb = inject(FormBuilder);
  private catalogService = inject(CatalogService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private toast = inject(ToastService);

  productForm = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    description: [''],
    categoryName: ['', Validators.required],
    condition: ['', Validators.required],
    status: ['', Validators.required],
    deleted: [false]
  });

  product?: ProductResponseDTO;
  categories: any[] = [];
  selectedFiles: File[] = [];
  previews: string[] = [];
  loading = true;

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadData(id);
    }
  }

  loadData(id: string) {
    this.loading = true;
    this.catalogService.getActiveCategories().subscribe(cats => this.categories = cats);
    this.catalogService.getProduct(id)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: p => {
          this.product = p;
          this.productForm.patchValue({
            title: p.title,
            description: p.description,
            categoryName: p.categoryName,
            condition: p.condition,
            status: p.status,
            deleted: p.deleted || false
          });
        },
        error: () => this.router.navigate(['/app/seller/products'])
      });
  }

  onFileChange(event: any) {
    const files = event.target.files;
    if (files) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        this.selectedFiles.push(file);
        const reader = new FileReader();
        reader.onload = (e: any) => this.previews.push(e.target.result);
        reader.readAsDataURL(file);
      }
    }
  }

  removeFile(index: number) {
    this.selectedFiles.splice(index, 1);
    this.previews.splice(index, 1);
  }

  onSubmit() {
    if (this.productForm.invalid || !this.product) return;

    this.loading = true;
    const formData = new FormData();
    const val = this.productForm.value;

    formData.append('title', val.title!);
    formData.append('description', val.description || '');
    formData.append('categoryName', val.categoryName!);
    formData.append('condition', val.condition!);
    formData.append('status', val.status!);
    formData.append('deleted', String(val.deleted || false));

    this.selectedFiles.forEach(file => formData.append('images', file));

    this.catalogService.updateProduct(this.product.id, formData)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: () => {
          this.toast.success('Product updated successfully');
          this.router.navigate(['/app/seller/products']);
        },
        error: (e) => this.toast.error(e?.error?.message ?? 'Failed to update product')
      });
  }
}
