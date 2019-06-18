import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import * as _ from 'lodash';
import { QuotationItem, Quotation } from '..';
import {
  CartOperation,
  Generate,
  APIResource,
  Format,
  AppStorage,
  StorageKey, DevEnv,
  QuotationState,
  BusinessMath,
  PDF
} from 'src/app/shared';
import { ApiService } from './api.service';
@Injectable({
  providedIn: 'root'
})
export class QuotationService {
  public quotationItems: QuotationItem[] = [];

  constructor(private router: Router, private api: ApiService) { }

  // async searchProduct(query) {
  //   this.$searchResult.next([]);
  //   const searchQuery: Angular2PrestaQuery = { resource: 'products', search: query };
  //   this.isSearching = true;

  //   const products = await this.psWS.search(searchQuery).toPromise();
  //   this.isSearching = false;
  //   if (products) {
  //     console.log(products);
  //     this.$searchResult.next(products);
  //   }
  // }

  public async getUserQuotations(user, sessionType): Promise<any> {
    return (await this.api.getUserQuotations(user.id)).map((x) => {
      x.products = JSON.parse(x.products);
      x.products.items.map((y) => {
        y.total = y.amount * y.price;
      });
      return x;
    }).sort((a, b) => b - a);
  }

  public async updateQuotation(quotation: Quotation) {
    const updatedQuotation = this.api.updateQuotation(Generate.psXML(quotation, APIResource.Quotations));
    if (quotation) {
      DevEnv.print('updateQuotation(): Quotation Updated');
    }
  }

  public async searchQuotation(id: string) {
    const target = this.api.searchQuotation(id);
    if (target) {
      console.log(target);
    }
  }

  public checkAmount(item: QuotationItem): number {
    return this.checkExistence(item) ? this.getFromQuotation(item).amount : 0;
  }

  private getFromQuotation(item: QuotationItem): QuotationItem {
    return this.quotationItems.find(x => item.id === x.id);
  }


  private addToQuotation(item: QuotationItem): void {
    this.quotationItems.push(new QuotationItem(_.merge(item, { amount: 1 })));
  }

  public removeFromQuotation(item: QuotationItem): void {
    this.quotationItems.splice(this.getOrderIndex(item), 1);
    this.saveQuotationItems();
  }

  private getOrderIndex(item: QuotationItem): number {
    return this.quotationItems.findIndex(x => x.id === item.id);
  }

  public changeAmount(item, operation: CartOperation): void {
    const targetItem = this.getFromQuotation(this.toQuotationItem(item));
    if (operation === CartOperation.Add) {
      targetItem.amount += 1;
    } else if (operation === CartOperation.Rest) {
      if (targetItem.amount > 1) {
        targetItem.amount -= 1;
      } else {
        this.removeFromQuotation(targetItem);
      }
    }
  }

  public checkExistence(item: QuotationItem): boolean {
    return this.quotationItems.find(x => x.id === item.id) ? true : false;
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
    Object.keys(item).forEach(key => {
      if (key !== 'id' && key !== 'amount' &&
        key !== 'meta_description' && key !== 'name' &&
        key !== 'id_default_image' && key !== 'price') {
        delete item[key];
      }
    });
    return new QuotationItem(_.merge(new QuotationItem(), _.merge(item, {
      description: item.meta_description,
      amount: 0
    })));
  }

  private async createQuotation(user, products, metadata, downloadAfterCreation = true) {
    DevEnv.print(`createQuotation(): Setting models to begin http request.`);
    const body = Generate.psXML({
      user: user,
      items: products,
      subtotal: BusinessMath.subtotalFromProductArray(products),
      state: QuotationState.Pendent,
      cotizer: metadata.cotizer,
      phoneNumber: metadata.phoneNumber,
      companyAddress: metadata.companyAddress,
      companyName: metadata.companyName,
      RIF: metadata.RIF,
      username: metadata.userName,
      date_created: Format.formatDate(new Date()),
    }, APIResource.Quotations);
    DevEnv.print(`createQuotation(): Creation and checked, succesfull.`);
    DevEnv.print(`createQuotation(): Doing http request.`);

    const newQuotation = await this.api.createQuotation(body);
    if (newQuotation) {
      DevEnv.print(`createQuotation(): Quotation created.`);
      if (downloadAfterCreation) {
        PDF.download(PDF.createPdfFromQuotation(newQuotation), newQuotation.date_created);
      }
    }
  }

