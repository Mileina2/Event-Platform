import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { AuthContextService } from '../../services/auth-context.service';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="user-profile">
      @if (loading()) {
        <p>Loading...</p>
      } @else if (profile()) {
        <div class="profile-card">
          <div class="profile-header">
            @if (profile()!.avatar) {
              <img [src]="profile()!.avatar" [alt]="email()" class="avatar">
            } @else {
              <div class="avatar-placeholder">{{ email().charAt(0).toUpperCase() }}</div>
            }
            <div class="profile-info">
              <h2>{{ email() }}</h2>
              @if (profile()!.bio) {
                <p class="bio">{{ profile()!.bio }}</p>
              }
              @if (profile()!.location) {
                <p class="location">{{ profile()!.location }}</p>
              }
              @if (profile()!.website) {
                <p class="website">
                  <a [href]="profile()!.website" target="_blank">{{ profile()!.website }}</a>
                </p>
              }
            </div>
          </div>

          <div class="stats">
            <div class="stat">
              <span class="stat-number">{{ profile()!.followerCount }}</span>
              <span class="stat-label">Followers</span>
            </div>
            <div class="stat">
              <span class="stat-number">{{ profile()!.followingCount }}</span>
              <span class="stat-label">Following</span>
            </div>
          </div>

          @if (isOwnProfile()) {
            <div class="edit-section">
              <h3>Edit Profile</h3>
              <div class="form-group">
                <label>Bio</label>
                <textarea [(ngModel)]="editBio" placeholder="Tell us about yourself..."></textarea>
              </div>
              <div class="form-group">
                <label>Location</label>
                <input type="text" [(ngModel)]="editLocation" placeholder="Your location">
              </div>
              <div class="form-group">
                <label>Website</label>
                <input type="url" [(ngModel)]="editWebsite" placeholder="https://example.com">
              </div>
              <button (click)="updateProfile()" [disabled]="actionLoading()">Save Changes</button>
            </div>
          } @else {
            @if (!isFollowing()) {
              <button (click)="follow()" [disabled]="actionLoading()" class="follow-btn">+ Follow</button>
            } @else {
              <button (click)="unfollow()" [disabled]="actionLoading()" class="following-btn">✓ Following</button>
            }
          }
        </div>

        <div class="followers-section">
          <h3>Followers</h3>
          @if (followers().length === 0) {
            <p class="empty">No followers yet</p>
          } @else {
            <ul class="user-list">
              @for (user of followers(); track user.id) {
                <li>
                  <a [routerLink]="['/profile', user.id]">{{ user.email }}</a>
                  <span class="badge">{{ user.role }}</span>
                </li>
              }
            </ul>
          }
        </div>

        <div class="following-section">
          <h3>Following</h3>
          @if (following().length === 0) {
            <p class="empty">Not following anyone yet</p>
          } @else {
            <ul class="user-list">
              @for (user of following(); track user.id) {
                <li>
                  <a [routerLink]="['/profile', user.id]">{{ user.email }}</a>
                  <span class="badge">{{ user.role }}</span>
                </li>
              }
            </ul>
          }
        </div>
      } @else {
        <p>User not found.</p>
      }
      <a routerLink="/events" class="back">← Back to events</a>
    </div>
  `,
  styles: [`
    .user-profile { padding: 1rem; max-width: 600px; }
    .profile-card { background: var(--surface-2); padding: 2rem; border-radius: 8px; margin-bottom: 2rem; }
    
    .profile-header { display: flex; gap: 1.5rem; align-items: start; margin-bottom: 1.5rem; }
    .avatar, .avatar-placeholder { width: 100px; height: 100px; border-radius: 50%; object-fit: cover; }
    .avatar-placeholder { background: var(--accent); display: flex; align-items: center; justify-content: center; color: white; font-size: 2rem; font-weight: bold; }
    
    .profile-info { flex: 1; }
    .profile-info h2 { margin: 0 0 0.5rem 0; }
    .profile-info p { margin: 0.25rem 0; font-size: 0.95rem; color: var(--text-muted); }
    .bio { color: var(--text); }
    .location, .website { font-size: 0.9rem; }
    .website a { color: var(--accent); text-decoration: none; }
    
    .stats { display: flex; gap: 2rem; margin: 1.5rem 0; }
    .stat { text-align: center; }
    .stat-number { display: block; font-size: 1.5rem; font-weight: bold; }
    .stat-label { display: block; font-size: 0.85rem; color: var(--text-muted); }
    
    .edit-section { background: var(--surface-1); padding: 1rem; border-radius: 6px; margin-top: 1rem; }
    .form-group { margin-bottom: 1rem; }
    .form-group label { display: block; margin-bottom: 0.25rem; font-weight: 500; font-size: 0.9rem; }
    .form-group input, .form-group textarea { width: 100%; padding: 0.5rem; border: 1px solid var(--border); border-radius: 4px; font-family: inherit; box-sizing: border-box; }
    .form-group textarea { resize: vertical; min-height: 80px; }
    .edit-section button { background: var(--accent); color: white; padding: 0.5rem 1rem; border: none; border-radius: 4px; cursor: pointer; width: 100%; }
    .edit-section button:disabled { opacity: 0.6; }
    
    .follow-btn { background: var(--accent); color: white; padding: 0.5rem 1.5rem; border: none; border-radius: 6px; cursor: pointer; font-weight: 500; }
    .following-btn { background: transparent; border: 2px solid var(--accent); color: var(--accent); padding: 0.5rem 1.5rem; border-radius: 6px; cursor: pointer; font-weight: 500; }
    
    .followers-section, .following-section { background: var(--surface-2); padding: 1.5rem; border-radius: 8px; margin-bottom: 1.5rem; }
    .followers-section h3, .following-section h3 { margin-top: 0; }
    
    .user-list { list-style: none; padding: 0; margin: 0; }
    .user-list li { padding: 0.75rem; background: var(--surface-1); border-radius: 6px; margin-bottom: 0.5rem; display: flex; justify-content: space-between; align-items: center; }
    .user-list a { color: var(--accent); text-decoration: none; }
    .user-list a:hover { text-decoration: underline; }
    .badge { font-size: 0.75rem; background: var(--border); padding: 0.25rem 0.5rem; border-radius: 3px; }
    
    .empty { color: var(--text-muted); }
    .back { color: var(--accent); text-decoration: none; display: inline-block; margin-top: 1rem; }
  `]
})
export class UserProfileComponent {
  private api = inject(ApiService);
  private auth = inject(AuthContextService);
  private route = inject(ActivatedRoute);

  profile = signal<any | null>(null);
  followers = signal<any[]>([]);
  following = signal<any[]>([]);
  
  editBio = '';
  editLocation = '';
  editWebsite = '';
  
  loading = signal(true);
  actionLoading = signal(false);
  isFollowingSignal = signal(false);

  email = () => {
    // Get email from user data if available - for now using placeholder
    return 'user@example.com';
  };

  isOwnProfile() {
    const currentUserId = this.auth.userId();
    const profileUserId = Number(this.route.snapshot.paramMap.get('id'));
    return currentUserId === profileUserId;
  }

  isFollowing() {
    return this.isFollowingSignal();
  }

  constructor() {
    this.route.paramMap.subscribe(params => {
      const userId = Number(params.get('id'));
      if (!userId) return;
      
      this.loading.set(true);
      
      // Load profile
      this.api.getUserProfile(userId).subscribe({
        next: (profile) => {
          this.profile.set(profile);
          this.editBio = profile.bio || '';
          this.editLocation = profile.location || '';
          this.editWebsite = profile.website || '';
          this.loading.set(false);
        },
        error: () => this.loading.set(false)
      });
      
      // Load followers and following
      this.api.getUserFollowers(userId).subscribe(f => this.followers.set(f));
      this.api.getUserFollowing(userId).subscribe(f => this.following.set(f));
      
      // Check if current user is following this user
      if (this.auth.userId() && !this.isOwnProfile()) {
        this.api.checkFollowing(userId).subscribe(data => {
          this.isFollowingSignal.set(data.isFollowing);
        });
      }
    });
  }

  updateProfile() {
    const userId = this.auth.userId();
    if (!userId) return;
    
    this.actionLoading.set(true);
    this.api.updateUserProfile(userId, {
      bio: this.editBio,
      location: this.editLocation,
      website: this.editWebsite
    }).subscribe({
      next: (updated) => {
        this.profile.set(updated);
        this.actionLoading.set(false);
      },
      error: () => this.actionLoading.set(false)
    });
  }

  follow() {
    const userId = Number(this.route.snapshot.paramMap.get('id'));
    this.actionLoading.set(true);
    this.api.followUser(userId).subscribe({
      next: () => {
        this.isFollowingSignal.set(true);
        this.actionLoading.set(false);
        this.api.getUserFollowers(userId).subscribe(f => this.followers.set(f));
      },
      error: () => this.actionLoading.set(false)
    });
  }

  unfollow() {
    const userId = Number(this.route.snapshot.paramMap.get('id'));
    this.actionLoading.set(true);
    this.api.unfollowUser(userId).subscribe({
      next: () => {
        this.isFollowingSignal.set(false);
        this.actionLoading.set(false);
        this.api.getUserFollowers(userId).subscribe(f => this.followers.set(f));
      },
      error: () => this.actionLoading.set(false)
    });
  }
}
