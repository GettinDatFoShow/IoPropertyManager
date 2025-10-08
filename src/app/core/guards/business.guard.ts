import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map, take, combineLatest } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { BusinessService } from '../services/business.service';

@Injectable({
  providedIn: 'root'
})
export class BusinessGuard implements CanActivate {
  
  constructor(
    private authService: AuthService,
    private businessService: BusinessService,
    private router: Router
  ) {}

  canActivate(): Observable<boolean> {
    return combineLatest([
      this.authService.currentUser$,
      this.businessService.currentBusiness$
    ]).pipe(
      take(1),
      map(([user, business]) => {
        if (!user) {
          this.router.navigate(['/auth/login']);
          return false;
        }

        if (!business && user.role === 'owner') {
          // Owner needs to set up business
          this.router.navigate(['/auth/business-setup']);
          return false;
        }

        if (!business) {
          // Employee/Manager without business - should not happen
          this.router.navigate(['/auth/login']);
          return false;
        }

        return true;
      })
    );
  }
}