import { Component, OnInit } from '@angular/core';
import { QuotationService } from 'src/app/core';

@Component({
  selector: 'app-generate-products',
  templateUrl: './generate-products.component.html',
  styleUrls: ['./generate-products.component.scss']
})
export class GenerateProductsComponent implements OnInit {
  listState = {
    isActive: false,
  }
  constructor(public quotation: QuotationService) { }

  ngOnInit() {
  }
  switchList(): void {
    this.listState.isActive = !this.listState.isActive;
  }
}
