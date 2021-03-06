import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { QuotationItem, Quotation } from '..';
import * as jsPDF from 'jspdf';
import 'jspdf-autotable';
import {
  CartOperation,
  Format,
  AppStorage,
  StorageKey, DevEnv,
  BusinessMath,
  PrestashopInfo,
  QuotationState
} from 'src/app/shared';
import { ApiService } from './api.service';
@Injectable({
  providedIn: 'root'
})
export class QuotationService {
  public quotationItems: QuotationItem[] = [];
  constructor(private router: Router, private api: ApiService) { }

  public async updateQuotation(quotation: Quotation) {
    // const updatedQuotation = this.api.updateQuotation(Generate.psXML(quotation, APIResource.Quotations));
    // if (quotation) {
    //   DevEnv.print('updateQuotation(): Quotation Updated');
    // }
  }

  public checkAmount(item: QuotationItem): number {
    return this.checkExistence(item) ? this.getFromQuotation(item).ammount : 0;
  }

  private getFromQuotation(item: QuotationItem): QuotationItem {
    return this.quotationItems.find(x => item.id_product === x.id_product);
  }

  private addToQuotation(item: QuotationItem): void {
    this.quotationItems.push(new QuotationItem(Object.assign(item, { ammount: 1 })));
  }

  public removeFromQuotation(item: QuotationItem): void {
    this.quotationItems.splice(this.getOrderIndex(item), 1);
    this.saveQuotationItems();
  }

  private getOrderIndex(item: QuotationItem): number {
    return this.quotationItems.findIndex(x => x.id_product === item.id_product);
  }

  public changeAmount(item, operation: CartOperation): void {
    const targetItem = this.getFromQuotation(this.toQuotationItem(item));
    if (operation === CartOperation.Add) {
      targetItem.ammount += 1;
    } else if (operation === CartOperation.Rest) {
      if (targetItem.ammount > 1) {
        targetItem.ammount -= 1;
      } else {
        this.removeFromQuotation(targetItem);
      }
    }
  }

  public checkExistence(item: QuotationItem): boolean {
    return this.quotationItems.find(x => x.id_product === item.id_product) ? true : false;
  }

  public quotateItem(item): void {
    if (this.checkExistence(item)) {
      this.changeAmount(item, CartOperation.Add);
    } else {
      this.addToQuotation(item);
    }
  }

  private saveQuotationItems(): void {
    AppStorage.set(StorageKey.Quotation, { products: this.quotationItems, metadata: '' });
  }

  public toQuotationItem(item): QuotationItem {
    return new QuotationItem(Object.assign(item, { ammount: 0 }));
  }

  public async createQuotation(quotation: Quotation, downloadAfterCreation = true) {
    if (navigator.onLine) {

      DevEnv.print(`createQuotation(): Setting models to begin http request.`);
      const body = new Quotation(Object.assign(quotation, {
        subtotal: BusinessMath.subtotalFromProductArray(quotation.items as QuotationItem[]),
        date_created: Format.formatDate(new Date()),
        emails: JSON.stringify([]),
        products: JSON.stringify([]),
        user_type: AppStorage.get(StorageKey.Session).user.type,
        status: QuotationState.Pendent,
        id_customer: parseInt(AppStorage.get(StorageKey.Session).user.id, 0),
        items: JSON.stringify(quotation.items),
      }));

      DevEnv.print(`createQuotation(): Creation and checked, succesfull.`);
      DevEnv.print(`createQuotation(): Doing http request.`);

      const newQuotation = await this.api.createQuotation(body);
      this.generatePDF(body);
    } else {
      return true;
    }
  }

