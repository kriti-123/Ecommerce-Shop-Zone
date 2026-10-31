import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CustomerProfile } from '../data-type';
import { ProfileService } from '../services/profile.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
})
export class ProfileComponent implements OnInit {
  user: CustomerProfile | null = null;
  editing = false;
  loading = true;
  saving = false;
  errorMessage = '';
  successMessage = '';
  draft: Pick<CustomerProfile, 'name' | 'email' | 'phone' | 'address'> = {
    name: '',
    email: '',
    phone: '',
    address: {
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      postalCode: '',
      country: '',
      deliveryInstructions: '',
    },
  };

  constructor(
    private router: Router,
    private profileService: ProfileService
  ) {}

  ngOnInit(): void {
    const storedUser = localStorage.getItem('data');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser) as {
          id?: string;
          name?: string;
          email?: string;
          role?: string;
        };
        if (user.role === 'user' && user.id && user.name && user.email) {
          this.user = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: 'user',
            phone: '',
            address: { ...this.draft.address },
          };
        }
      } catch {
        this.errorMessage = 'Your saved account details could not be read.';
      }
    }
    this.loadProfile();
  }

  loadProfile(): void {
    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.profileService.getProfile().subscribe({
      next: (profile) => {
        this.user = profile;
        this.copyProfileToDraft(profile);
        localStorage.setItem(
          'data',
          JSON.stringify({
            id: profile.id,
            name: profile.name,
            email: profile.email,
            role: profile.role,
          })
        );
        this.loading = false;
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage =
          error.error?.message || 'Could not load your profile. Please try again.';
        this.loading = false;
      },
    });
  }

  editProfile(): void {
    if (this.user) {
      this.copyProfileToDraft(this.user);
      this.errorMessage = '';
      this.successMessage = '';
      this.editing = true;
    }
  }

  cancelEditing(): void {
    if (this.user) {
      this.copyProfileToDraft(this.user);
    }
    this.editing = false;
    this.errorMessage = '';
  }

  saveProfile(): void {
    if (this.saving) {
      return;
    }

    this.saving = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.profileService.updateProfile(this.draft).subscribe({
      next: (profile) => {
        this.user = profile;
        this.copyProfileToDraft(profile);
        localStorage.setItem(
          'data',
          JSON.stringify({
            id: profile.id,
            name: profile.name,
            email: profile.email,
            role: profile.role,
          })
        );
        this.editing = false;
        this.saving = false;
        this.successMessage = 'Your profile and saved address have been updated.';
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage =
          error.error?.message || 'Could not save your profile. Please try again.';
        this.saving = false;
      },
    });
  }

  signOut(): void {
    localStorage.removeItem('data');
    localStorage.removeItem('selerdata');
    localStorage.removeItem('authToken');
    this.router.navigate(['/userAuth']);
  }

  private copyProfileToDraft(profile: CustomerProfile): void {
    this.draft = {
      name: profile.name,
      email: profile.email,
      phone: profile.phone ?? '',
      address: {
        addressLine1: profile.address?.addressLine1 ?? '',
        addressLine2: profile.address?.addressLine2 ?? '',
        city: profile.address?.city ?? '',
        state: profile.address?.state ?? '',
        postalCode: profile.address?.postalCode ?? '',
        country: profile.address?.country ?? '',
        deliveryInstructions: profile.address?.deliveryInstructions ?? '',
      },
    };
  }
}
