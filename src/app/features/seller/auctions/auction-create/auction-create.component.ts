import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuctionService } from '../../../../core/services/auction.service';
import { CatalogService } from '../../../../core/services/catalog.service';
import { ProductResponseDTO } from '../../../../core/models/catalog.models';

@Component({
    selector: 'app-auction-create',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterLink],
    template: `
    <div class="container py-4">
      <nav aria-label="breadcrumb" class="mb-4">
        <ol class="breadcrumb">
          <li class="breadcrumb-item"><a routerLink="/app/seller/auctions">My Auctions</a></li>
          <li class="breadcrumb-item active text-bidly-accent">New Auction</li>
        </ol>
      </nav>

      <div class="card bidly-card max-w-700 mx-auto border-0 shadow-lg">
        <div class="card-body p-4 p-md-5">
          <h2 class="card-title h4 mb-4 fw-bold text-white">Create Auction</h2>

          <form [formGroup]="auctionForm" (ngSubmit)="onSubmit()">
            
            <div class="mb-4">
              <label for="productId" class="form-label fw-semibold text-bidly-accent">Select Product *</label>
              <select id="productId" class="form-select bidly-input" formControlName="productId">
                <option value="" disabled selected class="bg-bidly-surface">-- Choose a product --</option>
                <option *ngFor="let product of myProducts" [value]="product.id" class="bg-bidly-surface">
                  {{ product.title }}
                </option>
              </select>
              <div *ngIf="submitted && f['productId'].errors" class="text-danger mt-1 small">
                Product is required.
              </div>
            </div>

            <div class="row">
              <div class="col-md-6 mb-4">
                <label for="startPrice" class="form-label fw-semibold text-bidly-accent">Starting Price ($) *</label>
                <input type="number" id="startPrice" class="form-control bidly-input" formControlName="startPrice" step="0.01" min="0.01">
                <div *ngIf="submitted && f['startPrice'].errors" class="text-danger mt-1 small">
                  Start price must be greater than 0.
                </div>
              </div>
              <div class="col-md-6 mb-4">
                <label for="minIncrement" class="form-label fw-semibold text-bidly-accent">Min Increment ($) *</label>
                <input type="number" id="minIncrement" class="form-control bidly-input" formControlName="minIncrement" step="0.01" min="0.01">
                <div *ngIf="submitted && f['minIncrement'].errors" class="text-danger mt-1 small">
                  Min increment must be greater than 0.
                </div>
              </div>
            </div>

            <div class="mb-4 pt-3 border-top border-bidly-border">
              <label for="startsAt" class="form-label fw-semibold text-bidly-accent">Start Time (Optional)</label>
              <input type="datetime-local" id="startsAt" class="form-control bidly-input" formControlName="startsAt">
              <div class="form-text text-bidly-muted">Leave blank to start immediately upon publishing.</div>
            </div>

            <div class="mb-4">
              <label for="endsAt" class="form-label fw-semibold text-bidly-accent">End Time *</label>
              <input type="datetime-local" id="endsAt" class="form-control bidly-input" formControlName="endsAt">
              <div *ngIf="submitted && f['endsAt'].errors" class="text-danger mt-1 small">
                End time is required.
              </div>
            </div>

            <div class="d-flex gap-3 pt-3 mt-4">
              <button type="button" class="btn btn-bidly-outline flex-fill py-3" routerLink="/app/seller/auctions">Cancel</button>
              <button type="submit" class="btn btn-bidly flex-fill py-3 shadow-none" [disabled]="loading">
                <span *ngIf="loading" class="spinner-border spinner-border-sm me-2"></span>
                Create Auction
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
    .text-bidly-muted { color: var(--bidly-muted); opacity: 0.7; }
    .form-control::placeholder { color: var(--bidly-muted); opacity: 0.5; }
  `]
})
export class AuctionCreateComponent implements OnInit {
    auctionForm!: FormGroup;
    myProducts: ProductResponseDTO[] = [];
    submitted = false;
    loading = false;

    constructor(
        private fb: FormBuilder,
        private auctionService: AuctionService,
        private catalogService: CatalogService,
        private router: Router
    ) { }

    ngOnInit(): void {
        this.initForm();
        this.loadProducts();
    }

    get f() {
        return this.auctionForm.controls;
    }

    private initForm(): void {
        const defaultEndTime = new Date();
        defaultEndTime.setDate(defaultEndTime.getDate() + 7); // Default 7 days from now
        // Format YYYY-MM-DDTHH:mm
        const formattedEndTime = new Date(defaultEndTime.getTime() - defaultEndTime.getTimezoneOffset() * 60000).toISOString().slice(0, 16);

        this.auctionForm = this.fb.group({
            productId: ['', Validators.required],
            startPrice: [1.00, [Validators.required, Validators.min(0.01)]],
            minIncrement: [0.50, [Validators.required, Validators.min(0.01)]],
            startsAt: [''],
            endsAt: [formattedEndTime, Validators.required]
        });
    }

    private loadProducts(): void {
        this.catalogService.listMyProducts().subscribe({
            next: (products) => {
                this.myProducts = products;
            },
            error: (err) => {
                console.error('Failed to load products', err);
            }
        });
    }

    onSubmit(): void {
        this.submitted = true;

        if (this.auctionForm.invalid) {
            return;
        }

        this.loading = true;

        // Convert local datetime to UTC ISO string
        const formValue = this.auctionForm.value;
        const requestData = {
            ...formValue,
            endsAt: new Date(formValue.endsAt).toISOString(),
            startsAt: formValue.startsAt ? new Date(formValue.startsAt).toISOString() : null
        };

        if (!requestData.startsAt) {
            delete requestData.startsAt;
        }

        this.auctionService.create(requestData).subscribe({
            next: () => {
                this.router.navigate(['/app/seller/auctions']);
            },
            error: (err) => {
                console.error('Failed to create auction', err);
                this.loading = false;
            }
        });
    }
}
