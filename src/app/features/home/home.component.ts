import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-home',
  imports: [CommonModule],
  template: `
    <div class="container py-4">
      <div class="bidly-card p-4">
        <h3 class="mb-2">Bidly</h3>
        <p class="text-secondary mb-0">
          Home placeholder. Next step we add: Active Auctions + My Purchases/Sales.
        </p>
      </div>
    </div>
  `,
})
export class HomeComponent {}
