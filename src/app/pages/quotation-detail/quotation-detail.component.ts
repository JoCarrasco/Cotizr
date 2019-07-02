import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService, Quotation, QuotationItem, QuotationService } from 'src/app/core';
import { BusinessMath, QuotationState, PrestashopInfo } from 'src/app/shared';
import { QuotationDataFormComponent } from 'src/app/components/shared/quotation-data-form/quotation-data-form.component';

@Component({
  selector: 'app-quotation-detail',
  templateUrl: './quotation-detail.component.html',
  styleUrls: ['./quotation-detail.component.scss']
})
export class QuotationDetailComponent implements OnInit {
  businessMath = BusinessMath;
  quotationItems: QuotationItem[] = [];
  @ViewChild('quotationForm') quotationForm: QuotationDataFormComponent;

  constructor(private route: ActivatedRoute, private api: ApiService, public quotationService: QuotationService) { }

  async ngOnInit() {
    this.route.params.subscribe(async (params) => {
      const id = params['id'];
      console.log(`id is ${id}`);
      const quotation = await this.api.getQuotation(id);
      if (quotation) {
        console.log(quotation);
        const items = JSON.parse(quotation.items).map((x) => {
          x.amount = x.ammount;
          delete x.ammount;
          return x;
        });

        this.quotationService.quotationItems = items;

        const model = new Quotation(quotation);
        this.quotationForm.setValue(model);
        setTimeout(() => {
          this.quotationForm.setValue(model);
        }, 0);
      }
    });
  }

  subtotal() {
    return BusinessMath.subtotalFromProductArray(this.quotationService.quotationItems);
  }

  iva() {
    return BusinessMath.ivaFromProducts(this.quotationService.quotationItems, PrestashopInfo.IVA);
  }

  total() {
    return BusinessMath.totalIVAFromProductArray(this.quotationService.quotationItems, PrestashopInfo.IVA);
  }
}
