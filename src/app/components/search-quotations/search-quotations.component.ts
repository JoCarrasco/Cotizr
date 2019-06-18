import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { QuotationService } from 'src/app/core';
@Component({
  selector: 'app-search-quotations',
  templateUrl: './search-quotations.component.html',
  styleUrls: ['./search-quotations.component.scss']
})
export class SearchQuotationsComponent implements OnInit {
  searchQuotationState = {
    isFullyLoaded: false,
    searchType: '',
    referenceArrays: {
      all: [],
      pendent: [],
      rejected: [],
      approved: []
    },
    array: [],
    pagination: [],
    pages: [],
    displayPages: [],
    isModalActive: false,
    quotationPreview: null,
    edit: {
      value: null,
      message: ''
    }
  }

  buttons = [
    { title: 'TODAS', activeColor: '#1b9ee2', searchValue: 'all', status: 100 },
    { title: 'PENDIENTES', activeColor: '#ff6c00', searchValue: 'pendent', status: 0 },
    { title: 'RECHAZADAS', activeColor: '#ff3c3c', searchValue: 'rejected', status: 1 },
    { title: 'APROBADAS', activeColor: '#4eff55', searchValue: 'approved', status: 2 },
  ];

  constructor(public quotation: QuotationService, private http: HttpClient) { }

  ngOnInit() {
    this.setSearchType('all');
    this.quotation.searchQuotation(this.searchQuotationState.searchType);
    this.paginationInit();
  }

  setSearchType(type: string): void {
    if (type == 'all' && this.searchQuotationState.searchType == 'all') {
      this.quotation.searchQuotation(this.searchQuotationState.searchType);
      this.searchQuotationState.array = this.searchQuotationState.referenceArrays[type];
      this.searchQuotationState.searchType = type;
    } else {
      this.searchQuotationState.array = this.searchQuotationState.referenceArrays[type];
      this.searchQuotationState.searchType = type;

    }
  }

  closeModal(): void {
    this.searchQuotationState.isModalActive = false;
    this.searchQuotationState.quotationPreview = null;
    this.searchQuotationState.edit = {
      value: null,
      message: ''
    }
  }

  // private getSearchQuotations(): void {
  //   this.quotation.searchedResuult.subscribe((res: any) => {
  //     if (res && res.length > 0) {
  //       console.log('Begin filter');
  //       this.filterQuotations(res);
  //     }
  //   });
  // }

  setEditTo(type: number): void {
    this.searchQuotationState.edit.value = type;
  }

  displayQuotation(quotation): void {
    this.searchQuotationState.isModalActive = true
    this.searchQuotationState.quotationPreview = quotation;
    console.log(quotation);
  }

  searchQuotation(value: string): void {
    // this.resetState();
    // this.quotation.searchQuotation(this.searchQuotationState.searchType, value);
    // if (this.searchQuotationState.searchType != 'all' && value.length > 0) {
    //   this.setSearchType('all');
    // }
  }

  paginationInit(): void {
    let pagination = [];
    this.http.get('https://officenet.net.ve/api/cotizr_quotation?ws_key=IDSVZ1NUDEEVVGH6G25CRWDFKDYAZNHU&output_format=JSON&sort=[id_DESC]', { responseType: 'text' }).subscribe((x: any) => {
      let array = JSON.parse(x)['cotizr_quotations'];
      if (array) {
        this.renderPaginationComponent(array.length);
      }
    });
  }


  fromNumberToStatus(value): string {
    let result = '';
    if (value == 0) {
      result = 'Pendiente';
    } else if (value == 1) {
      result = 'Rechazada';
    } else if (value == 2) {
      result = 'Aprobada';
    }
    return result;
  }

