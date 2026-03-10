import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-admin-dashboard',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="dashboard-container">
      <div class="welcome-card p-5 rounded-4 mb-4">
        <h1 class="display-5 fw-bold mb-2">System Overview</h1>
        <p class="text-secondary lead">Manage products, users and auction monitoring from this central dashboard.</p>
      </div>

      <div class="row g-4">
        <div class="col-md-3">
          <div class="stat-card p-4 rounded-4 shadow-sm border border-bidly-border">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <span class="text-secondary small fw-bold text-uppercase">Total Users</span>
              <i class="fas fa-users text-primary"></i>
            </div>
            <h2 class="h1 fw-bold mb-0">1,280</h2>
            <div class="text-success small mt-2">
              <i class="fas fa-arrow-up me-1"></i> +12% this month
            </div>
          </div>
        </div>

        <div class="col-md-3">
          <div class="stat-card p-4 rounded-4 shadow-sm border border-bidly-border">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <span class="text-secondary small fw-bold text-uppercase">Active Products</span>
              <i class="fas fa-box text-success"></i>
            </div>
            <h2 class="h1 fw-bold mb-0">842</h2>
            <div class="text-success small mt-2">
              <i class="fas fa-arrow-up me-1"></i> +5% from yesterday
            </div>
          </div>
        </div>

        <div class="col-md-3">
          <div class="stat-card p-4 rounded-4 shadow-sm border border-bidly-border">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <span class="text-secondary small fw-bold text-uppercase">Ongoing Auctions</span>
              <i class="fas fa-gavel text-warning"></i>
            </div>
            <h2 class="h1 fw-bold mb-0">56</h2>
            <div class="text-secondary small mt-2">
              8 starting in next hour
            </div>
          </div>
        </div>

        <div class="col-md-3">
          <div class="stat-card p-4 rounded-4 shadow-sm border border-bidly-border">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <span class="text-secondary small fw-bold text-uppercase">Revenue</span>
              <i class="fas fa-dollar-sign text-accent"></i>
            </div>
            <h2 class="h1 fw-bold mb-0">$12,450</h2>
            <div class="text-danger small mt-2">
              <i class="fas fa-arrow-down me-1"></i> -2% from peak
            </div>
          </div>
        </div>
      </div>

      <div class="mt-5">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <h3 class="h4 fw-bold mb-0">Recent Activity</h3>
          <button class="btn btn-sm btn-bidly-outline">View All</button>
        </div>
        
        <div class="bidly-card p-0 overflow-hidden shadow-lg border-0 bg-dark-subtle bg-opacity-10">
          <table class="table table-dark table-hover mb-0 align-middle">
            <thead class="bg-dark bg-opacity-50">
              <tr>
                <th class="ps-4 py-3 text-secondary small">EVENT</th>
                <th class="py-3 text-secondary small">USER</th>
                <th class="py-3 text-secondary small">TIMESTAMP</th>
                <th class="py-3 text-secondary small text-end pe-4">STATUS</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="ps-4">
                  <div class="d-flex align-items-center gap-2">
                    <i class="fas fa-user-plus text-info"></i>
                    New User Registration
                  </div>
                </td>
                <td>john.doe&#64;example.com</td>
                <td>Just now</td>
                <td class="text-end pe-4"><span class="badge bg-success bg-opacity-25 text-success">Completed</span></td>
              </tr>
              <tr>
                <td class="ps-4">
                  <div class="d-flex align-items-center gap-2">
                    <i class="fas fa-box-open text-warning"></i>
                    New Product Published
                  </div>
                </td>
                <td>seller.pro&#64;auction.net</td>
                <td>12 minutes ago</td>
                <td class="text-end pe-4"><span class="badge bg-info bg-opacity-25 text-info">Pending Review</span></td>
              </tr>
              <tr>
                <td class="ps-4">
                  <div class="d-flex align-items-center gap-2">
                    <i class="fas fa-hammer text-danger"></i>
                    New Bid Placed
                  </div>
                </td>
                <td>bidder.99&#64;gmail.com</td>
                <td>24 minutes ago</td>
                <td class="text-end pe-4"><span class="badge bg-success bg-opacity-25 text-success">Active</span></td>
              </tr>
            </tbody>
          </table>
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
    .table-hover tbody tr:hover {
      background: rgba(255, 255, 255, 0.02) !important;
    }
  `]
})
export class AdminDashboardComponent { }
