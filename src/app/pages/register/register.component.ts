import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  private registerForm = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.minLength(5)]),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(5)]),
    address: new FormControl('', [Validators.required, Validators.minLength(4)])
  });

  constructor(public auth: AuthService) { }

  ngOnInit() {
  }

  onSubmit() {
    console.log(this.registerForm.value);
  }

  public doKeyBoardRegister(event): void {
    if (event.keyCode === '13') {
      this.doRegister();
    }
  }

  public doRegister(): void {
    if (this.registerForm.valid) {
      this.auth.registerUser(this.registerForm.value);
    }
  }
}
