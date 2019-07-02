import { Component, OnInit } from '@angular/core';
import { QuotationService, ApiService, ActionService, Quotation } from 'src/app/core';
import { QuotationStateInfo, QuotationState, BusinessMath } from 'src/app/shared';
@Component({
  selector: 'app-search-quotations',
  templateUrl: './search-quotations.component.html',
  styleUrls: ['./search-quotations.component.scss']
})
export class SearchQuotationsComponent implements OnInit {
  quotationQuantities = 5560;
  lastOffset = 25;
  quotations = [];
  isLoading = false;
  all = [];
  pendent = [];
  rejected = [];
  approved = [];
  isFullyLoaded = false;
  pagination = [];
  paginationSets = [];
  currentPaginationDisplay = [];

  buttons = [
    { title: 'TODAS', activeColor: '#1b9ee2', status: 100 },
    { title: 'PENDIENTES', activeColor: '#ff6c00', status: QuotationState.Pendent },
    { title: 'RECHAZADAS', activeColor: '#ff3c3c', status: QuotationState.Rejected },
    { title: 'APROBADAS', activeColor: '#4eff55', status: QuotationState.Approved },
  ];

  constructor(public quotationService: QuotationService, private api: ApiService, private action: ActionService) { }

  async ngOnInit() {
    this.requestOffset(this.lastOffset);
  }

  async requestOffset(offset: number) {
    const today = new Date().valueOf;
    this.action.load('Descargando lista de cotizaciones');
    this.isLoading = true;
    this.all = [];
    this.quotations = [];
    this.lastOffset = offset;
    let quotations = await this.api.getQuotations(offset);
    if (quotations) {
      quotations = quotations.sort(function (a: Quotation, b: Quotation) { return new Date(a.date_created).getTime() + new Date(b.date_created).getTime() });
      console.log(quotations[0].date_created);
      this.action.stop();
      this.all = quotations;
      this.quotations = quotations;
      this.quotations = quotations.map((x) => {
        x.items = JSON.parse(x.items);
        x.items = x.items.map((x) => {
          x.amount = x.ammount;
          delete x.ammount;
          return x;
        });
        return x;
      });
      if (offset === 25) {
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

  resetAll() {
    this.quotationQuantities = 5560;
    this.lastOffset = 25;
    this.quotations = [];
    this.isLoading = false;
    this.all = [];
    this.pendent = [];
    this.rejected = [];
    this.approved = [];
    this.isFullyLoaded = false;
    this.pagination = [];
    this.paginationSets = [];
    this.currentPaginationDisplay = [];
  }

  quotationStatus(value): string {
    return QuotationStateInfo[value].message;
  }

  private filterQuotations(arr): void {
    this.all = arr;
    this.pendent = arr.filter((item) => item.products.state.stateStatus === QuotationState.Pendent);
    this.rejected = arr.filter((item) => item.products.state.stateStatus === QuotationState.Rejected);
    this.approved = arr.filter((item) => item.products.state.stateStatus === QuotationState.Approved);
    this.isFullyLoaded = true;
  }

  nextPaginationDisplay(currentPaginationDisplay) {
    const index = this.paginationSets.indexOf(this.currentPaginationDisplay);
    this.currentPaginationDisplay = this.paginationSets[index + 1];
    console.log(this.currentPaginationDisplay);
  }

  handleChange(e, value) {
    console.log(e, value);
    if (e.keyCode === 13) {
      this.searchQuotation(value);
    }
    // searchQuotation(query.value)
  }

  // searchQuotation(value: string) {
  //   this.
  // }

  async getQuotationsByStatus(status: QuotationState) {
    console.log(status);
    if (status === 100) {
      this.requestOffset(25);
    }
  }

  async searchQuotation(id: string) {
    this.action.load('Buscando cotizacion');
    if (id.length > 0) {
      const quotation = (await this.api.getQuotation(id));
      if (quotation) {
        quotation.items = JSON.parse(quotation.items).map((x) => {
          x.amount = x.ammount;
          delete x.ammount;
          return x;
        });
        this.quotations = [quotation];
        this.action.stop();
      } else {
        this.action.load('No se encontro niguna cotizacion con ese id');
      }
      console.log(quotation);
    }
  }

  previousPaginationDisplay(currentPaginationDisplay) {
    const index = this.paginationSets.indexOf(this.currentPaginationDisplay);
    this.currentPaginationDisplay = this.paginationSets[index - 1];
    console.log(this.currentPaginationDisplay);
  }

  displayPages(groupNumber: number): void {
    let paginationGroupCounter = groupNumber;
    const arr = [];
    const pageNumber = this.quotationQuantities / 25;
    for (let i = 1; i <= pageNumber; i++) {
      arr.push({
        number: i,
        offset: this.lastOffset * i
      });
    }

    this.pagination = arr;
    let temp = [];
    this.pagination.forEach((x) => {
      if (this.pagination.indexOf(x) <= paginationGroupCounter) {
        temp.push(x);
        if (this.pagination.indexOf(x) === paginationGroupCounter) {
          this.paginationSets.push(temp);
          paginationGroupCounter += groupNumber;
          console.log('Counter is', paginationGroupCounter);
          temp = [];
        }
      }
    });
  }

  total(products: any[]) {
    return BusinessMath.subtotalFromProductArray(products);
  }
}
