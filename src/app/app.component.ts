import { Component, OnInit } from '@angular/core';
import { AuthService, ApiService } from './core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  constructor(private auth: AuthService, private api: ApiService, private http: HttpClient) { }

  ngOnInit(): void {
    this.auth.initFastAuth();
    this.api.init();
  }
}

