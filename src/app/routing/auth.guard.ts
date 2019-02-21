import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot,Router } from '@angular/router';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
	constructor(private auth: AuthService, private router: Router, private http: HttpClient) {

	}
  
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    return new Observable<boolean>((observer) => {
      let subscription = this.auth.getTokens().subscribe((tokens) => {
        if (tokens) {
          let existSessionToken = tokens.some((elem) => elem.token == this.auth.getSavedToken());
          console.log('AuthGuard routing puts:', existSessionToken);
          if (existSessionToken) {
            observer.next(true);
            observer.complete();
          } else {
            this.router.navigate(['login']);
            observer.next(false);
            observer.complete();
          }
          subscription.unsubscribe();
        }
      });
    });
  }
}
