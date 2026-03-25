import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { AuthService } from './core/auth/auth.service';
import { of } from 'rxjs';
import { provideRouter } from '@angular/router';

describe('App', () => {
  const mockAuthService = {
    isLoggedIn: () => false,
    logout: () => { },
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        provideRouter([]),
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render title', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Hello, AuctionX');
  });
});