  /*PDF*/
  public generatePDF(quotation: Quotation): void {
    quotation = new Quotation(quotation);
    const items = JSON.parse(JSON.stringify(quotation.items));
    const columns = [
      { title: 'ID', dataKey: 'id_product' },
      { title: 'Descripción', dataKey: 'name' },
      { title: 'Cantidad', dataKey: 'ammount' },
      { title: 'Precio', dataKey: 'price' },
      { title: 'Total', dataKey: 'total' }
    ];

    const subtotal = Format.formatNumberWithSeparators(BusinessMath.subtotalFromProductArray(items));
    const iva = Format.formatNumberWithSeparators(BusinessMath.ivaFromProducts(items, 16));
    const total = Format.formatNumberWithSeparators(BusinessMath.totalIVAFromProductArray(items, 16));
    const quotationInfo = [
      {
        name: '',
        amount: '',
        price: 'SUBTOTAL:',
        total: subtotal ? subtotal : 0 + ' Bs'
      },
      {
        name: '',
        amount: '',
        price: 'IVA(16%):',
        total: iva ? iva : 0 + ' Bs'
      },
      {
        name: '',
        amount: '',
        price: 'TOTAL:',
        total: total ? total : 0 + ' Bs'
      }
    ];

    items.map((x: any) => {
      x.total = Format.formatNumberWithSeparators(x.ammount * x.price) + ' Bs';
      x.price = Format.formatNumberWithSeparators(x.price) + ' Bs';
      return x;
    });

    let itemArray = this.getTotalPageRows(1);

    if (items.length / 22 > 1) {
      itemArray = this.getTotalPageRows(2);
      if (items.length / 22 > 2) {
        itemArray = this.getTotalPageRows(3);
      }
    }

    quotationInfo.forEach(() => itemArray.pop());
    items.forEach(() => itemArray.shift());
    items.forEach((x) => itemArray.unshift(x));

    itemArray.push.apply(itemArray, quotationInfo);
    const splitArr = quotation.company_address.split(' ');

    if (splitArr.length > 6) {
      const begin = splitArr.slice(0, 7);
      const remaining = splitArr.slice(7);
      const addressTotal: any = [];
      addressTotal.push.apply(addressTotal, begin);
      addressTotal.push.apply(addressTotal, ['\n']);
      addressTotal.push.apply(addressTotal, remaining);
      quotation.company_address = addressTotal.join(' ');
    }

    const doc = new jsPDF('p', 'pt');
    doc.setDrawColor(0);
    doc.setTextColor(255, 255, 255);
    doc.setFillColor(27, 158, 226);
    doc.rect(40, 35, 515, 150, 'F');
    doc.addImage(PrestashopInfo.logo, 'PNG', 40 + 215, 60, 100, 22.6);
    doc.setFontSize(12);
    doc.setFontType('bold');
    doc.text(40 + 15, 70, `Cotización Nro: ON-${quotation.id_cotizr_quotation}`);
    doc.setFontSize(9);
    doc.setFontType('normal');
    doc.text(40 + 15, 82, 'Fecha: ' + quotation.date_created);
    doc.setFontSize(10);
    doc.setFontType('bold');
    doc.text(40 + 15, 95, 'Realizada Por: ');
    doc.setFontSize(9);
    doc.setFontType('normal');
    doc.text(40 + 15, 105, quotation.user.name ? quotation.user.name : '');
    doc.text(40 + 230, 100, 'RIF: J403450706');
    doc.text(40 + 360, 110, 'Teléfonos 0251-418-6000 \n                 0251-418-8717\nWhatsapp: +58 414 159 6439');
    doc.text(40 + 360, 150, 'Entregas total mente gratis en \n72 horas maximo \n(Lara, Yaracuy y Portuguesa)');
    doc.setFontType('bold');
    doc.text(40 + 15, 120, 'Representante:');
    doc.setFontType('normal');
    doc.text(40 + 90, 120, quotation.receiver);
    doc.setFontType('bold');
    doc.text(40 + 15, 150, 'Empresa:');
    doc.setFontType('normal');
    doc.text(40 + 60, 150, quotation.company_name);
    doc.setFontType('bold');
    doc.text(40 + 15, 130, 'RIF:');
    doc.setFontType('normal');
    doc.text(40 + 40, 130, quotation.identification);
    doc.setFontType('bold');
    doc.text(40 + 15, 160, 'Dirección:');
    doc.setFontType('normal');
    doc.text(40 + 65, 160, quotation.company_address);
    doc.setFontType('bold');
    doc.text(40 + 15, 140, 'Teléfono:');
    doc.setFontType('normal');
    doc.text(40 + 60, 140, quotation.phone_number);
    doc.autoTable(columns, itemArray, {
      addPageContent: (data) => { },
      headerStyles: {
        fillColor: [27, 158, 226],
        halign: 'center'
      },
      columnStyles: {
        name: { columnWidth: 220 },
        amount: { columnWidth: 80, halign: 'center' },
        price: { halign: 'right' },
        total: { halign: 'right' }
      },
      styles: {
        overflow: 'linebreak'
      },
      startY: 183,
      showHeader: 'firstPage'
    });
    doc.setFontType('normal');
    doc.setTextColor(0);
    doc.setFillColor(27, 158, 226);
    doc.rect(40, 750, 515, 3, 'F');
    doc.text(40 + 15, 770, 'LA COTIZACIÓN PRESENTADA EN ESTA HOJA TIENE UNA VÁLIDEZ MÁXIMA DE 5 HORAS.');
    doc.text(40 + 15, 780, 'EL METODO DE PAGO ES 100% PRE-PAGADO');
    doc.setFontType('bold');
    doc.text(40 + 160, 800, 'Esta cotización fue generada por CotizaYA!:');
    doc.text(40 + 170, 815, 'https://cotizaya.officenet.net.ve');

    doc.save('Cotización - Productos de Officenet' + ' ' + quotation.date_created + '.pdf');
  }

