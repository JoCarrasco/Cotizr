import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { BusinessMath, PrestashopInfo, AppStorage, StorageKey, QuotationState, DevEnv, ResponseStatus, AuthType } from 'src/app/shared';
import { QuotationItem, ApiService, QuotationService, Quotation, ActionService } from 'src/app/core';
import { QuotationDataFormComponent } from '../shared/quotation-data-form/quotation-data-form.component';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-quotation',
  templateUrl: './quotation.component.html',
  styleUrls: ['./quotation.component.scss']
})
export class QuotationComponent implements OnInit {
  isDrawerActive = false;
  isSearchScreenActive = false;


  refQuotation: Quotation = new Quotation();
  businessMath = BusinessMath;
  quotationItems: QuotationItem[] = [];


  @Input() type: 'quotation' | 'generate';
  @ViewChild('quotationForm') quotationForm: QuotationDataFormComponent;

  constructor(private router: Router,
    private route: ActivatedRoute,
    private api: ApiService,
    public quotationService: QuotationService,
    private action: ActionService) {
    this.refQuotation.status = QuotationState.Pendent;
  }

  async ngOnInit() {
    this.quotationForm.setValue(new Quotation());
    this.quotationService.quotationItems = [];
    if (this.type === 'quotation') {
      this.route.params.subscribe(async (params) => {
        const id = params['id'];
        const req = AppStorage.get(StorageKey.Session).type === AuthType.Employee ?
          this.api.getQuotationAsAdmin(id) : this.api.getQuotation(id);
        const quotationReq = await req.then((quotation) => {
          if (quotation !== '"{}"') {
            quotation.items = JSON.parse(quotation.items).map((x) => {
              x.total = x.price * x.ammount;
              return x;
            });
            this.refQuotation = quotation;
            const model = new Quotation(quotation);
            this.quotationService.quotationItems = quotation.items;
            setTimeout(() => {
              this.quotationForm.setValue(model);
            }, 0);
          } else {
            this.action.error('Lo siento no estas autorizado para ver esta cotizacion', 400);
          }
        }).catch((e) => {
          if (e.status === ResponseStatus.WrongAuth) {

          }
        });
      });
    }
  }

  switchSearchScreen(boolValue) {
    document.body.style.overflowY = boolValue ? 'hidden' : 'scroll';
    this.isSearchScreenActive = boolValue;
    this.isDrawerActive = boolValue;
  }

  isOnline(): boolean {
    return navigator.onLine;
  }

  createQuotationObject(formValues, items): Quotation {
    const session = AppStorage.get(StorageKey.Session);
    const form = formValues;
    const quotation = new Quotation({
      items: items,
      status: QuotationState.Pendent,
      user: session.user,
      id_customer: session.user.id,
      user_type: session.type,
      company_address: form.company_address,
      company_name: form.company_name,
      receiver: form.receiver,
      phone_number: form.phone_number,
      identification: form.identification,
      emails: [],
      subtotal: BusinessMath.subtotalFromProductArray(items)
    });
    return quotation;
  }

  async createQuotation(downloadOnly?) {
    this.action.load('Creando cotizacion');
    DevEnv.print('createQuotation(): Creating Quotation');
    const quotation = this.createQuotationObject(this.quotationForm.getValue(), this.quotationService.quotationItems);
    if (!downloadOnly) {
      const isQuotationCreated = await this.api.createQuotation(quotation.toDBObject(true));
      if (isQuotationCreated) {
        const newQuotation = (await this.api.getUserQuotations(AppStorage.get(StorageKey.Session).user.id, 1)).quotations[0];
        if (newQuotation) {
          newQuotation.items = JSON.parse(newQuotation.items).map((x) => {
            x.total = x.price * x.ammount;
            return x;
          });
          newQuotation.user = JSON.parse(newQuotation.user);
          this.download(new Quotation(newQuotation));
          this.action.stop();
          this.router.navigate(['../panel/quotation-detail', newQuotation.id_cotizr_quotation]);
        } else {
          this.action.stop();
        }
      } else {
        this.action.stop();
      }
    } else {
      quotation.id_cotizr_quotation = 'OFFLINE';
      this.action.stop();
      this.download(new Quotation(quotation));
    }
  }

  async updateQuotation() {
    const session = AppStorage.get(StorageKey.Session);
    this.action.load('Actualizando Cotizacion');
    const quotation = this.createQuotationObject(this.quotationForm.getValue(), this.quotationService.quotationItems);
    quotation.id_cotizr_quotation = this.refQuotation.id_cotizr_quotation;
    const isUpdate = await this.api.updateQuotation(quotation.toDBObject());
    if (isUpdate) {
      this.action.success('Cotizacion Actualizada');
      const quotationObj = (await this.api.getUserQuotations(AppStorage.get(StorageKey.Session).user.id, 1));
      if (quotationObj) {
        const updatedQuotation = quotationObj.quotations[0];
        updatedQuotation.items = JSON.parse(updatedQuotation.items);
        updatedQuotation.user = JSON.parse(updatedQuotation.user);
        this.action.stop();
        this.router.navigate(['../panel/quotation-detail', updatedQuotation.id_cotizr_quotation]);
        this.download(new Quotation(updatedQuotation));
      }
    } else {
      this.action.stop();
    }
  }

  download(quotation) {
    this.quotationService.generatePDF(quotation);
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

  getProductImg(id): any {
    return `url(https://officenet.net.ve/cotizaya/images?id=${id})`;
  }
}
