import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class LoginGuard implements CanActivate {

	constructor(private auth: AuthService, private router: Router) {

	}
  
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    if (!this.auth.authState.isLoggedIn) {
      return true;
    } else {
      this.router.navigate(['panel']);
      return false;
    }
  }
}