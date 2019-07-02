import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  public registerForm = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.minLength(3)]),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(5)]),
  });

  constructor(public auth: AuthService) { }

  ngOnInit() {
  }

  onSubmit() {

  }

  public doKeyBoardRegister(event): void {
    if (event.keyCode === '13') {
      if (this.registerForm.valid) {
        this.doRegister();
      }
    }
  }

  public doRegister(): void {
    if (this.registerForm.valid) {
      this.auth.registerUser(this.registerForm.value);
    }
  }
}
