import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { API, CRUDAction, APIResource, AuthType, AppStorage, StorageKey, ResponseStatus } from 'src/app/shared';
import { Observable } from 'rxjs';
import { Quotation } from '..';
import { HttpGeneratorObject } from '../types';
import { ActionService } from './action.service';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  onlineStatus: Observable<any>;
  constructor(private http: HttpClient, private actionService: ActionService) { }

  init() { }

  private async httpAction(crudAction: CRUDAction, httpObj: HttpGeneratorObject, body?: any) {
    let req: Observable<any>;
    const session = AppStorage.get(StorageKey.Session);
    let headers = new HttpHeaders({ 'Content-Type': 'application/xml' });
    if (session) {
      if (httpObj.resource !== APIResource.AuthToken && httpObj.resource !== APIResource.Registration) {
        headers = new HttpHeaders({ 'Content-Type': 'application/xml', 'Authorization': session.token ? session.token : '' });
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
          const dataResource = data.response;
          if (dataResource) {
            res(dataResource);
          }
        }
      }).catch(async (error) => {
        const errorResult = {
          status: error.error.status,
          message: error.error.response.message,
          type: error.error.response.type
        };

        this.actionService.error(errorResult.message, errorResult.status);
        this.handleError(errorResult.status, errorResult.type, req);
        if (errorResult.status === ResponseStatus.Unauthorized) {
          const session = AppStorage.get(StorageKey.Session);
          const newToken = await this.getNewAuthToken(session.user.id, session.token, session.type);
          if (newToken) {
            session.token = newToken;
            AppStorage.set(StorageKey.Session, session);
            res((await req.toPromise()).response);
          }
        } else {
          rej(errorResult);
        }
      });
    });
  }

  private async handleError(status: number, type: number, req: Observable<any>) {
    // if (status === 401) {
    //   if (type === 0) {
    //     const session = AppStorage.get(StorageKey.Session);
    //     const newToken = await this.getNewAuthToken(session.user.id, session.token, session.type);
    //     if (newToken) {
    //       session.token = newToken;
    //       AppStorage.set(StorageKey.Session, session);

    //     }
    //     console.log('Token expirado');
    //   }
    // }
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

  public async getProducts() {
    return await this.get(APIResource.Products);
  }

  public async getQuotations(offset: number = 25) {
    return await this.get(APIResource.Quotations, undefined, undefined, [{ key: 'offset', value: offset }, { key: 'admin', value: 'true' }]);
  }

  public async getQuotation(id) {
    const session = AppStorage.get(StorageKey.Session);
    const fields: any[] = [{ key: 'id', value: id }];
    session.type === AuthType.Employee ? fields.push({ key: 'admin', value: 'true' }) : fields.concat([{
      key: 'id_customer',
      value: session.user.id
    }, {
      key: 'user_type',
      value: session.type
    }]);

    return await this.get(APIResource.Quotations, id, undefined, fields);
  }

  public async getUserQuotations(userID: string) {
    // return (await this.get(APIResource.Quotations, [{ key: 'id_customer', value: userID }]).toPromise()).cotizr_quotations;
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
      return (await this.get(APIResource.AuthToken, undefined, undefined, [{ key: 'value', value: token }]));
    } else {
      if (AppStorage.get(StorageKey.OfflineModeSettings) && AppStorage.get(StorageKey.OfflineProducts).length > 0) {
        return true;
      } else {
        return false;
      }
    }
  }

  // Update Quotation
  public async updateQuotation(quotation) {
    return await this.write(APIResource.Quotations, quotation);
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
}
