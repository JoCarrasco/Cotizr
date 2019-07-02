import { Component, OnInit } from '@angular/core';
import { QuotationService, AuthService, Quotation } from 'src/app/core';
import * as _ from 'lodash';
@Component({
  selector: 'app-generate-data',
  templateUrl: './generate-data.component.html',
  styleUrls: ['./generate-data.component.scss']
})
export class GenerateDataComponent implements OnInit {
  data = {};
  isDataValid = false;

  constructor(public quotation: QuotationService, private auth: AuthService) { }

  ngOnInit() {
  }

  handleQuotationChange(e): void {
    if (e) {
      this.isDataValid = true;
    }
  }

  printQuotation() {
    this.quotation.createQuotation(_.merge(new Quotation(this.data), {
      items: this.quotation.quotationItems
    }));
  }
}