  private filterQuotations(arr): void {
    this.resetState();
    this.searchQuotationState.referenceArrays.all = arr;
    this.searchQuotationState.referenceArrays.pendent = arr.filter((item) => item.products.state ? item.products.state.stateStatus == 0 : item);
    this.searchQuotationState.referenceArrays.rejected = arr.filter((item) => {
      if (item.products.state) {
        return item.products.state.stateStatus == 1;
      } else { }
    });
    this.searchQuotationState.referenceArrays.approved = arr.filter((item) => {
      if (item.products.state) {
        return item.products.state.stateStatus == 2;
      } else { }
    });
    this.searchQuotationState.array = arr;
    this.searchQuotationState.isFullyLoaded = true;

  }

  private renderPaginationComponent(length): void {
    let pages = [];
    let numberOfPages = (length / 20) + 1;
    for (let i = 0; i <= numberOfPages; i++) {
      let model = {
        index: i + 1,
        offset: i < 1 ? length - (1 * 20) : length - (i * 20) + 20,
        limit: i < 1 ? length : length - (i * 20) < 0 ? 0 : length - (i * 20)
      }
      pages.push(model);
    }

    this.searchQuotationState.pages = pages.sort((a, b) => a.index - b.index);

    /**/

    this.displayPages(pages);
  }

  displayPages(pages): void {
    let loopCount = pages;
    let offset = 0;
    let limit = 3;
    let pagination = [];
    let page = [];
    console.log('Total Sections:', loopCount);

    pages.forEach((x) => {
      if (pages.indexOf(x) % 3 != 0 || pages.indexOf(x) == 0) {
        page.push(x);
      } else {
        page.push(x);
        pagination.push(page);
        page = [];
      }
    });

    console.log(pagination);
    // for (let i = 1; i <= loopCount; i++) {
    //   let page = [];

    //   for (let x = offset; x <= limit; x++) {
    //     page.push(x);
    //     // console.log(page);
    //     if (x == limit) {
    //       limit = i + 1 * 5;
    //       offset = i * 5;
    //     }
    //   }

    //   pagination.push(page);
    //  console.log(pagination);
    // }
    this.searchQuotationState.pagination = pagination;
    this.searchQuotationState.displayPages = pagination[0];
    console.log(this.searchQuotationState);
  }

  renderPagination(page): void {
    console.log('Rendering...', page);
    this.setSearchType('all');
    let sub = this.http.get(`https://officenet.net.ve/api/cotizr_quotation?ws_key=IDSVZ1NUDEEVVGH6G25CRWDFKDYAZNHU&display=full&output_format=JSON&filter[id]=[${page.offset},${page.limit}]&sort=[id_DESC]`, { responseType: 'text' })
      .subscribe((x: any) => {
        let array = JSON.parse(x)['cotizr_quotations'];
        if (array) {
          array.forEach((quotation) => { quotation.products = JSON.parse(quotation.products) });
          this.filterQuotations(array);
          sub.unsubscribe();
        }
      })
  }

  nextPagination(currentSection) {
    let index = this.searchQuotationState.pagination.indexOf(currentSection);
    console.log(this.searchQuotationState.pagination.indexOf(currentSection));
    this.searchQuotationState.displayPages = this.searchQuotationState.pagination[index + 1];
  }

  previousPagination(currentSection) {
    let index = this.searchQuotationState.pagination.indexOf(currentSection);
    this.searchQuotationState.displayPages = this.searchQuotationState.pagination[index - 1];
  }

  private resetState(): void {
    this.searchQuotationState.referenceArrays = {
      all: [],
      pendent: [],
      rejected: [],
      approved: []
    }
  }

  ifIsOffset(currentPage): boolean {
    return this.searchQuotationState.pagination.indexOf(currentPage) == 0 ? true : false;
  }

  ifIsLimit(currentPage): boolean {
    return this.searchQuotationState.pagination.indexOf(currentPage) == this.searchQuotationState.pagination.length - 1 ? true : false;
  }

  saveChanges(): void {
    // this.quotation.editQuotation(this.searchQuotationState.quotationPreview, this.searchQuotationState.edit.value, this.searchQuotationState.edit.message);
    // this.getSearchQuotations();
  }

  download(quotation): void {
    this.quotation.generatePDF(quotation);
  }
}
