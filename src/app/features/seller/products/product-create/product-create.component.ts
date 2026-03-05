import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CatalogService } from '../../../../core/services/catalog.service';
import { finalize } from 'rxjs/operators';

@Component({
    selector: 'app-product-create',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterLink],
    template: `
    <div class="container py-4">
      <nav aria-label="breadcrumb" class="mb-4">
        <ol class="breadcrumb">
          <li class="breadcrumb-item"><a routerLink="/app/seller/products">My Inventory</a></li>
          <li class="breadcrumb-item active text-bidly-accent">New Product</li>
        </ol>
      </nav>

      <div class="card bidly-card max-w-700 mx-auto border-0 shadow-lg">
        <div class="card-body p-4 p-md-5">
          <h2 class="card-title h4 mb-4 fw-bold text-white">Create Listing</h2>

          <form [formGroup]="productForm" (ngSubmit)="onSubmit()">
            <div class="mb-4">
              <label class="form-label fw-semibold text-bidly-accent">Title</label>
              <input type="text" formControlName="title" class="form-control bidly-input" placeholder="What are you offering?">
            </div>

            <div class="mb-4">
              <label class="form-label fw-semibold text-bidly-accent">Description</label>
              <textarea formControlName="description" class="form-control bidly-input" rows="4" placeholder="Briefly describe the item..."></textarea>
            </div>

            <div class="row">
              <div class="col-md-6 mb-4">
                <label class="form-label fw-semibold text-bidly-accent">Category</label>
                <select formControlName="categoryName" class="form-select bidly-input">
                  <option value="" class="bg-bidly-surface">Choose category...</option>
                  <option *ngFor="let cat of categories" [value]="cat.name" class="bg-bidly-surface">{{ cat.name }}</option>
                </select>
              </div>
              <div class="col-md-6 mb-4">
                <label class="form-label fw-semibold text-bidly-accent">Condition</label>
                <select formControlName="condition" class="form-select bidly-input">
                  <option value="NEW" class="bg-bidly-surface">New</option>
                  <option value="LIKE_NEW" class="bg-bidly-surface">Like New</option>
                  <option value="USED_GOOD" class="bg-bidly-surface">Used - Good</option>
                  <option value="USED_FAIR" class="bg-bidly-surface">Used - Fair</option>
                  <option value="REFURBISHED" class="bg-bidly-surface">Refurbished</option>
                </select>
              </div>
            </div>

            <div class="mb-4 pt-3 border-top border-bidly-border">
              <label class="form-label fw-semibold text-bidly-accent d-block">Product Images</label>
              <input type="file" multiple (change)="onFileChange($event)" class="form-control bidly-input" accept="image/*">
              
              <div class="mt-4 d-flex flex-wrap gap-3" *ngIf="previews.length > 0">
                <div *ngFor="let preview of previews; let i = index" class="position-relative">
                  <img [src]="preview" class="img-thumbnail border-bidly-border shadow-sm" style="width: 100px; height: 100px; object-fit: cover; background: var(--bidly-surface-2);">
                  <button type="button" (click)="removeFile(i)" class="btn-close position-absolute top-0 end-0 bg-white p-1" style="transform: translate(50%, -50%); border-radius: 50%;"></button>
                </div>
              </div>
              <div *ngIf="submitted && selectedFiles.length === 0" class="text-danger small mt-2">
                 Please upload at least one image.
              </div>
            </div>

            <div class="d-flex gap-3 pt-3">
              <button type="button" routerLink="/app/seller/products" class="btn btn-bidly-outline flex-fill py-3">Cancel</button>
              <button type="submit" [disabled]="loading" class="btn btn-bidly flex-fill py-3 shadow-none">
                <span *ngIf="loading" class="spinner-border spinner-border-sm me-2"></span>
                Save Product
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .max-w-700 { max-width: 700px; }
    .text-bidly-accent { color: var(--bidly-accent); font-size: 0.9rem; }
    .bg-bidly-surface { background-color: var(--bidly-surface); }
    .border-bidly-border { border-color: var(--bidly-border) !important; }
    .form-control::placeholder { color: var(--bidly-muted); opacity: 0.5; }
  `]
})
export class ProductCreateComponent {
    private fb = inject(FormBuilder);
    private catalogService = inject(CatalogService);
    private router = inject(Router);

    productForm = this.fb.group({
        title: ['', [Validators.required, Validators.minLength(3)]],
        description: [''],
        categoryName: ['', Validators.required],
        condition: ['NEW', Validators.required]
    });

    categories: any[] = [];
    selectedFiles: File[] = [];
    previews: string[] = [];
    loading = false;
    submitted = false;

    ngOnInit() {
        this.catalogService.getActiveCategories().subscribe(cats => this.categories = cats);
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
        this.submitted = true;
        if (this.productForm.invalid || this.selectedFiles.length === 0) return;

        this.loading = true;
        const formData = new FormData();
        const val = this.productForm.value;

        formData.append('title', val.title!);
        formData.append('description', val.description || '');
        formData.append('categoryName', val.categoryName!);
        formData.append('condition', val.condition!);

        this.selectedFiles.forEach(file => formData.append('images', file));

        this.catalogService.createProduct(formData)
            .pipe(finalize(() => this.loading = false))
            .subscribe({
                next: () => this.router.navigate(['/app/seller/products']),
                error: () => alert('Failed to create product')
            });
    }
}
