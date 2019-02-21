import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
	public createUser = { name:'', email:'', password:'', address:'' };
  constructor(public auth: AuthService) { }

  ngOnInit() {
  }

  public doKeyBoardRegister(event): void {
    if (event.keyCode == '13') {
      this.doRegister();
    }  
  }

  public doRegister(): void {
    if (this.registerValidation()) {
      this.auth.doRegister(this.createUser);
    }
  }

  private registerValidation(): boolean {
    if (this.createUser.name.length > 4) {
      if (this.createUser.address.length != 0) {
        if (this.auth.emailValidation(this.createUser.email)) {
          if (this.createUser.password.length != 0) {
            this.auth.authErrorReset();
            return true;
          } else {
            this.auth.throwError(3, 'auth');
          }
        } else {
          this.auth.throwError(2, 'auth');
        }
      } else {
        this.auth.throwError(5,'auth');
      }
    } else {
      this.auth.throwError(4, 'auth');
    }
  }
}
