import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService, AdminUser } from '../../../core/services/admin.service';
import { ToastService } from '../../../core/services/toast.service';
import { MediaUrlPipe } from '../../../shared/pipes/media-url.pipe';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';

@Component({
  selector: 'app-admin-application-list',
  standalone: true,
  imports: [CommonModule, MediaUrlPipe, PaginationComponent],
    template: `
    <div class="admin-applications-container">
      <div class="mb-4">
        <h2 class="h3 fw-bold mb-1">Seller Applications</h2>
        <p class="text-secondary small mb-0">Review users requesting seller privileges.</p>
      </div>

      <div class="bidly-card p-0 overflow-hidden shadow-lg border-0 bg-dark-subtle bg-opacity-10">
        <div class="table-responsive">
          <table class="table table-dark table-hover mb-0 align-middle">
            <thead class="bg-dark bg-opacity-50">
              <tr>
                <th class="ps-4 py-3 text-secondary small">USER</th>
                <th class="py-3 text-secondary small">CONTACT</th>
                <th class="py-3 text-secondary small">CURRENT STATUS</th>
                <th class="py-3 text-secondary small text-end pe-4">DECISION</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let user of paginatedApplications">
                <td class="ps-4 py-3">
                  <div class="d-flex align-items-center gap-3">
                    <img [src]="user.photo | mediaUrl" class="user-avatar" [alt]="user.firstName">
                    <div>
                      <div class="fw-bold">{{ user.firstName }} {{ user.lastName }}</div>
                      <div class="text-secondary x-small">{{ user.email }}</div>
                    </div>
                  </div>
                </td>
                <td class="py-3 text-secondary">
                  <i class="fas fa-phone small me-2"></i> {{ user.phone || 'N/A' }}
                </td>
                <td class="py-3">
                  <span class="badge bg-warning bg-opacity-25 text-warning">{{ user.sellerStatus }}</span>
                </td>
                <td class="py-3 text-end pe-4">
                  <div class="d-flex justify-content-end gap-2">
                    <button class="btn btn-sm btn-success px-3 rounded-pill" (click)="onApprove(user.id)">
                      <i class="fas fa-check me-1"></i> Approve
                    </button>
                    <button class="btn btn-sm btn-outline-danger px-3 rounded-pill" (click)="onReject(user.id)">
                      <i class="fas fa-times me-1"></i> Reject
                    </button>
                  </div>
                </td>
              </tr>
              <tr *ngIf="applications.length === 0">
                <td colspan="4" class="text-center py-5 text-secondary">
                  <i class="fas fa-user-clock d-block mb-3 h2 opacity-25"></i>
                  No pending applications
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <app-pagination 
          [totalItems]="applications.length" 
          [pageSize]="pageSize" 
          [currentPage]="currentPage"
          (pageChanged)="onPageChange($event)">
        </app-pagination>
      </div>
    </div>
  `,
    styles: [`
    .admin-applications-container { }
    .user-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      object-fit: cover;
      background: #222;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
    .x-small { font-size: 0.75rem; }
    .btn-success { background: #10b981; border: none; }
    .btn-success:hover { background: #059669; }
  `]
})
export class AdminApplicationListComponent implements OnInit {
    private readonly adminService = inject(AdminService);
    private readonly toasts = inject(ToastService);

    applications: AdminUser[] = [];
    
    // Pagination fields
    pageSize = 10;
    currentPage = 1;

    get paginatedApplications(): AdminUser[] {
        const start = (this.currentPage - 1) * this.pageSize;
        return this.applications.slice(start, start + this.pageSize);
    }

    ngOnInit() {
        this.loadApplications();
    }

    loadApplications() {
        this.adminService.getUsers().subscribe({
            next: (users) => {
                this.applications = users.filter(u => u.sellerStatus === 'PENDING');
                this.currentPage = 1;
            },
            error: () => this.toasts.error('Failed to load applications')
        });
    }

    onPageChange(page: number) {
        this.currentPage = page;
    }

    onApprove(userId: string) {
        if (confirm('Approve this user as a seller?')) {
            this.adminService.approveSeller(userId).subscribe({
                next: () => {
                    this.toasts.success('User approved as seller');
                    this.loadApplications();
                },
                error: () => this.toasts.error('Failed to approve seller')
            });
        }
    }

    onReject(userId: string) {
        if (confirm('Reject this seller application?')) {
            this.adminService.rejectSeller(userId).subscribe({
                next: () => {
                    this.toasts.warning('Application rejected');
                    this.loadApplications();
                },
                error: () => this.toasts.error('Failed to reject application')
            });
        }
    }
}
