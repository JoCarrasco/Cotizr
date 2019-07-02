import { Component, OnInit } from '@angular/core';
import { AuthType, AuthTypeMetadata } from 'src/app/shared/enums';
import { User, AuthService } from 'src/app/core';
import { FormGroup, Validators, FormControl } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  authTypes = [
    { value: AuthType.Guest, name: AuthTypeMetadata[AuthType.Guest].name },
    { value: AuthType.Employee, name: AuthTypeMetadata[AuthType.Employee].name },
    { value: AuthType.Customer, name: AuthTypeMetadata[AuthType.Customer].name }
  ];

  public form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', Validators.required),
    user_type: new FormControl('', Validators.required)
  });

  constructor(public auth: AuthService) {
    this.form.patchValue({
      user_type: this.authTypes[0].value
    });
  }

  ngOnInit() { }

  handleKeyboardEvent(event) {
    if (event.keyCode === 13) {
      if (this.form.valid) {
        this.login();
      }
    }
  }

  login() {
    this.auth.login(this.form.value);
  }
}
