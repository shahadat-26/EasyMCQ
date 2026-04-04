import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, BehaviorSubject } from 'rxjs';
import { RegisterDto, LoginDto, LoginResponse, UserRole } from '../models/user.model';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private apiUrl = `${environment.apiUrl}/auth`;
  private currentUserSubject = new BehaviorSubject<LoginResponse | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      this.currentUserSubject.next(JSON.parse(storedUser));
    }
  }

  register(data: RegisterDto): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/register`, data).pipe(
      tap(response => {
        if (response.success) {
          const loginResponse: LoginResponse = {
            token: response.token,
            userId: response.userId,
            name: response.name,
            email: response.email,
            role: response.role
          };
          this.handleAuthResponse(loginResponse);
        }
      })
    );
  }

  login(data: LoginDto): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, data).pipe(
      tap(response => {
        if (response.success) {
          const loginResponse: LoginResponse = {
            token: response.token,
            userId: response.userId,
            name: response.name,
            email: response.email,
            role: response.role
          };
          this.handleAuthResponse(loginResponse);
        }
      })
    );
  }

  private handleAuthResponse(response: LoginResponse): void {
    localStorage.setItem('token', response.token);
    localStorage.setItem('currentUser', JSON.stringify(response));
    this.currentUserSubject.next(response);

    if (response.role === UserRole.Teacher) {
      this.router.navigate(['/teacher/dashboard']);
    } else {
      this.router.navigate(['/student/dashboard']);
    }
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getCurrentUser(): LoginResponse | null {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getUserRole(): UserRole | null {
    const user = this.getCurrentUser();
    return user?.role || null;
  }
}