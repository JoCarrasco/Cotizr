import { Component, OnInit } from '@angular/core';
import { AuthService, QuotationService, ApiService, Quotation } from 'src/app/core';
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
    if (this.auth.session) {
      // this.userQuotations = (await this.api.getUserQuotations(this.auth.session.user.id)).map((x) => {
      //   x.products = JSON.parse(x.products);
      //   x.products.items.map((y) => {
      //     y.total = y.amount * y.price;
      //   });
      //   return x;
      // }).sort((a, b) => b - a);
    }
  }
}
