import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { HomeComponent } from './features/home/home.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { authGuard } from './core/guards/auth.guard';
import { ProfileComponent } from './features/profile/profile.component';
import { ProductsActiveComponent } from './features/products-active/products-active.component';
import { SellerGuard } from './core/guards/seller.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  {
    path: 'app',
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', component: HomeComponent },
      { path: 'me', component: ProfileComponent },
      { path: 'products', component: ProductsActiveComponent },
      {
        path: 'auctions',
        loadComponent: () => import('./features/auctions/active-auctions-list/active-auctions-list.component').then(m => m.ActiveAuctionsListComponent)
      },
      {
        path: 'auctions/:id/bid',
        loadComponent: () => import('./features/auctions/live-bidding/live-bidding.component').then(m => m.LiveBiddingComponent)
      },
      {
        path: 'wallet',
        loadComponent: () => import('./features/wallet/wallet.component').then(m => m.WalletComponent)
      },
      {
        path: 'products/:id',
        loadComponent: () => import('./features/products/product-details/product-details.component').then(m => m.ProductDetailsComponent)
      },
      {
        path: 'me/purchases',
        loadComponent: () => import('./features/profile/purchases/my-purchases.component').then(m => m.MyPurchasesComponent)
      },
      {
        path: 'seller/products',
        canActivate: [SellerGuard],
        children: [
          {
            path: '',
            loadComponent: () => import('./features/seller/products/product-list/product-list.component').then(m => m.ProductListComponent)
          },
          {
            path: 'new',
            loadComponent: () => import('./features/seller/products/product-create/product-create.component').then(m => m.ProductCreateComponent)
          },
          {
            path: ':id/edit',
            loadComponent: () => import('./features/seller/products/product-edit/product-edit.component').then(m => m.ProductEditComponent)
          },
        ]
      },
      {
        path: 'seller/auctions',
        canActivate: [SellerGuard],
        children: [
          {
            path: '',
            loadComponent: () => import('./features/seller/auctions/auction-list/auction-list.component').then(m => m.AuctionListComponent)
          },
          {
            path: 'new',
            loadComponent: () => import('./features/seller/auctions/auction-create/auction-create.component').then(m => m.AuctionCreateComponent)
          }
        ]
      },
      {
        path: 'seller/sales',
        canActivate: [SellerGuard],
        loadComponent: () => import('./features/seller/sales/my-sales.component').then(m => m.MySalesComponent)
      },
      {
        path: 'admin',
        loadComponent: () => import('./features/admin/layout/admin-layout.component').then(m => m.AdminLayoutComponent),
        children: [
          { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
          {
            path: 'dashboard',
            loadComponent: () => import('./features/admin/dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent)
          },
          {
            path: 'products',
            loadComponent: () => import('./features/admin/products/admin-product-list.component').then(m => m.AdminProductListComponent)
          },
          {
            path: 'applications',
            loadComponent: () => import('./features/admin/applications/admin-application-list.component').then(m => m.AdminApplicationListComponent)
          },
          {
            path: 'users',
            loadComponent: () => import('./features/admin/users/admin-user-list.component').then(m => m.AdminUserListComponent)
          },
          {
            path: 'auctions',
            loadComponent: () => import('./features/admin/auctions/admin-auction-list.component').then(m => m.AdminAuctionListComponent)
          },
          {
            path: 'orders',
            loadComponent: () => import('./features/admin/orders/admin-order-list.component').then(m => m.AdminOrderListComponent)
          }
        ]
      }
    ],
  },

  { path: '', redirectTo: 'app', pathMatch: 'full' },
  { path: '**', redirectTo: 'app' },
];
