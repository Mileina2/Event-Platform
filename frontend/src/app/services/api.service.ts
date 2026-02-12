import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';
import { Event as EventItem, CreateEventDto } from '../models/event.model';
import { Registration } from '../models/registration.model';
import { AuthContextService } from './auth-context.service';

const API_URL = '/api';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private auth = inject(AuthContextService);

  private headers(): HttpHeaders {
    let h = new HttpHeaders({ 'Content-Type': 'application/json' });
    const uid = this.auth.userId();
    const role = this.auth.userRole();
    if (uid) {
      h = h.set('X-User-Id', String(uid)).set('X-User-Role', role);
    }
    return h;
  }

  login(email: string, password: string): Observable<User> {
    return this.http.post<User>(`${API_URL}/auth/login`, { email, password });
  }

  registerUser(email: string, password: string, role: string = 'USER'): Observable<User> {
    return this.http.post<User>(`${API_URL}/auth/register`, { email, password, role });
  }

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${API_URL}/users`, { headers: this.headers() });
  }

  getUser(id: number): Observable<User> {
    return this.http.get<User>(`${API_URL}/users/${id}`, { headers: this.headers() });
  }

  getEvents(filters?: { status?: string; search?: string; dateFrom?: string; dateTo?: string; hasAvailability?: boolean; organizerId?: string }): Observable<EventItem[]> {
    let params = new HttpParams();
    if (filters) {
      if (filters.status) params = params.set('status', filters.status);
      if (filters.search) params = params.set('search', filters.search);
      if (filters.dateFrom) params = params.set('dateFrom', filters.dateFrom);
      if (filters.dateTo) params = params.set('dateTo', filters.dateTo);
      if (filters.hasAvailability) params = params.set('hasAvailability', String(filters.hasAvailability));
      if (filters.organizerId) params = params.set('organizerId', filters.organizerId);
    }
    return this.http.get<EventItem[]>(`${API_URL}/events`, { params, headers: this.headers() });
  }

  getOrganizerEvents(): Observable<EventItem[]> {
    return this.http.get<EventItem[]>(`${API_URL}/events/mine`, { headers: this.headers() });
  }

  getEvent(id: number): Observable<EventItem> {
    return this.http.get<EventItem>(`${API_URL}/events/${id}`, { headers: this.headers() });
  }

  createEvent(dto: CreateEventDto): Observable<EventItem> {
    return this.http.post<EventItem>(`${API_URL}/events`, dto, { headers: this.headers() });
  }

  updateEvent(id: number, dto: Partial<CreateEventDto>): Observable<EventItem> {
    return this.http.patch<EventItem>(`${API_URL}/events/${id}`, dto, { headers: this.headers() });
  }

  publishEvent(id: number): Observable<EventItem> {
    return this.http.post<EventItem>(`${API_URL}/events/${id}/publish`, {}, { headers: this.headers() });
  }

  closeEvent(id: number): Observable<EventItem> {
    return this.http.post<EventItem>(`${API_URL}/events/${id}/close`, {}, { headers: this.headers() });
  }

  register(eventId: number): Observable<Registration> {
    return this.http.post<Registration>(`${API_URL}/events/${eventId}/register`, {}, { headers: this.headers() });
  }

  joinWaitlist(eventId: number): Observable<any> {
    return this.http.post<any>(`${API_URL}/events/${eventId}/waitlist`, {}, { headers: this.headers() });
  }

  leaveWaitlist(eventId: number): Observable<any> {
    return this.http.delete<any>(`${API_URL}/events/${eventId}/waitlist`, { headers: this.headers() });
  }

  unregister(eventId: number): Observable<void> {
    return this.http.delete<void>(`${API_URL}/events/${eventId}/register`, { headers: this.headers() });
  }

  getEventRegistrations(eventId: number): Observable<Registration[]> {
    return this.http.get<Registration[]>(`${API_URL}/events/${eventId}/registrations`, { headers: this.headers() });
  }

  getEventWaitlist(eventId: number): Observable<any[]> {
    return this.http.get<any[]>(`${API_URL}/events/${eventId}/waitlist`, { headers: this.headers() });
  }

  getUserRegistrations(userId: number): Observable<Registration[]> {
    return this.http.get<Registration[]>(`${API_URL}/users/${userId}/registrations`, { headers: this.headers() });
  }

  // Tags endpoints
  getAllTags(): Observable<any[]> {
    return this.http.get<any[]>(`${API_URL}/tags`, { headers: this.headers() });
  }

  createTag(name: string, color?: string): Observable<any> {
    return this.http.post<any>(`${API_URL}/tags`, { name, color }, { headers: this.headers() });
  }

  getEventTags(eventId: number): Observable<any[]> {
    return this.http.get<any[]>(`${API_URL}/tags/event/${eventId}`, { headers: this.headers() });
  }

  setEventTags(eventId: number, tagIds: number[]): Observable<any[]> {
    return this.http.post<any[]>(`${API_URL}/tags/event/${eventId}`, { tagIds }, { headers: this.headers() });
  }

  // Favorites endpoints
  getUserFavorites(userId: number): Observable<any[]> {
    return this.http.get<any[]>(`${API_URL}/favorites/users/${userId}`, { headers: this.headers() });
  }

  addFavorite(eventId: number): Observable<any> {
    return this.http.post<any>(`${API_URL}/favorites/events/${eventId}`, {}, { headers: this.headers() });
  }

  removeFavorite(eventId: number): Observable<any> {
    return this.http.delete<any>(`${API_URL}/favorites/events/${eventId}`, { headers: this.headers() });
  }

  checkFavorite(eventId: number): Observable<{ isFavorite: boolean }> {
    return this.http.get<{ isFavorite: boolean }>(`${API_URL}/favorites/events/${eventId}/check`, { headers: this.headers() });
  }

  // Ratings endpoints
  getEventRatings(eventId: number): Observable<{ ratings: any[], stats: any }> {
    return this.http.get<{ ratings: any[], stats: any }>(`${API_URL}/ratings/events/${eventId}`, { headers: this.headers() });
  }

  getEventRatingStats(eventId: number): Observable<any> {
    return this.http.get<any>(`${API_URL}/ratings/events/${eventId}/stats`, { headers: this.headers() });
  }

  createRating(eventId: number, rating: number, review?: string): Observable<any> {
    return this.http.post<any>(`${API_URL}/ratings/events/${eventId}`, { rating, review }, { headers: this.headers() });
  }

  updateRating(ratingId: number, rating: number, review?: string): Observable<any> {
    return this.http.patch<any>(`${API_URL}/ratings/${ratingId}`, { rating, review }, { headers: this.headers() });
  }

  deleteRating(ratingId: number): Observable<any> {
    return this.http.delete<any>(`${API_URL}/ratings/${ratingId}`, { headers: this.headers() });
  }

  // User Profile endpoints
  getUserProfile(userId: number): Observable<any> {
    return this.http.get<any>(`${API_URL}/users/${userId}/profile`, { headers: this.headers() });
  }

  updateUserProfile(userId: number, profile: any): Observable<any> {
    return this.http.patch<any>(`${API_URL}/users/${userId}/profile`, profile, { headers: this.headers() });
  }

  getUserFollowers(userId: number): Observable<any[]> {
    return this.http.get<any[]>(`${API_URL}/users/${userId}/followers`, { headers: this.headers() });
  }

  getUserFollowing(userId: number): Observable<any[]> {
    return this.http.get<any[]>(`${API_URL}/users/${userId}/following`, { headers: this.headers() });
  }

  followUser(userId: number): Observable<{ success: boolean }> {
    return this.http.post<{ success: boolean }>(`${API_URL}/users/${userId}/follow`, {}, { headers: this.headers() });
  }

  unfollowUser(userId: number): Observable<{ success: boolean }> {
    return this.http.delete<{ success: boolean }>(`${API_URL}/users/${userId}/follow`, { headers: this.headers() });
  }

  checkFollowing(userId: number): Observable<{ isFollowing: boolean }> {
    return this.http.get<{ isFollowing: boolean }>(`${API_URL}/users/${userId}/follow/check`, { headers: this.headers() });
  }
}
