import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { map } from 'rxjs/operators';
import { AuthService, ApiService } from '../core';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private auth: AuthService, private api: ApiService, private router: Router, private http: HttpClient) {

  }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    return new Observable<boolean>((observer) => {
      this.api.getAuthToken(this.auth.session.token.token).then((token => {
        if (token) {
          if (token) {
            observer.next(true);
            observer.complete();
          } else {
            this.router.navigate(['login']);
            observer.next(false);
            observer.complete();
          }
        }
      }));
    });
  }
}
