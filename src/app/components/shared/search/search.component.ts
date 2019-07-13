import { Component, OnInit, Input } from '@angular/core';
import { ApiService, QuotationService } from 'src/app/core';
import { PrestashopInfo } from 'src/app/shared';
import { DomSanitizer, SafeUrl, SafeStyle } from '@angular/platform-browser';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {
  isSearching = false;
  searchResult = [];
  @Input() arr: any[];

  constructor(private api: ApiService, public quotation: QuotationService, private sanitizer: DomSanitizer) { }

  ngOnInit() {

  }

  handleKeyUp(e, value) {
    if (e.key === 'Enter') {
      this.searchProduct(value);
    }
  }

  getProductImg(id): any {
    return `url(https://officenet.net.ve/cotizaya/images?id=${id})`;
  }

  async searchProduct(query) {
    if (query !== '') {
      this.searchResult = [];
      this.isSearching = true;
      const products = await this.api.searchProduct(query);
      if (products) {
        this.isSearching = false;
        this.searchResult = products.map(product => {
          return this.quotation.toQuotationItem(product);
        });
      }
    }
  }
}
