import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { API, CRUDAction, APIResource, AuthType, AppStorage, StorageKey, ResponseStatus, DevEnv } from 'src/app/shared';
import { Observable } from 'rxjs';
import { Quotation, Session } from '..';
import { HttpGeneratorObject } from '../types';
import { ActionService } from './action.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  onlineStatus: Observable<any>;
  constructor(private http: HttpClient, private actionService: ActionService, private router: Router) { }

  init() {

  }

  private async httpAction(crudAction: CRUDAction, httpObj: HttpGeneratorObject, body?: any) {
    let req: Observable<any>;
    const session = AppStorage.get(StorageKey.Session);
    let headers = new HttpHeaders({ 'Content-Type': 'application/xml' });
    if (session) {
      if (httpObj.resource !== APIResource.AuthToken && httpObj.resource !== APIResource.Registration) {
        headers = new HttpHeaders({
          'Content-Type': 'application/xml', 'Authorization': session.token ? session.token : ''
        });
      }
    }
    if (crudAction === CRUDAction.Create || crudAction === CRUDAction.Update) {
      req = this.http[crudAction](API.requestStrCtr(httpObj), body,
        { headers: headers });
    } else {
      req = this.http[crudAction](API.requestStrCtr(httpObj), { headers: headers });
    }

    return await this.processRequest(req);
  }

  private processRequest(req: Observable<any>) {
    return new Promise((res, rej) => {
      req.toPromise().then((data) => {
        if (data) {
          if (data.response) {
            res(data.response);
          }
        }
      }).catch((error) => {
        const errorResult = {
          status: error.status,
          message: error.error.response,
          type: error.error.response.type
        };

        rej(errorResult);
      });
    });
  }

  private async retry(errorStatus) {
    if (errorStatus) {

    }
  }

  private async get(resource: APIResource, id?: number, filters?, fields?: any[]): Promise<any> {
    return await this.httpAction(CRUDAction.Retrieve, { resource, id, filters, fields });
  }

  private async delete(resource: APIResource, id: number): Promise<any> {
    return await this.httpAction(CRUDAction.Delete, { resource, id, });
  }

  private async write(resource: APIResource, body: any): Promise<any> {
    return await this.httpAction(CRUDAction.Create, { resource }, body);
  }

  private async update(resource: APIResource, body: any): Promise<any> {
    return await this.httpAction(CRUDAction.Update, { resource }, body);
  }

  public async getProducts() {
    return await this.get(APIResource.Products);
  }

  public async getQuotations(offset: number = 25) {
    return await this.get(APIResource.Quotations, undefined, undefined, [{ key: 'offset', value: offset }, { key: 'admin', value: 'true' }]);
  }

  public async getQuotation(id) {
    const session = AppStorage.get(StorageKey.Session);
    const fields: any[] = [{ key: 'id', value: id }, { key: 'id_customer', value: session.user.id }, { key: 'user_type', value: session.type }];
    return await this.get(APIResource.Quotations, id, undefined, fields);
  }

  public async getQuotationAsAdmin(id) {
    return await this.get(APIResource.Quotations, undefined, undefined, [{ key: 'id', value: id }, { key: 'admin', value: 'true' }]);
  }

  public async getUserQuotations(id: string, limit?) {
    const session = AppStorage.get(StorageKey.Session);
    let fields: any[] = limit ? [{ key: 'limit', value: limit }] : [];
    fields = fields.concat([{ key: 'id_customer', value: session.user.id }, { key: 'user_type', value: session.type }]);
    return await this.get(APIResource.Quotations, undefined, undefined, fields);
  }
  // CREATE METHODS
  public async createUser(registerObject: { email: string, password: string, user_type: AuthType, username: string }) {
    return await this.write(APIResource.Registration, {
      email: registerObject.email,
      password: registerObject.password,
      user_type: registerObject.user_type,
      username: registerObject.username
    });
  }

  public async getProductImg(id: string) {
    return await this.get(APIResource.Images, undefined, undefined, [{ key: 'id', value: id }]);
  }

  public async extendSession(session: Session) {
    return this.getNewAuthToken(session.user.id, session.token, session.type);
  }

  public async createQuotation(quotation): Promise<Quotation> {
    return await this.write(APIResource.Quotations, quotation);
  }

  public async getNewAuthToken(id_customer: string, oldToken: string, authType: AuthType) {
    return await this.write(APIResource.AuthToken, { id_customer, token: oldToken, user_type: authType });
  }
  // DELETE METHODS
  public async deleteAuthToken(tokenID) {
    if (navigator.onLine) {
      return await this.delete(APIResource.AuthToken, tokenID);
    } else {
      return false;
    }
  }

  /*===== Authentication Functionalities =====*/
  public async authenticate(authObj: { email: string; password: string; user_type: AuthType }) {
    return this.write(APIResource.Authentication, authObj);
  }

  // public async getUserFromDB(authType: AuthType, user: User) {
  //   return (await this.get(ResourceByAuthType[authType].resource, undefined, [{ key: 'email', value: user.email }],
  //     [{ key: (authType === AuthType.Guest) ? 'password' : 'passwd', value: Md5.hashStr(PrestashopInfo.cookieKey + user.password) }]))[0];
  // }

  public async getAuthToken(token: string) {
    return (await this.get(APIResource.AuthToken, undefined, [{ key: 'token', value: token }]))[0];
  }

  public async checkToken(token: string) {
    if (navigator.onLine) {
      DevEnv.print('checkToken(): Checking token online');
      return (await this.get(APIResource.AuthToken, undefined, undefined, [{ key: 'value', value: token }]));
    } else {
      DevEnv.print('checkToken(): Checking token offline');
      if (AppStorage.get(StorageKey.OfflineModeSettings) && AppStorage.get(StorageKey.OfflineProducts).length > 0) {
        return true;
      } else {
        return false;
      }
    }
  }

  // Update Quotation
  public async updateQuotation(quotation) {
    return await this.update(APIResource.Quotations, quotation);
  }

  /*===== Search Functionalities =====*/

  // Search Product
  public async searchProduct(query: string): Promise<any> {
    if (navigator.onLine) {
      return (await this.get(APIResource.Products, undefined,
        undefined, [{ key: 'q', value: query }])).products;
    } else {
      return new Promise((res, rej) => {
        res(AppStorage.get(StorageKey.OfflineProducts).products.filter((x) => {
          if (x.name.toLowerCase().includes(query.toLowerCase())) {
            return x;
          }
        }));
      });
    }
  }

  // Search Quotation
  public async searchQuotation(id: string): Promise<any> {
    return await this.get(APIResource.Quotations, undefined, [{ key: 'id', value: id }]);
  }

  public ejectAuthorization() {
    this.router.navigate(['login']);
  }
}
