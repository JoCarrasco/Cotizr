import { Component, OnInit, Input } from '@angular/core';
import { ApiService, QuotationService } from 'src/app/core';
import { PrestashopInfo } from 'src/app/shared';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {
  isSearching = false;
  searchResult = [];
  @Input() arr: any[];

  constructor(private api: ApiService, public quotation: QuotationService) { }

  ngOnInit() {
  }

  handleKeyUp(e, value) {
    if (e.key === 'Enter') {
      this.searchProduct(value);
    }
  }

  getProductImg(item): string {
    return `url(${PrestashopInfo.shopAPI}images/products/${item.id_product}/${item.id_default_image}/medium_default?ws_key=${PrestashopInfo.wsKey})`;
  }

  async searchProduct(query) {
    if (query !== '') {
      this.searchResult = [];
      this.isSearching = true;
      const products = await this.api.searchProduct(query);
      this.isSearching = false;
      if (products) {
        this.searchResult = products.map(product => {
          return this.quotation.toQuotationItem(product);
        });
      }
    }
  }
}
