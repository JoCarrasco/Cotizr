import { environment } from 'src/environments/environment';
import { StorageKey, APIResource } from './enums';
import { PrestashopInfo } from './constants';
import { HttpGeneratorObject } from '../core';
import * as moment from 'moment';

export class DevEnv {
  public static print(x) {
    if (!environment.production) {
      console.log(x);
    }
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

export class API {
  // Multiple resource outcomes(just need a resource and quantity).
  public static requestStrCtr(httpObj: HttpGeneratorObject): string {
    let queryStr = `${PrestashopInfo.endpoint}/${httpObj.resource}?display=full`;
    if (httpObj.fields) { httpObj.fields.forEach((field) => queryStr += `&${field.key}=${field.value}`); }
    if (httpObj.filters) { httpObj.filters.forEach((filter) => queryStr += `&filter[${filter.key}]=${filter.value}`); }
    if (httpObj.query) { queryStr += `&q=${httpObj.query}`; }
    if (httpObj.resource !== APIResource.Authentication) {
      // queryStr += `&token=${AppStorage.get(StorageKey.Session).token}`;
    }
    console.log(`${httpObj.resource}: ${queryStr}`);
    return queryStr;
  }

  // Individual resource(Needs an ID to work)
  public static requestSingleStrCtr(resource: APIResource, id: number) {
    return `${PrestashopInfo.shopAPI}${resource}/${id}`;
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

  public static ivaFromProducts(products: any[], percentage: number) {
    return this.iva(this.subtotalFromProductArray(products), percentage);
  }

  public static totalIVAFromProductArray(products: any[], percentage: number) {
    return this.subtotalFromProductArray(products) + this.ivaFromProducts(products, percentage);
  }

  public static subtotalFromProductArray(products: any[]) {
    if (products.length > 0) {
      return products.map((product) => (product.price * product.amount)).reduce((a, b) => a + b);
    } else {
      return 0;
    }
  }
}
