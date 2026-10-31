import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CustomerProfile } from '../data-type';

const API_URL = 'http://localhost:3001/api/auth/profile';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  constructor(private http: HttpClient) {}

  getProfile(): Observable<CustomerProfile> {
    return this.http.get<CustomerProfile>(API_URL);
  }

  updateProfile(profile: Pick<CustomerProfile, 'name' | 'email' | 'phone' | 'address'>): Observable<CustomerProfile> {
    return this.http.patch<CustomerProfile>(API_URL, profile);
  }
}
