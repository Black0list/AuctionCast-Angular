import { Component, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { catchError, of, tap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { CatalogService } from '../../core/services/catalog.service';
import { ProductResponseDTO } from '../../core/models/catalog.models';
import { environment } from '../../../environments/environment';
import { RouterLink } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-products-active',
  imports: [CommonModule, RouterLink],
  styleUrl: './products-active.component.css',
  templateUrl : './products-active.component.html',
})
export class ProductsActiveComponent {
  private readonly destroyRef = inject(DestroyRef);

  apiUrl = environment.apiUrl;


  loading = false;
  error: string | null = null;
  products: ProductResponseDTO[] = [];

  constructor(private readonly catalog: CatalogService) {
    this.load();
  }

  absoluteUrl(pathOrUrl?: string | null): string | null {
    if (!pathOrUrl) return null;
    if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;

    const base = environment.apiUrl.replace(/\/+$/, '');
    const path = pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`;
    return `${base}${path}`.replace(/([^:]\/)\/+/g, '$1');
  }

  coverUrl(p: ProductResponseDTO): string | null {
    const cover =
      p.imageUrls?.find((x) => x.cover)?.imageUrl ??
      p.imageUrls?.[0]?.imageUrl ??
      null;

    return this.absoluteUrl(this.apiUrl + cover);
  }

  load(): void {
    this.loading = true;
    this.error = null;

    this.catalog
      .listActiveProducts()
      .pipe(
        tap((items) => (this.products = items ?? [])),
        catchError((e) => {
          this.error = e?.error?.message ?? 'Failed to load products';
          this.products = [];
          return of([]);
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => {
        this.loading = false;
      });
  }
}
