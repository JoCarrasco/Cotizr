import { Component, OnInit } from '@angular/core';
import { AuthService, QuotationService, ApiService, Quotation } from 'src/app/core';
import { AppStorage, StorageKey } from 'src/app/shared';
@Component({
  selector: 'app-user-quotations',
  templateUrl: './user-quotations.component.html',
  styleUrls: ['./user-quotations.component.scss']
})
export class UserQuotationsComponent implements OnInit {
  userQuotations: Quotation[] = [];

  constructor(public auth: AuthService, public quotationService: QuotationService, private api: ApiService) { }

  ngOnInit() {
    this.getUserQuotations();
  }

  public async getUserQuotations(): Promise<any> {
    const session = AppStorage.get(StorageKey.Session);
    let userQuotations = (await this.api.getUserQuotations(session.id)).quotations;
    if (userQuotations) {
      console.log(userQuotations);
      userQuotations = userQuotations.map((x) => {
        x.items = JSON.parse(x.items);
        x.user = JSON.parse(x.user);
        return x;
      });

      console.log(userQuotations);
      this.userQuotations = userQuotations;
    }

    console.log(this.userQuotations);
    // if (this.auth.session) {
    //   // this.userQuotations = (await this.api.getUserQuotations(this.auth.session.user.id)).map((x) => {
    //   //   x.products = JSON.parse(x.products);
    //   //   x.products.items.map((y) => {
    //   //     y.total = y.amount * y.price;
    //   //   });
    //   //   return x;
    //   // }).sort((a, b) => b - a);
    // }
  }
  download(quotation) {
    this.quotationService.generatePDF(quotation);
  }
}
