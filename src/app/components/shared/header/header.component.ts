import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { QuotationService } from '../../../services/quotation.service';
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
	@Input() headerType: string;
	navbarState = {
		headerType:''
	}
  constructor(public auth: AuthService, private router: Router, private quotation: QuotationService) {
  	this.setHeaderType();

  }

  ngOnInit() {
  }

  private setHeaderType(): void {
  	this.navbarState.headerType = this.headerType;
  }

  public goTo(page: string): void {
    this.router.navigate([page]);
  }

  public logOut(): void {
    this.auth.logOut();
    this.quotation.resetStatus();
  }
}
