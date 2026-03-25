import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router } from '@angular/router';
import { NavbarComponent } from './core/components/navbar/navbar';
import { ToastComponent } from './shared/components/toast/toast';

@Component({
  standalone: true,
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, NavbarComponent, ToastComponent],
  template: `
    <app-toast></app-toast>
    <app-navbar *ngIf="shouldShowNavbar()"></app-navbar>
    <router-outlet></router-outlet>
  `,
})
export class App {
  constructor(private router: Router) { }

  shouldShowNavbar(): boolean {
    const url = this.router.url;
    return !url.includes('/login') && !url.includes('/register') && !url.startsWith('/app/admin');
  }
}
