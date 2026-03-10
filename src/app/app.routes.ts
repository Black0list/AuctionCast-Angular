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
        path: 'products/:id',
        loadComponent: () => import('./features/products/product-details/product-details.component').then(m => m.ProductDetailsComponent)
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
        path: 'admin',
        // TODO: add AdminGuard
        loadComponent: () => import('./features/admin/layout/admin-layout.component').then(m => m.AdminLayoutComponent),
        children: [
          { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
          {
            path: 'dashboard',
            loadComponent: () => import('./features/admin/dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent)
          }
        ]
      }
    ],
  },

  { path: '', redirectTo: 'app', pathMatch: 'full' },
  { path: '**', redirectTo: 'app' },
];
