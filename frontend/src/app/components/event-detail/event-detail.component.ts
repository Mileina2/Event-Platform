import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { AuthContextService } from '../../services/auth-context.service';
import { Event } from '../../models/event.model';
import { Registration } from '../../models/registration.model';

@Component({
  selector: 'app-event-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="event-detail">
      @if (loading()) {
        <p>Loading...</p>
      } @else if (event()) {
        <div class="card">
          <div class="header-actions">
            <h2>{{ event()!.title }}</h2>
            @if (getCurrentUserId()) {
              <button (click)="toggleFavorite()" [class.favorited]="isFavorite()" class="fav-btn" [disabled]="actionLoading()">
                {{ isFavorite() ? '♥' : '♡' }}
              </button>
            }
          </div>
          
          @if (tags().length > 0) {
            <div class="tags">
              @for (tag of tags(); track tag.id) {
                <span class="tag" [style.background-color]="tag.color">{{ tag.name }}</span>
              }
            </div>
          }

          <p class="description">{{ event()!.description || 'No description.' }}</p>
          <div class="meta">
            <span>📅 {{ event()!.date | date:'medium' }}</span>
            <span>📊 {{ event()!.status }}</span>
            <span>👥 {{ regCount() }} / {{ event()!.capacity }} spots</span>
          </div>

          <div class="organizer-info">
            <p><strong>Organizer:</strong> <a [routerLink]="['/profile', event()!.organizerId]">View Profile</a></p>
          </div>

          @if (event()!.status === 'PUBLISHED' && regCount() >= event()!.capacity) {
            <div class="waitlist-info">
              <p>⏳ Event is full. Waitlist: {{ waitlist().length }} people</p>
              @if (isOnWaitlist()) {
                <p>Your position: #{{ waitlistPosition() }}</p>
              }
            </div>
          }

          @if (error()) {
            <p class="error">{{ error() }}</p>
          }

          <div class="actions">
            @if (canRegister()) {
              <button (click)="register()" [disabled]="actionLoading()">Register</button>
            }
            @if (!canRegister() && event()!.status === 'PUBLISHED' && regCount() >= event()!.capacity) {
              @if (isOnWaitlist()) {
                <button class="outline" (click)="leaveWaitlist()" [disabled]="actionLoading()">Leave waitlist (pos {{ waitlistPosition() }})</button>
              } @else {
                <button (click)="joinWaitlist()" [disabled]="actionLoading()">Join waitlist</button>
              }
            }
            @if (canUnregister()) {
              <button class="outline" (click)="unregister()" [disabled]="actionLoading()">Unregister</button>
            }
            @if (canEdit()) {
              <a [routerLink]="['/events', event()!.id, 'edit']" class="btn">Edit</a>
            }
            @if (canPublish()) {
              <button (click)="publish()" [disabled]="actionLoading()">Publish</button>
            }
            @if (canClose()) {
              <button (click)="close()" [disabled]="actionLoading()">Close</button>
            }
          </div>
        </div>

        <div class="card ratings-section">
          <h3>⭐ Ratings & Reviews</h3>
          <div class="rating-stats">
            <div class="avg-rating">
              <span class="big-number">{{ ratingStats().average }}</span>
              <span class="count">({{ ratingStats().count }} reviews)</span>
            </div>
          </div>

          @if (getCurrentUserId()) {
            <div class="add-review">
              <h4>Leave a Review</h4>
              <div class="rating-input">
                <label>Rating:</label>
                <div class="stars">
                  @for (star of [1, 2, 3, 4, 5]; track star) {
                    <button (click)="setRating(star)" [class.selected]="selectedRating() === star" class="star-btn">
                      {{ selectedRating() >= star ? '★' : '☆' }}
                    </button>
                  }
                </div>
              </div>
              <label>Review:</label>
              <textarea [(ngModel)]="reviewText" placeholder="Share your thoughts..."></textarea>
              <button (click)="submitRating()" [disabled]="!selectedRating() || actionLoading()">Submit Review</button>
            </div>
          }

          @if (ratings().length > 0) {
            <div class="reviews-list">
              <h4>All Reviews</h4>
              @for (review of ratings(); track review.id) {
                <div class="review">
                  <div class="review-header">
                    <span class="rating">{{ '★'.repeat(review.rating) }}{{ '☆'.repeat(5 - review.rating) }}</span>
                    <span class="user">{{ review.email }}</span>
                  </div>
                  @if (review.review) {
                    <p>{{ review.review }}</p>
                  }
                </div>
              }
            </div>
          }
        </div>
      } @else {
        <p>Event not found.</p>
      }
      <a routerLink="/events" class="back">← Back to list</a>
    </div>
  `,
  styles: [`
    .event-detail { padding: 1rem; max-width: 700px; }
    .card { background: var(--surface-2); padding: 1.5rem; border-radius: 8px; margin-bottom: 1rem; }
    .card h3 { margin-top: 0; color: var(--text); }
    .card h4 { margin: 1rem 0 0.5rem 0; font-size: 1rem; }
    .header-actions { display: flex; justify-content: space-between; align-items: start; gap: 1rem; }
    .header-actions h2 { margin: 0; flex: 1; }
    .fav-btn { background: none; border: none; font-size: 1.5rem; cursor: pointer; color: var(--accent); }
    .fav-btn.favorited { color: #ef4444; }
    .tags { display: flex; gap: 0.5rem; flex-wrap: wrap; margin: 0.5rem 0; }
    .tag { padding: 0.25rem 0.75rem; border-radius: 12px; color: white; font-size: 0.8rem; }
    .description { color: var(--text-muted); margin: 0.5rem 0; }
    .meta { display: flex; gap: 1rem; font-size: 0.9rem; margin-bottom: 1rem; }
    .organizer-info { background: var(--surface-1); padding: 0.75rem; border-radius: 6px; font-size: 0.9rem; margin: 0.5rem 0; }
    .organizer-info a { color: var(--accent); text-decoration: none; }
    .waitlist-info { background: var(--surface-1); padding: 0.75rem; border-radius: 6px; margin: 0.5rem 0; }
    .error { color: var(--error); font-size: 0.9rem; }
    .actions { display: flex; gap: 0.5rem; flex-wrap: wrap; }
    .actions button, .actions .btn { padding: 0.5rem 1rem; border-radius: 6px; border: none; cursor: pointer; text-decoration: none; font-size: 0.9rem; }
    .actions button { background: var(--accent); color: white; }
    .actions button.outline { background: transparent; border: 1px solid var(--border); }
    .actions button:disabled { opacity: 0.6; cursor: not-allowed; }
    .back { color: var(--accent); text-decoration: none; display: inline-block; margin-top: 1rem; }
    
    .ratings-section { }
    .rating-stats { display: flex; gap: 1rem; margin: 1rem 0; }
    .avg-rating { text-align: center; }
    .big-number { font-size: 2rem; font-weight: bold; display: block; }
    .count { font-size: 0.9rem; color: var(--text-muted); }
    
    .add-review { background: var(--surface-1); padding: 1rem; border-radius: 6px; margin: 1rem 0; }
    .add-review label { display: block; margin: 0.5rem 0 0.25rem 0; font-weight: 500; font-size: 0.9rem; }
    .add-review textarea { width: 100%; padding: 0.5rem; border: 1px solid var(--border); border-radius: 4px; font-family: inherit; box-sizing: border-box; }
    .add-review button { margin-top: 0.5rem; background: var(--accent); color: white; padding: 0.5rem 1rem; border: none; border-radius: 4px; cursor: pointer; }
    .add-review button:disabled { opacity: 0.6; }
    
    .stars { display: flex; gap: 0.25rem; }
    .star-btn { background: none; border: none; font-size: 1.5rem; cursor: pointer; color: var(--text-muted); }
    .star-btn.selected { color: #fbbf24; }
    
    .reviews-list { margin-top: 1rem; }
    .review { background: var(--surface-1); padding: 0.75rem; border-radius: 6px; margin-bottom: 0.5rem; }
    .review-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; }
    .review-header .rating { color: #fbbf24; font-size: 0.9rem; }
    .review-header .user { font-size: 0.85rem; color: var(--text-muted); }
    .review p { margin: 0.25rem 0; font-size: 0.9rem; }
  `]
})
export class EventDetailComponent {
  private api = inject(ApiService);
  private auth = inject(AuthContextService);
  private route = inject(ActivatedRoute);
  
  event = signal<Event | null>(null);
  registrations = signal<Registration[]>([]);
  waitlist = signal<any[]>([]);
  tags = signal<any[]>([]);
  ratings = signal<any[]>([]);
  ratingStats = signal<{ average: number; count: number }>({ average: 0, count: 0 });
  isFavoriteSignal = signal(false);
  selectedRating = signal(0);
  reviewText = '';
  
  loading = signal(true);
  actionLoading = signal(false);
  error = signal<string | null>(null);

  regCount = () => this.registrations().length;

  isFavorite() {
    return this.isFavoriteSignal();
  }

  getCurrentUserId() {
    return this.auth.userId();
  }

  canRegister() {
    const e = this.event();
    const uid = this.auth.userId();
    if (!e || !uid) return false;
    if (e.status !== 'PUBLISHED') return false;
    if (this.regCount() >= e.capacity) return false;
    if (e.organizerId === uid) return false;
    if (this.waitlist().some(w => w.userId === uid)) return false;
    return !this.registrations().some(r => r.userId === uid);
  }

  isOnWaitlist() {
    const w = this.waitlist();
    const uid = this.auth.userId();
    return w.some(entry => entry.userId === uid);
  }

  waitlistPosition() {
    const w = this.waitlist();
    const uid = this.auth.userId();
    const idx = w.findIndex(entry => entry.userId === uid);
    return idx >= 0 ? idx + 1 : -1;
  }

  canUnregister() {
    const uid = this.auth.userId();
    return !!uid && this.registrations().some(r => r.userId === uid);
  }

  canEdit() {
    const e = this.event();
    const uid = this.auth.userId();
    const role = this.auth.userRole();
    if (!e || !uid) return false;
    return role === 'ADMIN' || (role === 'ORGANIZER' && e.organizerId === uid);
  }

  canPublish() {
    const e = this.event();
    return this.canEdit() && e?.status === 'DRAFT';
  }

  canClose() {
    const e = this.event();
    return this.canEdit() && (e?.status === 'PUBLISHED' || e?.status === 'DRAFT');
  }

  constructor() {
    this.route.paramMap.subscribe(params => {
      const id = Number(params.get('id'));
      if (!id) return;
      this.loading.set(true);
      
      // Load event details
      this.api.getEvent(id).subscribe({
        next: ev => { this.event.set(ev); this.loading.set(false); },
        error: () => this.loading.set(false)
      });
      
      // Load registrations, waitlist, tags, ratings
      this.api.getEventRegistrations(id).subscribe(r => this.registrations.set(r));
      this.api.getEventWaitlist(id).subscribe(w => this.waitlist.set(w));
      this.api.getEventTags(id).subscribe(t => this.tags.set(t));
      this.api.getEventRatings(id).subscribe(data => {
        this.ratings.set(data.ratings);
        this.ratingStats.set(data.stats);
      });
      
      // Check if user has favorited this event
      this.api.checkFavorite(id).subscribe(data => {
        this.isFavoriteSignal.set(data.isFavorite);
      });
    });
  }

  private get eventId() {
    return Number(this.route.snapshot.paramMap.get('id'));
  }

  register() {
    const id = this.eventId;
    this.actionLoading.set(true);
    this.error.set(null);
    this.api.register(id).subscribe({
      next: () => {
        this.api.getEventRegistrations(id).subscribe(r => this.registrations.set(r));
        this.api.getEventWaitlist(id).subscribe(w => this.waitlist.set(w));
        this.actionLoading.set(false);
      },
      error: err => {
        this.error.set(err.error?.error || 'Registration failed');
        this.actionLoading.set(false);
      }
    });
  }

  unregister() {
    const id = this.eventId;
    this.actionLoading.set(true);
    this.error.set(null);
    this.api.unregister(id).subscribe({
      next: () => {
        this.api.getEventRegistrations(id).subscribe(r => this.registrations.set(r));
        this.api.getEventWaitlist(id).subscribe(w => this.waitlist.set(w));
        this.actionLoading.set(false);
      },
      error: err => {
        this.error.set(err.error?.error || 'Unregister failed');
        this.actionLoading.set(false);
      }
    });
  }

  joinWaitlist() {
    const id = this.eventId;
    this.actionLoading.set(true);
    this.error.set(null);
    this.api.joinWaitlist(id).subscribe({ next: () => {
      this.api.getEventWaitlist(id).subscribe(w => this.waitlist.set(w));
      this.actionLoading.set(false);
    }, error: err => { this.error.set(err.error?.error || 'Waitlist failed'); this.actionLoading.set(false); }});
  }

  leaveWaitlist() {
    const id = this.eventId;
    this.actionLoading.set(true);
    this.error.set(null);
    this.api.leaveWaitlist(id).subscribe({ next: () => {
      this.api.getEventWaitlist(id).subscribe(w => this.waitlist.set(w));
      this.actionLoading.set(false);
    }, error: err => { this.error.set(err.error?.error || 'Leave waitlist failed'); this.actionLoading.set(false); }});
  }

  publish() {
    const id = this.eventId;
    this.actionLoading.set(true);
    this.api.publishEvent(id).subscribe({
      next: ev => { this.event.set(ev); this.actionLoading.set(false); },
      error: () => this.actionLoading.set(false)
    });
  }

  close() {
    const id = this.eventId;
    this.actionLoading.set(true);
    this.api.closeEvent(id).subscribe({
      next: ev => { this.event.set(ev); this.actionLoading.set(false); },
      error: () => this.actionLoading.set(false)
    });
  }

  toggleFavorite() {
    const id = this.eventId;
    this.actionLoading.set(true);
    if (this.isFavorite()) {
      this.api.removeFavorite(id).subscribe({
        next: () => { 
          this.isFavoriteSignal.set(false); 
          this.actionLoading.set(false); 
        },
        error: () => this.actionLoading.set(false)
      });
    } else {
      this.api.addFavorite(id).subscribe({
        next: () => { 
          this.isFavoriteSignal.set(true); 
          this.actionLoading.set(false); 
        },
        error: () => this.actionLoading.set(false)
      });
    }
  }

  setRating(rating: number) {
    this.selectedRating.set(rating);
  }

  submitRating() {
    const id = this.eventId;
    const rating = this.selectedRating();
    if (!rating) return;
    
    this.actionLoading.set(true);
    this.api.createRating(id, rating, this.reviewText || undefined).subscribe({
      next: () => {
        this.selectedRating.set(0);
        this.reviewText = '';
        // Reload ratings
        this.api.getEventRatings(id).subscribe(data => {
          this.ratings.set(data.ratings);
          this.ratingStats.set(data.stats);
          this.actionLoading.set(false);
        });
      },
      error: (err) => {
        this.error.set(err.error?.error || 'Failed to submit rating');
        this.actionLoading.set(false);
      }
    });
  }
}
