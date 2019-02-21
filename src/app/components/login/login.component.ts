import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  public user = { email: '', password: '' }
	public loginModes = [
		{ name: 'Officenet', value: 1 },
		{ name: 'Invitado', value: 2 }
	];

  constructor(public auth: AuthService) { }

  ngOnInit() {
  }
}