  private getTotalPageRows(number): Array<any> {
    const resultArr = [];
    let itemArray = [];
    if (number > 1) {
      itemArray = [
        { name: '', ammount: '', price: '', total: '' },
        { name: '', ammount: '', price: '', total: '' },
        { name: '', ammount: '', price: '', total: '' },
        { name: '', ammount: '', price: '', total: '' },
        { name: '', ammount: '', price: '', total: '' },
        { name: '', ammount: '', price: '', total: '' },
        { name: '', ammount: '', price: '', total: '' },
        { name: '', ammount: '', price: '', total: '' },
        { name: '', ammount: '', price: '', total: '' },
        { name: '', ammount: '', price: '', total: '' },
        { name: '', ammount: '', price: '', total: '' },
        { name: '', ammount: '', price: '', total: '' },
        { name: '', ammount: '', price: '', total: '' },
        { name: '', ammount: '', price: '', total: '' },
        { name: '', ammount: '', price: '', total: '' },
        { name: '', ammount: '', price: '', total: '' },
        { name: '', ammount: '', price: '', total: '' },
        { name: '', ammount: '', price: '', total: '' },
        { name: '', ammount: '', price: '', total: '' },
        { name: '', ammount: '', price: '', total: '' },
        { name: '', ammount: '', price: '', total: '' },
        { name: '', ammount: '', price: '', total: '' },
        { name: '', ammount: '', price: '', total: '' },
        { name: '', ammount: '', price: '', total: '' },
        { name: '', ammount: '', price: '', total: '' },
        { name: '', ammount: '', price: '', total: '' },
        { name: '', ammount: '', price: '', total: '' },
        { name: '', ammount: '', price: '', total: '' }, /*26*/
      ];
    } else {
      itemArray = [
        { name: '', ammount: '', price: '', total: '' },
        { name: '', ammount: '', price: '', total: '' },
        { name: '', ammount: '', price: '', total: '' },
        { name: '', ammount: '', price: '', total: '' },
        { name: '', ammount: '', price: '', total: '' },
        { name: '', ammount: '', price: '', total: '' },
        { name: '', ammount: '', price: '', total: '' },
        { name: '', ammount: '', price: '', total: '' },
        { name: '', ammount: '', price: '', total: '' },
        { name: '', ammount: '', price: '', total: '' },
        { name: '', ammount: '', price: '', total: '' },
        { name: '', ammount: '', price: '', total: '' },
        { name: '', ammount: '', price: '', total: '' },
        { name: '', ammount: '', price: '', total: '' },
        { name: '', ammount: '', price: '', total: '' },
        { name: '', ammount: '', price: '', total: '' },
        { name: '', ammount: '', price: '', total: '' },
        { name: '', ammount: '', price: '', total: '' },
        { name: '', ammount: '', price: '', total: '' },
        { name: '', ammount: '', price: '', total: '' },
        { name: '', ammount: '', price: '', total: '' },
        { name: '', ammount: '', price: '', total: '' },
      ];
    }

    for (let i = 0; i < number; i++) {
      resultArr.push.apply(resultArr, itemArray);
    }

    return resultArr;
  }

  public getTotalArray(array, hasIVA: boolean): number {
    return hasIVA ? BusinessMath.totalIVAFromProductArray(array, 16) : BusinessMath.subtotalFromProductArray(array);
  }
}
