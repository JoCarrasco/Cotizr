import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit {
	private emailMatch = /^[a-zA-Z0-9\-_]+(\.[a-zA-Z0-9\-_]+)*@[a-z0-9]+(\-[a-z0-9]+)*(\.[a-z0-9]+(\-[a-z0-9]+)*)*\.[a-z]{2,4}$/;
	user = { email: '', password: '' };
  constructor(public auth: AuthService) { }

  ngOnInit() {
  }

  public doAdminLogin(): void {
  	if (this.auth.doLoginValidation(this.user)) {
  		this.auth.login(this.user, 3);
  	} else {

  	}
  }

 public doEmailValidation(email): boolean {
    if (this.emailMatch.test(email)) {
      return true;
    } else {
      this.auth.throwError(2);
      return false;
    }
  }

  private noEmptyPassword(): boolean {
    return this.user.password.length < 1 ? false : true;
  }

  public doLogin(): void {
    if (this.doEmailValidation(this.user.email)) {
      if (this.noEmptyPassword()) {
        this.auth.login(this.user, 3);
      } else {
        this.auth.throwError(3);
      }
    } else {
      this.auth.throwError(2);
    }
  }

  public doKeyBoardLogin(event): void {
    if (event.keyCode == '13') {
      this.doLogin();
    }  
  }
}
