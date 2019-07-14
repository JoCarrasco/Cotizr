import { Component, OnInit } from '@angular/core';
import { AuthService, QuotationService, ApiService, Quotation, ActionService } from 'src/app/core';
import { AppStorage, StorageKey } from 'src/app/shared';
@Component({
  selector: 'app-user-quotations',
  templateUrl: './user-quotations.component.html',
  styleUrls: ['./user-quotations.component.scss']
})
export class UserQuotationsComponent implements OnInit {
  quotationQuantities = 0;
  lastOffset = 0;
  userQuotations: Quotation[] = [];
  isLoading = false;
  isFullyLoaded = false;
  pagination = [];
  paginationSets = [];
  currentPaginationDisplay = [];

  constructor(public auth: AuthService, public quotationService: QuotationService, private api: ApiService, private action: ActionService) { }

  ngOnInit() {
    this.requestOffset(0);
  }

  async requestOffset(offset: number) {
    this.action.load('Descargando lista de cotizaciones');
    this.isLoading = true;
    this.userQuotations = [];
    this.lastOffset = offset;
    const quotationObj = (await this.api.getUserQuotations(undefined, offset));
    const quotations = quotationObj.quotations;
    this.quotationQuantities = quotationObj.total;
    if (quotations) {
      this.action.stop();
      quotations.map((x) => {
        if (x.items.length) {
          x.status = parseInt(x.status, 0);
          x.items = JSON.parse(x.items);
        }
        return x;
      });
      this.userQuotations = quotations;
      if (offset === 0) {
        this.displayPages(10);
        this.currentPaginationDisplay = this.paginationSets[0];
        this.isFullyLoaded = true;
      }
      this.isLoading = false;
    } else {
      this.action.stop();
      this.isLoading = false;
    }
  }

  displayPages(groupNumber: number): void {
    let counter = 0;
    let paginationGroupCounter = groupNumber;
    const arr = [];
    const pageNumber = Math.ceil(this.quotationQuantities / 25);
    for (let i = 1; i <= pageNumber; i++) {
      arr.push({
        number: i,
        offset: counter === 25 ? 25 : counter === 0 ? 0 : counter * i,
      });

      if (counter === 0) {
        counter = 25;
      }
    }

    this.pagination = arr;
    let temp = [];
    this.pagination.forEach((x) => {
      if (this.pagination.indexOf(x) <= paginationGroupCounter) {
        temp.push(x);
        if (this.pagination.indexOf(x) === paginationGroupCounter || this.pagination.length - 1 === this.pagination.indexOf(x)) {
          this.paginationSets.push(temp);
          paginationGroupCounter += groupNumber;
          temp = [];
        }
      }
    });
  }

  previousPaginationDisplay(currentPaginationDisplay) {
    const index = this.paginationSets.indexOf(this.currentPaginationDisplay);
    this.currentPaginationDisplay = this.paginationSets[index - 1];
  }

  nextPaginationDisplay(currentPaginationDisplay) {
    const index = this.paginationSets.indexOf(this.currentPaginationDisplay);
    this.currentPaginationDisplay = this.paginationSets[index + 1];
  }

  download(quotation) {
    this.quotationService.generatePDF(quotation);
  }
}