  /*PDF*/
  public generatePDF(quotation): void {
    // let quotationMetadata = quotation.products.info.metadata;
    // console.log(quotationMetadata);
    // let copyItems = Object.assign({}, quotation.products.items);
    // let items = Object.keys(copyItems).map((key) => copyItems[key]);
    // console.log('Generating PDF');
    // console.log('The original is', quotation);
    // let columns = [
    //   { title: 'Descripción', dataKey: 'name' },
    //   { title: 'Cantidad', dataKey: 'amount' },
    //   { title: 'Precio', dataKey: 'price' },
    //   { title: 'Total', dataKey: 'total' }
    // ];

    // let metadata = {
    //   IVA: this.numberWithCommas(parseFloat((this.getTotalArray(items, true) - this.getTotalArray(items, false)).toFixed(2))) + ' Bs.S',
    //   subtotal: this.numberWithCommas(parseFloat(this.getTotalArray(items, false).toFixed(2))) + ' Bs. S',
    //   total: this.numberWithCommas(parseFloat(this.getTotalArray(items, true).toFixed(2))) + ' Bs. S'
    // }

    // let quotationInfo = [
    //   { name: '', amount: '', price: 'SUBTOTAL:', total: this.numberWithCommas(metadata.subtotal) },
    //   { name: '', amount: '', price: 'IVA(16%):', total: this.numberWithCommas(metadata.IVA) },
    //   { name: '', amount: '', price: 'TOTAL:', total: this.numberWithCommas(metadata.total) }
    // ]

    // items.map((x: any) => {
    //   x.total = this.numberWithCommas(parseFloat((x.amount * x.price).toFixed(2)));
    //   return x;
    // });

    // let itemArray = this.getTotalPageRows(1);

    // if (items.length / 22 > 1) {
    //   itemArray = this.getTotalPageRows(2);
    //   if (items.length / 22 > 2) {
    //     itemArray = this.getTotalPageRows(3);
    //   }
    // }

    // console.log(itemArray);


    // quotationInfo.forEach(() => {
    //   itemArray.pop();
    // });
    // items.forEach(() => {
    //   itemArray.shift();
    // });
    // items.forEach((x) => {
    //   itemArray.unshift(x);
    // });



    // let arr = [];
    // let numberOfPages = items.length / 20;
    // if (numberOfPages) {

    //   for (let i = 1; i <= numberOfPages; i++) {
    //     arr.push.apply(arr, itemArray);
    //   }
    // } else if (items.length / 20){
    //   console.log('The number of pages:', items.length / 20);
    // }
    // itemArray.push.apply(itemArray, quotationInfo);


    // console.log(arr);
    //22

    // let splitArr = quotationMetadata.companyAddress.split(" ");

    // if (splitArr.length > 6) {
    //   let begin = splitArr.slice(0, 7);
    //   let remaining = splitArr.slice(7);
    //   let addressTotal: any = [];
    //   addressTotal.push.apply(addressTotal, begin);
    //   addressTotal.push.apply(addressTotal, ['\n']);
    //   addressTotal.push.apply(addressTotal, remaining);
    //   // if (splitArr > 12) {

    //   // }
    //   quotationMetadata.companyAddress = addressTotal.join(' ');
    // } else {

    // }

    // let doc = new jsPDF('p', 'pt');
    // doc.setDrawColor(0);
    // doc.setTextColor(255, 255, 255);
    // doc.setFillColor(27, 158, 226);
    // doc.rect(40, 35, 515, 150, 'F');
    // doc.addImage(this.officenetLogo, 'PNG', 40 + 215, 60, 100, 22.6);
    // doc.setFontSize(12);
    // doc.setFontType("bold");
    // doc.text(40 + 15, 70, `Cotización Nro: ON-${quotation.id}`);
    // doc.setFontSize(9);
    // doc.setFontType("normal");
    // doc.text(40 + 15, 82, 'Fecha: ' + quotation.date_created);
    // doc.setFontSize(10);
    // doc.setFontType("bold");
    // doc.text(40 + 15, 95, 'Realizada Por: ');
    // doc.setFontSize(9);
    // doc.setFontType("normal");
    // doc.text(40 + 15, 105, quotationMetadata.cotizer ? quotationMetadata.cotizer : '');
    // doc.text(40 + 230, 100, 'RIF: J403450706');
    // doc.text(40 + 360, 110, 'Teléfonos 0251-418-6000 \n                 0251-418-8717\nWhatsapp: +58 414 159 6439');
    // doc.text(40 + 360, 150, 'Entregas total mente gratis en \n72 horas maximo \n(Lara, Yaracuy y Portuguesa)');
    // doc.setFontType("bold");
    // doc.text(40 + 15, 120, 'Representante:');
    // doc.setFontType("normal");
    // doc.text(40 + 90, 120, quotationMetadata.userName);
    // doc.setFontType("bold");
    // doc.text(40 + 15, 150, 'Empresa:');
    // doc.setFontType("normal");
    // doc.text(40 + 60, 150, quotationMetadata.companyName);
    // doc.setFontType("bold");
    // doc.text(40 + 15, 130, 'RIF:');
    // doc.setFontType("normal");
    // doc.text(40 + 40, 130, quotationMetadata.RIF);
    // doc.setFontType("bold");
    // doc.text(40 + 15, 160, 'Dirección:');
    // doc.setFontType("normal");
    // doc.text(40 + 65, 160, quotationMetadata.companyAddress);
    // doc.setFontType("bold");
    // doc.text(40 + 15, 140, 'Teléfono:');
    // doc.setFontType("normal");
    // doc.text(40 + 60, 140, quotationMetadata.phoneNumber);
    // doc.autoTable(columns, itemArray, {
    //   addPageContent: (data) => {

    //   },
    //   headerStyles: {
    //     fillColor: [27, 158, 226],
    //     halign: 'center'
    //   },
    //   columnStyles: {
    //     name: { columnWidth: 220 },
    //     amount: { columnWidth: 80, halign: 'center' },
    //     price: { halign: 'right' },
    //     total: { halign: 'right' }
    //   },
    //   styles: {

    //   },
    //   startY: 183,
    //   showHeader: 'firstPage'
    // });
    // doc.setFontType("normal");
    // doc.setTextColor(0);
    // doc.setFillColor(27, 158, 226);
    // doc.rect(40, 750, 515, 3, 'F');
    // doc.text(40 + 15, 770, 'LA COTIZACIÓN PRESENTADA EN ESTA HOJA TIENE UNA VÁLIDEZ MÁXIMA DE 5 HORAS.');
    // doc.text(40 + 15, 780, 'EL METODO DE PAGO ES 100% PRE-PAGADO');
    // doc.setFontType("bold");
    // doc.text(40 + 160, 800, 'Esta cotización fue generada por CotizaYA!:');
    // doc.text(40 + 170, 815, 'https://cotizaya.officenet.net.ve');

    // doc.save('Cotización - Productos de Officenet' + ' ' + quotation.date_created + '.pdf');
  }

