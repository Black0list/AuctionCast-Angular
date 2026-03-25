import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-home',
  imports: [CommonModule, RouterLink],
  template: `
    <div class="landing-page">
      <!-- Hero Section -->
      <section class="hero-section text-center py-5 mb-5">
        <div class="container py-5">
          <h1 class="display-3 fw-bold mb-3 text-gradient">The Future of Digital Auctions</h1>
          <p class="lead text-secondary mb-4 mx-auto" style="max-width: 700px;">
            Bid, win, and trade with confidence on AuctionX. Our real-time platform connects sellers and bidders globally with unparalleled security and speed.
          </p>
          <div class="d-flex justify-content-center gap-3 mt-4">
            <button class="btn btn-bidly btn-lg px-5" routerLink="/app/auctions">
              <i class="fas fa-hammer me-2"></i> Browse Live Auctions
            </button>
            <button class="btn btn-bidly-outline btn-lg px-5" routerLink="/app/me">
              <i class="fas fa-user-circle me-2"></i> My Dashboard
            </button>
          </div>
        </div>
      </section>

      <div class="container">
        <!-- Features Section -->
        <section class="features-section mb-5">
          <div class="text-center mb-5">
            <h2 class="h1 fw-bold">Platform Superpowers</h2>
            <p class="text-secondary">Everything you need to succeed in the high-stakes world of online bidding.</p>
          </div>

          <div class="row g-4">
            <div class="col-md-4" *ngFor="let feature of features">
              <div class="feature-card p-4 rounded-4 h-100 border border-bidly-border">
                <div class="icon-box mb-4" [style.color]="feature.color">
                  <i [class]="feature.icon + ' fa-2x'"></i>
                </div>
                <h4 class="fw-bold mb-3">{{ feature.title }}</h4>
                <p class="text-secondary small mb-0">{{ feature.description }}</p>
              </div>
            </div>
          </div>
        </section>

        <!-- How it Works Section -->
        <section class="how-it-works py-5 mb-5 rounded-4 bg-dark bg-opacity-25 border border-bidly-border">
          <div class="container">
            <div class="text-center mb-5">
              <h2 class="h1 fw-bold">How It Works</h2>
              <p class="text-secondary">Start winning in 4 simple steps.</p>
            </div>
            
            <div class="row text-center g-4">
              <div class="col-md-3" *ngFor="let step of steps; let i = index">
                <div class="step-circle mx-auto mb-3">{{ i + 1 }}</div>
                <h5 class="fw-bold">{{ step.title }}</h5>
                <p class="text-secondary small">{{ step.text }}</p>
              </div>
            </div>
          </div>
        </section>

        <!-- CTA Section -->
        <section class="cta-section text-center py-5 mb-5 rounded-4 overflow-hidden">
          <div class="cta-inner p-5">
            <h2 class="display-6 fw-bold mb-3">Ready to find your next treasure?</h2>
            <p class="lead text-secondary opacity-75 mb-4">Join thousands of collectors and enthusiasts on the world's most advanced auction house.</p>
            <button class="btn btn-bidly btn-lg px-5" routerLink="/app/register">Get Started Now</button>
          </div>
        </section>
      </div>
    </div>
  `,
  styles: [`
    .text-gradient {
      background: linear-gradient(135deg, #fff 0%, var(--bidly-accent) 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    
    .hero-section {
      background: radial-gradient(circle at center, rgba(57, 255, 136, 0.05) 0%, transparent 70%);
    }

    .feature-card {
      background: #0f1620;
      transition: all 0.3s ease;
    }

    .feature-card:hover {
      transform: translateY(-10px);
      border-color: var(--bidly-accent) !important;
      box-shadow: 0 10px 30px rgba(0,0,0,0.5);
    }

    .icon-box {
      width: 60px;
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(255,255,255,0.03);
      border-radius: 12px;
    }

    .step-circle {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: var(--bidly-accent);
      color: #000;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
    }

    .cta-section {
      background: linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url('https://images.unsplash.com/photo-1554224155-1696413565d3?auto=format&fit=crop&q=80&w=1000') center/cover;
    }

    .cta-inner {
      background: rgba(15, 22, 32, 0.85);
      backdrop-filter: blur(10px);
    }
  `]
})
export class HomeComponent implements OnInit {
  features = [
    {
      title: 'Real-time Bidding',
      description: 'Experience the thrill of live auctions with instant bid updates and zero latency.',
      icon: 'fas fa-bolt',
      color: '#39ff88'
    },
    {
      title: 'Secure Wallet',
      description: 'Manage your funds securely with integrated Stripe payments and instant withdrawals.',
      icon: 'fas fa-wallet',
      color: '#00e5ff'
    },
    {
      title: 'Verified Sellers',
      description: 'Shop with peace of mind. All sellers go through a rigorous verification process.',
      icon: 'fas fa-user-check',
      color: '#ffc107'
    },
    {
      title: 'Global Shipping',
      description: 'Integrated tracking for all winning items. From the door to your hands.',
      icon: 'fas fa-shipping-fast',
      color: '#fd7e14'
    },
    {
      title: 'Smart Notifications',
      description: 'Stay ahead of the competition with instant alerts for bids and outbids.',
      icon: 'fas fa-bell',
      color: '#6f42c1'
    },
    {
      title: 'Admin Oversight',
      description: 'Dedicated support team ensuring every transaction is fair and transparent.',
      icon: 'fas fa-shield-halved',
      color: '#dc3545'
    }
  ];

  steps = [
    { title: 'Create Account', text: 'Register and verify your profile in minutes.' },
    { title: 'Find Items', text: 'Browse our curated catalog of premium products.' },
    { title: 'Place Bids', text: 'Participate in live auctions with real-time feedback.' },
    { title: 'Claim Prize', text: 'Win and enjoy seamless delivery to your doorstep.' }
  ];

  ngOnInit(): void { }
}
