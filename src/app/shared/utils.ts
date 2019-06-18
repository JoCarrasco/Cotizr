import { environment } from 'src/environments/environment';
import { StorageKey, CRUDAction, APIFormat, APIResource, ResourceByAuthType, AuthType } from './enums';
import { PrestashopInfo } from './constants';
import { User, Quotation } from '../core';
import * as uuid from 'uuid';
import * as moment from 'moment';
import * as jsPDF from 'jspdf';

export class DevEnv {
  public static print(x) {
    if (!environment.production) {
      console.log(x);
    }
  }
}

export class API {
  public static getURLByAction(action: CRUDAction,
    resource: APIResource, entityID?: string, filterOptions?: { key: string, value: any }[]) {
    let query = `${PrestashopInfo.shopAPI + resource}`;
    if (action === CRUDAction.Delete) {
      if (entityID) {
        query += `/${entityID}`;
      }
    }

    query += `?ws_key=${PrestashopInfo.wsKey}`;
    if (filterOptions) { filterOptions.forEach((filter) => { query += `&filter[${filter.key}]=${filter.value}`; }); }
    if (action === CRUDAction.Create) { query += '&schema=blank'; }
    if (resource !== APIResource.Search) {
      query += APIFormat.DisplayFullJSON;
    }
    console.log(query);
    return query;
  }

  public static userRequestConstructor(authType: AuthType, user: User, filterOptions: any[]) {
    const resource = ResourceByAuthType[authType].resource;
    if (resource === APIResource.Customers || resource === APIResource.Employees || resource === APIResource.CotizrUser) {
      return this.getURLByAction(CRUDAction.Retrieve, resource, undefined,
        filterOptions);
    } else {
      DevEnv.print(`loginRequestConstructor(): You're trying to login with a non user based resource.`);
    }
  }

  public static searchQueryConstructor(query: string) {
    const url = `${this.getURLByAction(CRUDAction.Retrieve, APIResource.Search, undefined,
      [{ key: 'active', value: 1 }])}&query=${query}&language=2&limit=${PrestashopInfo.searchLimit}&output_format=JSON`;
    console.log(url);
    return url;
  }

  public static searchProductConstructor(id) {
    const url = `${this.getURLByAction(CRUDAction.Retrieve, APIResource.Products, undefined,
      [{ key: 'active', value: 1 }])}&filter[id]=[${id}]`;
    console.log(url);
    return url;
  }
}

export class Generate {
  public static psXML(obj, resource: APIResource): string {
    let query = `<?xml version="1.0" encoding="UTF-8"?><prestashop xmlns:xlink="http://www.w3.org/1999/xlink"><${resource}>`;
    Object.keys(obj).forEach((key) => query += `<${key}>${obj[key] ? obj[key] : ''}</${key}>`);
    query += `</${resource}></prestashop>`;
    console.log(query);
    return query;
  }

  public static randomID() {
    return uuid();
  }
}

export class AppStorage {
  public static get(key: StorageKey) {
    return JSON.parse(localStorage.getItem(key));
  }

  public static has(key: StorageKey): boolean {
    return localStorage.getItem(key) ? true : false;
  }

  public static set(key: StorageKey, obj: any): void {
    localStorage.setItem(key, JSON.stringify(obj));
  }

  public static remove(key: StorageKey): void {
    localStorage.removeItem(key);
  }
}

export class Format {
  public static formatDate(date: Date) {
    return moment(date).format('YYYY-MM-DD HH:mm:ss');
  }

  public static formatNumberWithSeparators(x) {
    x = parseFloat(parseFloat(x).toFixed(2));
    if (x) {
      const parts = x.toString().split('.');
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      return parts.join('.');
    }
  }
}

export class BusinessMath {
  public static iva(percentage: number, subtotal: number): number {
    return subtotal / 100 * percentage;
  }

  public static totalIVAFromProductArray(products: any[], percentage: number) {
    return this.iva(this.subtotalFromProductArray(products), percentage);
  }

  public static subtotalFromProductArray(products: any[]) {
    return products.map((product) => {
      return product.price * product.amount;
    }).reduce((a, b) => a + b);
  }
}

export class PDF {
  public static download(doc, creationDate: Date) {
    doc.save(`Cotización - Productos de Officenet ${creationDate}.pdf`);
  }

  public static createPdfFromQuotation(quotation: Quotation) {
    const doc = new jsPDF;
    doc.setDrawColor(0);
    doc.setTextColor(255, 255, 255);
    doc.setFillColor(27, 158, 226);
    doc.rect(40, 35, 515, 150, 'F');
    doc.addImage(PrestashopInfo.logo, 'PNG', 40 + 215, 60, 100, 22.6);
    doc.setFontSize(12);
    doc.setFontType('bold');
    doc.text(40 + 15, 70, `Cotización Nro: ON-${quotation.id}`);
    doc.setFontSize(9);
    doc.setFontType('normal');
    doc.text(40 + 15, 82, `Fecha: ${quotation.date_created}`);
    doc.setFontSize(10);
    doc.setFontType('bold');
    doc.text(40 + 15, 95, 'Realizada Por: ');
    doc.setFontSize(9);
    doc.setFontType('normal');
    doc.text(40 + 15, 105, quotation.cotizer ? quotation.cotizer : '');
    doc.text(40 + 230, 100, 'RIF: J403450706');
    doc.text(40 + 360, 110, 'Teléfonos 0251-418-6000 \n                 0251-418-8717\nWhatsapp: +58 414 159 6439');
    doc.text(40 + 360, 150, 'Entregas total mente gratis en \n72 horas maximo \n(Lara, Yaracuy y Portuguesa)');
    doc.setFontType('bold');
    doc.text(40 + 15, 120, 'Representante:');
    doc.setFontType('normal');
    doc.text(40 + 90, 120, quotation.username);
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
  }
}
