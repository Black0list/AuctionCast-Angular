import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService, AdminUser } from '../../../core/services/admin.service';
import { ToastService } from '../../../core/services/toast.service';
import { MediaUrlPipe } from '../../../shared/pipes/media-url.pipe';

@Component({
    selector: 'app-admin-user-list',
    standalone: true,
    imports: [CommonModule, MediaUrlPipe],
    template: `
    <div class="admin-users-container">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 class="h3 fw-bold mb-1">User Management</h2>
          <p class="text-secondary small mb-0">Total of {{ users.length }} registered users.</p>
        </div>
      </div>

      <div class="bidly-card p-0 overflow-hidden shadow-lg border-0 bg-dark-subtle bg-opacity-10">
        <div class="table-responsive">
          <table class="table table-dark table-hover mb-0 align-middle">
            <thead class="bg-dark bg-opacity-50">
              <tr>
                <th class="ps-4 py-3 text-secondary small">USER</th>
                <th class="py-3 text-secondary small">PHONE</th>
                <th class="py-3 text-secondary small">SELLER STATUS</th>
                <th class="py-3 text-secondary small">ACCOUNT</th>
                <th class="py-3 text-secondary small text-end pe-4">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let user of users">
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
                  {{ user.phone || 'N/A' }}
                </td>
                <td class="py-3">
                  <span [class]="'badge bg-opacity-25 ' + getSellerStatusClass(user.sellerStatus)">
                    {{ user.sellerStatus }}
                  </span>
                </td>
                <td class="py-3">
                  <span *ngIf="user.isActive" class="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25">Active</span>
                  <span *ngIf="!user.isActive" class="badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25">Inactive</span>
                </td>
                <td class="py-3 text-end pe-4">
                  <div class="d-flex justify-content-end gap-2">
                    <button class="btn btn-sm btn-icon-only text-danger" title="Delete User" (click)="onDelete(user.id)">
                      <i class="fas fa-trash-alt"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .admin-users-container { }
    .user-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      object-fit: cover;
      background: #222;
    }
    .x-small { font-size: 0.7rem; }
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
  `]
})
export class AdminUserListComponent implements OnInit {
    private readonly adminService = inject(AdminService);
    private readonly toasts = inject(ToastService);

    users: AdminUser[] = [];

    ngOnInit() {
        this.loadUsers();
    }

    loadUsers() {
        this.adminService.getUsers().subscribe({
            next: (users) => this.users = users,
            error: () => this.toasts.error('Failed to load users')
        });
    }

    getSellerStatusClass(status: string): string {
        switch (status) {
            case 'APPROVED': return 'bg-success text-success';
            case 'PENDING': return 'bg-warning text-warning';
            case 'REJECTED': return 'bg-danger text-danger';
            default: return 'bg-secondary text-secondary';
        }
    }

    onDelete(userId: string) {
        if (confirm('Permanently delete this user? This cannot be undone.')) {
            this.adminService.deleteUser(userId, true).subscribe({
                next: () => {
                    this.toasts.success('User deleted');
                    this.loadUsers();
                },
                error: () => this.toasts.error('Failed to delete user')
            });
        }
    }
}
