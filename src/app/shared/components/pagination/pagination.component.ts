import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="pagination-container d-flex justify-content-between align-items-center mt-4 px-4 py-3 border-top border-white border-opacity-10">
      <div class="text-secondary small">
        Showing <b>{{ startRange }}</b> to <b>{{ endRange }}</b> of <b>{{ totalItems }}</b> entries
      </div>
      
      <nav aria-label="Table pagination">
        <ul class="pagination pagination-sm mb-0 gap-1">
          <li class="page-item" [class.disabled]="currentPage === 1">
            <button class="page-link" (click)="onPageChange(currentPage - 1)" [disabled]="currentPage === 1">
              <i class="fas fa-chevron-left x-small"></i>
            </button>
          </li>
          
          <li *ngFor="let page of pages" class="page-item" [class.active]="page === currentPage">
            <button class="page-link" (click)="onPageChange(page)">{{ page }}</button>
          </li>
          
          <li class="page-item" [class.disabled]="currentPage === totalPages">
            <button class="page-link" (click)="onPageChange(currentPage + 1)" [disabled]="currentPage === totalPages">
              <i class="fas fa-chevron-right x-small"></i>
            </button>
          </li>
        </ul>
      </nav>
    </div>
  `,
  styles: [`
    .pagination-container {
      border-bottom-left-radius: 12px;
      border-bottom-right-radius: 12px;
      background: #0a121d; /* Dark blue background */
    }
    
    .page-link {
      background: rgba(57, 255, 136, 0.03);
      border: 1px solid rgba(57, 255, 136, 0.1);
      color: rgba(255, 255, 255, 0.7);
      min-width: 32px;
      height: 32px;
      padding: 0 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.85rem;
      border-radius: 8px !important;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .page-link:hover:not([disabled]) {
      background: rgba(57, 255, 136, 0.15);
      border-color: rgba(57, 255, 136, 0.3);
      color: #fff;
      transform: translateY(-1px);
    }
    
    .page-item.active .page-link {
      background: var(--bidly-accent, #39ff88);
      border-color: var(--bidly-accent, #39ff88);
      color: #000;
      font-weight: 700;
      box-shadow: 0 0 15px rgba(57, 255, 136, 0.3);
    }
    
    .page-item.disabled .page-link {
      opacity: 0.2;
      cursor: not-allowed;
      background: rgba(255, 255, 255, 0.02);
    }
    
    .x-small { font-size: 0.7rem; }
    
    b { color: var(--bidly-accent, #39ff88); }
  `]
})
export class PaginationComponent {
  @Input() totalItems = 0;
  @Input() pageSize = 10;
  @Input() currentPage = 1;
  @Output() pageChanged = new EventEmitter<number>();

  get totalPages(): number {
    return Math.ceil(this.totalItems / this.pageSize) || 1;
  }

  get pages(): number[] {
    const pages = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  get startRange(): number {
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  get endRange(): number {
    return Math.min(this.currentPage * this.pageSize, this.totalItems);
  }

  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.pageChanged.emit(page);
    }
  }
}
