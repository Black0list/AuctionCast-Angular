import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuctionService } from '../../../../core/services/auction.service';
import { ToastService } from '../../../../core/services/toast.service';
import { AuctionResponse } from '../../../../core/models/auction.models';

import { MediaUrlPipe } from '../../../../shared/pipes/media-url.pipe';

@Component({
    selector: 'app-auction-list',
    standalone: true,
    imports: [CommonModule, RouterLink, MediaUrlPipe],
    template: `
    <div class="container py-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2 class="h3 mb-0">My Auctions</h2>
        <a routerLink="new" class="btn btn-bidly">Create Auction</a>
      </div>

      <div *ngIf="auctions.length === 0" class="text-center py-5 bg-bidly-surface rounded border border-bidly-border border-dashed">
        <p class="text-bidly-muted mb-3">You haven't created any auctions yet.</p>
        <a routerLink="new" class="btn btn-bidly-outline">Create your first auction</a>
      </div>

      <div class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
        <div class="col" *ngFor="let auction of auctions">
          <div class="card bidly-card h-100 shadow-lg border-0 overflow-hidden">
            <div class="position-relative">
              <img *ngIf="auction.product?.imageUrls?.length; else placeholder"
                   [src]="auction.product.imageUrls![0].imageUrl | mediaUrl" 
                   class="card-img-top" [alt]="auction.product.title"
                   style="height: 200px; object-fit: cover; filter: brightness(0.9);">
              <ng-template #placeholder>
                <div class="bg-secondary d-flex justify-content-center align-items-center" style="height: 200px;">
                  <i class="fas fa-image text-white opacity-50" style="font-size: 3rem;"></i>
                </div>  
              </ng-template>     
              <div class="position-absolute top-0 end-0 m-2">
                <span class="badge" 
                  [class.bg-secondary]="auction.status === 'DRAFT'"
                  [class.bg-info]="auction.status === 'SCHEDULED'"
                  [class.bg-success]="auction.status === 'ACTIVE'"
                  [class.bg-warning]="auction.status === 'ENDED'"
                  [class.bg-danger]="auction.status === 'CANCELLED'">
                  {{ auction.status }}
                </span>
              </div>
            </div>
            <div class="card-body d-flex flex-column p-4">
              <h5 class="card-title h6 fw-bold mb-2 text-white">{{ auction.product.title }}</h5>
              
              <div class="mb-3 d-flex gap-2 flex-wrap">
                <span class="badge bg-bidly-surface border-bidly-muted text-bidly-accent px-2 py-1">{{ auction.product.categoryName }}</span>
                <span class="badge bg-bidly-surface border-bidly-muted text-bidly-muted px-2 py-1">{{ auction.product.condition }}</span>
              </div>
              
              <div class="small text-bidly-muted mb-3 d-flex flex-column gap-1">
                <div *ngIf="auction.startsAt"><i class="fas fa-clock fs-6 me-2" style="width: 16px; text-align: center;"></i>Starts: <span class="text-white">{{ auction.startsAt | date:'short' }}</span></div>
                <div *ngIf="auction.endsAt"><i class="fas fa-flag-checkered fs-6 me-2" style="width: 16px; text-align: center;"></i>Ends: <span class="text-white">{{ auction.endsAt | date:'short' }}</span></div>
              </div>

              <div *ngIf="auction.status === 'ENDED'" class="mb-3 p-3 rounded" style="background: rgba(40, 167, 69, 0.05); border: 1px dashed rgba(40, 167, 69, 0.3);">
                <div class="d-flex align-items-center gap-3">
                  <div class="bg-success bg-opacity-10 text-success rounded-circle d-flex align-items-center justify-content-center" style="width: 40px; height: 40px;">
                    <i class="fas fa-trophy text-warning"></i>
                  </div>
                  <div *ngIf="auction.winner; else noWinner">
                    <div class="small text-success fw-bold text-uppercase" style="font-size: 0.7rem; letter-spacing: 0.5px;">Winner</div>
                    <div class="fw-semibold text-white d-flex align-items-center gap-2 mt-1">
                      <img *ngIf="auction.winner.photo; else fallbackPhoto" [src]="auction.winner.photo | mediaUrl" class="rounded-circle" width="20" height="20" style="object-fit: cover;">
                      <ng-template #fallbackPhoto>
                        <i class="bi bi-person-circle fs-6"></i>
                      </ng-template>
                      <span>{{ auction.winner.firstName }} {{ auction.winner.lastName }}</span>
                    </div>
                  </div>
                  <ng-template #noWinner>
                    <div class="small text-success fw-bold text-uppercase" style="font-size: 0.7rem; letter-spacing: 0.5px;">Winner</div>
                    <div class="fw-semibold text-bidly-muted mt-1 small">
                      <i class="bi bi-dash-circle me-1"></i> None
                    </div>
                  </ng-template>
                </div>
              </div>

              <div class="d-flex justify-content-between align-items-center mb-1 bg-bidly-surface p-2 rounded border border-bidly-border">
                <span class="text-bidly-muted small">Start: <span class="fw-semibold text-white">\${{ auction.startPrice }}</span></span>
                <span class="text-bidly-muted small">Step: <span class="fw-semibold text-white">\${{ auction.minIncrement }}</span></span>
              </div>
              
              <div class="d-flex justify-content-between align-items-center mt-auto pt-3 border-top border-bidly-border">
                <div class="d-flex flex-column">
                  <span class="text-bidly-accent fw-medium" style="font-size: 0.8rem;">Current Bid</span>
                  <span class="text-bidly-accent fw-bold fs-5">\${{ auction.currentPrice || auction.startPrice }}</span>
                </div>
                <div class="text-end text-bidly-muted bg-bidly-surface px-2 py-1 rounded border border-bidly-border">
                  <small><i class="bi bi-hammer me-1"></i> {{ auction.bidCount }} Bids</small>
                </div>
              </div>
            </div>
            <div class="card-footer bg-bidly-surface border-top-0 d-flex gap-2 p-3">
              <button *ngIf="auction.status === 'DRAFT'" class="btn btn-sm btn-bidly-outline flex-grow-1 py-2" (click)="publishNow(auction.id)">Publish</button>
              <button *ngIf="auction.status === 'ACTIVE'" class="btn btn-sm btn-danger flex-grow-1 py-2 shadow-none border-0" (click)="endAuction(auction.id)" style="background: var(--bidly-danger);">End Now</button>
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
    .border-bidly-border { border-color: var(--bidly-border) !important; }
    .border-dashed { border-style: dashed !important; }
  `]
})
export class AuctionListComponent implements OnInit {
    auctions: AuctionResponse[] = [];

    constructor(private auctionService: AuctionService, private toastService: ToastService) { }

    ngOnInit(): void {
        this.loadAuctions();
    }

    loadAuctions(): void {
        this.auctionService.listMyAuctions().subscribe({
            next: (data) => {
                this.auctions = data;
            },
            error: (err) => {
                console.error('Failed to load auctions', err);
                this.toastService.error('Failed to load auctions.');
            }
        });
    }

    publishNow(id: string): void {
        this.auctionService.publishNow(id).subscribe({
            next: () => {
                this.toastService.success('Auction published successfully!');
                this.loadAuctions();
            },
            error: (err) => {
                console.error('Failed to publish auction', err);
                this.toastService.error(err?.error?.message || 'Failed to publish auction.');
            }
        });
    }

    endAuction(id: string): void {
        if (confirm('Are you sure you want to end this auction?')) {
            this.auctionService.end(id).subscribe({
                next: () => {
                    this.toastService.success('Auction ended explicitly.');
                    this.loadAuctions();
                },
                error: (err) => {
                    console.error('Failed to end auction', err);
                    this.toastService.error(err?.error?.message || 'Failed to end auction.');
                }
            });
        }
    }
}
