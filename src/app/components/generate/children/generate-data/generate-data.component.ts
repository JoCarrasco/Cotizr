import { Component, OnInit } from '@angular/core';
import { QuotationService, AuthService } from 'src/app/core';

@Component({
  selector: 'app-generate-data',
  templateUrl: './generate-data.component.html',
  styleUrls: ['./generate-data.component.scss']
})
export class GenerateDataComponent implements OnInit {
  email: any;
  constructor(public quotation: QuotationService, private auth: AuthService) { }

  ngOnInit() {
  }

  checkAndSend(): void {
    // console.log('Checking...');
    // if (this.quotation.checkFields()) {
    //   console.log('DONE! IS OK.');
    //   if (this.auth.session.user) {
    //     console.log('Got user data...generating quotation');
    //     // user, products, metadata, downloadAfterCreation = true
    //     this.quotation.createQuotation(this.auth.session.user, this.auth.getSession().type);
    //   }
    // } else {
    //   console.error('Error cannot load');
    // }
  }

  resetEmails(email): void {
    document.querySelector('.email').nodeValue = '';
  }
}
