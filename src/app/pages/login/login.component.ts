import { Component, OnInit } from '@angular/core';
import { AuthType } from 'src/app/shared/enums';
import { User, AuthService } from 'src/app/core';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  public user: User;
  public authType = AuthType.Customer;

  public loginModes = [
    { name: 'Officenet', value: AuthType.Customer },
    { name: 'Invitado', value: AuthType.Guest }
  ];

  constructor(public auth: AuthService) {
    this.user = new User();
  }

  ngOnInit() { }

  login() {
    this.auth.login(this.user, AuthType.Customer);
  }
}
