import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../../core/services/admin.service';
import {RouterLink} from '@angular/router';

@Component({
    selector: 'app-admin-dashboard',
    standalone: true,
  imports: [CommonModule, RouterLink],
    template: `
    <div class="dashboard-container">
      <div class="welcome-card p-5 rounded-4 mb-4">
        <h1 class="display-5 fw-bold mb-2">System Overview</h1>
        <p class="text-secondary lead">Manage products, users and auction monitoring from this central dashboard.</p>
      </div>

      <div class="row g-4" *ngIf="stats">
        <div class="col-md-3">
          <div class="stat-card p-4 rounded-4 shadow-sm border border-bidly-border">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <span class="text-secondary small fw-bold text-uppercase">Total Users</span>
              <i class="fas fa-users text-primary"></i>
            </div>
            <h2 class="h1 fw-bold mb-0">{{ stats.totalUsers | number }}</h2>
            <div class="text-success small mt-2">
              <i class="fas fa-check-circle me-1"></i> System Active
            </div>
          </div>
        </div>

        <div class="col-md-3">
          <div class="stat-card p-4 rounded-4 shadow-sm border border-bidly-border">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <span class="text-secondary small fw-bold text-uppercase">Active Products</span>
              <i class="fas fa-box text-success"></i>
            </div>
            <h2 class="h1 fw-bold mb-0">{{ stats.activeProducts | number }}</h2>
            <div class="text-success small mt-2">
              <i class="fas fa-tag me-1"></i> Ready for auction
            </div>
          </div>
        </div>

        <div class="col-md-3">
          <div class="stat-card p-4 rounded-4 shadow-sm border border-bidly-border">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <span class="text-secondary small fw-bold text-uppercase">Ongoing Auctions</span>
              <i class="fas fa-gavel text-warning"></i>
            </div>
            <h2 class="h1 fw-bold mb-0">{{ stats.ongoingAuctions | number }}</h2>
            <div class="text-warning small mt-2">
               Live bidding in progress
            </div>
          </div>
        </div>

        <div class="col-md-3">
          <div class="stat-card p-4 rounded-4 shadow-sm border border-bidly-border">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <span class="text-secondary small fw-bold text-uppercase">Revenue</span>
              <i class="fas fa-dollar-sign text-accent"></i>
            </div>
            <h2 class="h1 fw-bold mb-0">{{ stats.totalRevenue | currency }}</h2>
            <div class="text-accent small mt-2">
              <i class="fas fa-chart-line me-1"></i> Total Sales (Excl. Cancelled)
            </div>
          </div>
        </div>
      </div>

      <!-- Loading Placeholder -->
      <div class="row g-4" *ngIf="!stats">
         <div class="col-md-3" *ngFor="let i of [1,2,3,4]">
            <div class="stat-card p-4 rounded-4 border border-bidly-border opacity-50">
               <div class="placeholder-glow">
                  <span class="placeholder col-6 mb-3"></span>
                  <h2 class="placeholder col-8"></h2>
               </div>
            </div>
         </div>
      </div>

      <div class="mt-5">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <h3 class="h4 fw-bold mb-0">Quick Access</h3>
          <div class="d-flex gap-2">
             <button class="btn btn-sm btn-bidly-outline" routerLink="/app/admin/users">Manage Users</button>
             <button class="btn btn-sm btn-bidly-outline" routerLink="/app/admin/products">Inventory</button>
          </div>
        </div>

        <div class="row g-4">
           <div class="col-md-6">
              <div class="bidly-card p-4 h-100">
                 <h5 class="mb-3">Recent Users</h5>
                 <p class="text-secondary small">Head over to the Users section to manage roles and approvals.</p>
                 <a routerLink="/app/admin/users" class="btn btn-bidly btn-sm mt-3">Go to Users</a>
              </div>
           </div>
           <div class="col-md-6">
              <div class="bidly-card p-4 h-100">
                 <h5 class="mb-3">Live Monitoring</h5>
                 <p class="text-secondary small">Monitor real-time bids and auction statuses.</p>
                 <a routerLink="/app/admin/auctions" class="btn btn-bidly btn-sm mt-3">View Auctions</a>
              </div>
           </div>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .dashboard-container { }
    .welcome-card {
      background: linear-gradient(135deg, #121923 0%, #080a0d 100%);
      border: 1px solid rgba(57, 255, 136, 0.1);
    }
    .stat-card {
      background: #0f1620;
      transition: transform 0.2s;
    }
    .stat-card:hover {
      transform: translateY(-5px);
    }
    .text-accent { color: var(--bidly-accent); }
  `]
})
export class AdminDashboardComponent implements OnInit {
    private readonly adminService = inject(AdminService);
    stats: any;

    ngOnInit() {
        this.loadStats();
    }

    loadStats() {
        this.adminService.getDashboardStats().subscribe({
            next: (data) => this.stats = data,
            error: (err) => console.error('Failed to load dashboard stats', err)
        });
    }
}
