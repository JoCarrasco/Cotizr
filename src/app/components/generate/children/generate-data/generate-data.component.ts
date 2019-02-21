import { Component, OnInit } from '@angular/core';
import { QuotationService } from '../../../../services/quotation.service';
import { AuthService } from '../../../../services/auth.service';
@Component({
  selector: 'app-generate-data',
  templateUrl: './generate-data.component.html',
  styleUrls: ['./generate-data.component.scss']
})
export class GenerateDataComponent implements OnInit {
	email:any;
  constructor(public quotation: QuotationService, private auth: AuthService) { }

  ngOnInit() {
  }

  checkAndSend(): void {
  	console.log('Checking...');
  	if (this.quotation.checkFields()) {
  		console.log('DONE! IS OK.');
  		this.auth.authState.appUser.subscribe((user) => {
  			if (user) {
  				console.log('Got user data...generating quotation');
  				this.quotation.generateQuotation(user, this.auth.getSession().type);
  			}
  		})
  	} else {
  		console.error('Error cannot load');
  	}
  }

  resetEmails(email): void {
  	document.querySelector('.email').nodeValue = '';
  }
}