  private getTotalPageRows(number): Array<any> {
    let resultArr = [];
    let itemArray = []
    if (number > 1) {
      itemArray = [
        { name: '', amount: '', price: '', total: '' },
        { name: '', amount: '', price: '', total: '' },
        { name: '', amount: '', price: '', total: '' },
        { name: '', amount: '', price: '', total: '' },
        { name: '', amount: '', price: '', total: '' },
        { name: '', amount: '', price: '', total: '' },
        { name: '', amount: '', price: '', total: '' },
        { name: '', amount: '', price: '', total: '' },
        { name: '', amount: '', price: '', total: '' },
        { name: '', amount: '', price: '', total: '' },
        { name: '', amount: '', price: '', total: '' },
        { name: '', amount: '', price: '', total: '' },
        { name: '', amount: '', price: '', total: '' },
        { name: '', amount: '', price: '', total: '' },
        { name: '', amount: '', price: '', total: '' },
        { name: '', amount: '', price: '', total: '' },
        { name: '', amount: '', price: '', total: '' },
        { name: '', amount: '', price: '', total: '' },
        { name: '', amount: '', price: '', total: '' },
        { name: '', amount: '', price: '', total: '' },
        { name: '', amount: '', price: '', total: '' },
        { name: '', amount: '', price: '', total: '' },
        { name: '', amount: '', price: '', total: '' },
        { name: '', amount: '', price: '', total: '' },
        { name: '', amount: '', price: '', total: '' },
        { name: '', amount: '', price: '', total: '' },
        { name: '', amount: '', price: '', total: '' },
        { name: '', amount: '', price: '', total: '' },/*26*/
      ];
    } else {
      itemArray = [
        { name: '', amount: '', price: '', total: '' },
        { name: '', amount: '', price: '', total: '' },
        { name: '', amount: '', price: '', total: '' },
        { name: '', amount: '', price: '', total: '' },
        { name: '', amount: '', price: '', total: '' },
        { name: '', amount: '', price: '', total: '' },
        { name: '', amount: '', price: '', total: '' },
        { name: '', amount: '', price: '', total: '' },
        { name: '', amount: '', price: '', total: '' },
        { name: '', amount: '', price: '', total: '' },
        { name: '', amount: '', price: '', total: '' },
        { name: '', amount: '', price: '', total: '' },
        { name: '', amount: '', price: '', total: '' },
        { name: '', amount: '', price: '', total: '' },
        { name: '', amount: '', price: '', total: '' },
        { name: '', amount: '', price: '', total: '' },
        { name: '', amount: '', price: '', total: '' },
        { name: '', amount: '', price: '', total: '' },
        { name: '', amount: '', price: '', total: '' },
        { name: '', amount: '', price: '', total: '' },
        { name: '', amount: '', price: '', total: '' },
        { name: '', amount: '', price: '', total: '' }/*20*/
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
