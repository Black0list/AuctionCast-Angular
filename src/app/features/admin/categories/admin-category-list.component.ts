import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CatalogService } from '../../../core/services/catalog.service';
import { ToastService } from '../../../core/services/toast.service';
import { CategoryResponseDTO, CategoryDTO } from '../../../core/models/catalog.models';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';

@Component({
  selector: 'app-admin-category-list',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginationComponent],
  template: `
    <div class="admin-categories-container">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 class="h3 fw-bold mb-1">Category Management</h2>
          <p class="text-secondary small mb-0">Add, edit, or remove product categories.</p>
        </div>
        <div class="d-flex gap-3">
          <div class="search-box">
            <i class="fas fa-search"></i>
            <input type="text" placeholder="Search categories..." class="form-control" (input)="onSearch($event)">
          </div>
          <button class="btn btn-bidly-primary" (click)="openCreateModal()">
            <i class="fas fa-plus me-2"></i> New Category
          </button>
        </div>
      </div>

      <div class="bidly-card p-0 overflow-hidden shadow-lg border-0 bg-dark-subtle bg-opacity-10">
        <div class="table-responsive">
          <table class="table table-dark table-hover mb-0 align-middle">
            <thead class="bg-dark bg-opacity-50">
              <tr>
                <th class="ps-4 py-3 text-secondary small">NAME</th>
                <th class="py-3 text-secondary small">DESCRIPTION</th>
                <th class="py-3 text-secondary small text-end pe-4">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let category of paginatedCategories">
                <td class="ps-4 py-3">
                  <div class="fw-bold">{{ category.name }}</div>
                </td>
                <td class="py-3 text-secondary">
                  <div class="text-truncate" style="max-width: 300px;">{{ category.description }}</div>
                </td>
                <td class="py-3 text-end pe-4">
                  <div class="d-flex justify-content-end gap-2">
                    <button class="btn btn-sm btn-icon-only text-info" title="Edit" (click)="openEditModal(category)">
                      <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-icon-only text-danger" title="Hard Delete" (click)="onDelete(category.name, true)">
                      <i class="fas fa-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
              <tr *ngIf="filteredCategories.length === 0">
                <td colspan="4" class="text-center py-5 text-secondary">
                  <i class="fas fa-tags d-block mb-3 h2 opacity-25"></i>
                  No categories found
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <app-pagination
          [totalItems]="filteredCategories.length"
          [pageSize]="pageSize"
          [currentPage]="currentPage"
          (pageChanged)="onPageChange($event)">
        </app-pagination>
      </div>

      <!-- Add/Edit Modal (Simulated with absolute overlay for simplicity) -->
      <div class="modal fade" [class.show]="showModal" [style.display]="showModal ? 'block' : 'none'" tabindex="-1">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content bidly-card border-0 bg-dark shadow-lg">
            <div class="modal-header border-bottom border-secondary border-opacity-25">
              <h5 class="modal-title fw-bold">{{ isEditMode ? 'Edit Category' : 'New Category' }}</h5>
              <button type="button" class="btn-close btn-close-white" (click)="closeModal()"></button>
            </div>
            <div class="modal-body py-4">
              <div class="mb-3">
                <label class="form-label text-secondary small text-uppercase fw-bold">Name</label>
                <input type="text" class="form-control bg-dark text-white border-secondary border-opacity-25" [(ngModel)]="currentCategory.name" [disabled]="isEditMode">
                <small *ngIf="isEditMode" class="text-secondary mt-1 d-block"><i class="fas fa-info-circle me-1"></i>Category name cannot be changed.</small>
              </div>
              <div class="mb-3">
                <label class="form-label text-secondary small text-uppercase fw-bold">Description</label>
                <textarea class="form-control bg-dark text-white border-secondary border-opacity-25" rows="3" [(ngModel)]="currentCategory.description"></textarea>
              </div>
            </div>
            <div class="modal-footer border-top border-secondary border-opacity-25">
              <button type="button" class="btn btn-outline-secondary" (click)="closeModal()">Cancel</button>
              <button type="button" class="btn btn-bidly-primary px-4" (click)="saveCategory()" [disabled]="!currentCategory.name || !currentCategory.description">
                {{ isEditMode ? 'Update' : 'Create' }}
              </button>
            </div>
          </div>
        </div>
      </div>
      <div *ngIf="showModal" class="modal-backdrop fade show"></div>
    </div>
  `,
  styles: [`
    .search-box {
      position: relative;
      width: 250px;
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
export class AdminCategoryListComponent implements OnInit {
  private readonly catalogService = inject(CatalogService);
  private readonly toasts = inject(ToastService);

  categories: CategoryResponseDTO[] = [];
  filteredCategories: CategoryResponseDTO[] = [];
  searchTerm = '';

  pageSize = 10;
  currentPage = 1;

  showModal = false;
  isEditMode = false;
  currentCategory: CategoryDTO = { name: '', description: '' };
  originalName = '';

  get paginatedCategories(): CategoryResponseDTO[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredCategories.slice(start, start + this.pageSize);
  }

  ngOnInit() {
    this.loadCategories();
  }

  loadCategories() {
    this.catalogService.getCategories().subscribe({
      next: (data) => {
        this.categories = data;
        this.applyFilter();
      },
      error: () => this.toasts.error('Failed to load categories')
    });
  }

  onSearch(event: Event) {
    this.searchTerm = (event.target as HTMLInputElement).value.toLowerCase();
    this.currentPage = 1;
    this.applyFilter();
  }

  onPageChange(page: number) {
    this.currentPage = page;
  }

  applyFilter() {
    this.filteredCategories = this.categories.filter(c =>
      c.name.toLowerCase().includes(this.searchTerm) ||
      (c.description || '').toLowerCase().includes(this.searchTerm)
    );
  }

  openCreateModal() {
    this.isEditMode = false;
    this.currentCategory = { name: '', description: '' };
    this.showModal = true;
  }

  openEditModal(category: CategoryResponseDTO) {
    this.isEditMode = true;
    this.originalName = category.name;
    this.currentCategory = { name: category.name, description: category.description };
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  saveCategory() {
    if (this.isEditMode) {
      this.catalogService.updateCategory(this.originalName, this.currentCategory).subscribe({
        next: () => {
          this.toasts.success('Category updated successfully');
          this.closeModal();
          this.loadCategories();
        },
        error: () => this.toasts.error('Failed to update category')
      });
    } else {
      this.catalogService.createCategory(this.currentCategory).subscribe({
        next: () => {
          this.toasts.success('Category created successfully');
          this.closeModal();
          this.loadCategories();
        },
        error: () => this.toasts.error('Failed to create category')
      });
    }
  }

  onDelete(name: string, hard: boolean) {
    const action = hard ? 'permanently delete' : 'deactivate';
    if (confirm(`Are you sure you want to ${action} the category '${name}'?`)) {
      this.catalogService.deleteCategory(name, hard).subscribe({
        next: () => {
          this.toasts.success(`Category ${hard ? 'deleted' : 'deactivated'} successfully`);
          this.loadCategories();
        },
        error: () => this.toasts.error(`Failed to ${hard ? 'delete' : 'deactivate'} category`)
      });
    }
  }
}
