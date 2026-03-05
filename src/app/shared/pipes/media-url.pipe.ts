import { Pipe, PipeTransform } from '@angular/core';
import { environment } from '../../../environments/environment';

@Pipe({
    name: 'mediaUrl',
    standalone: true
})
export class MediaUrlPipe implements PipeTransform {
    transform(value: string | undefined): string {
        if (!value) return 'assets/placeholder-product.png';
        const cleanPath = value.replace(/\/+/g, '/');
        const path = cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`;
        return `${environment.apiUrl}${path}`;
    }
}
