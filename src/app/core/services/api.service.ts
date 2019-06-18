import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { API, CRUDAction, APIResource, AuthType, ResourceByAuthType, PrestashopInfo } from 'src/app/shared';
import { Observable } from 'rxjs';
import { User, Quotation } from '..';
import { Md5 } from 'ts-md5';
import { Angular2PrestaQuery, Angular2PrestaService } from 'angular2-presta';
import { Token } from '../models';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  constructor(private http: HttpClient, private prestashopWS: Angular2PrestaService) { }

  private get(resource?: APIResource, filterOptions?, url?: string): Observable<any> {
    try {
      if (url) {
        return this.http.get(url);
      } else {
        return this.http.get(API.getURLByAction(CRUDAction.Retrieve, resource, undefined, filterOptions));
      }
    } catch (e) {
      console.error(`Error from resource: ${resource}`);
      console.error(e);
    }
  }

  private delete(resource, entityID): Observable<any> {
    return this.http.delete(API.getURLByAction(CRUDAction.Delete, resource, entityID));
  }

  private write(resource: APIResource, body: any, isUpdate?: boolean): Observable<any> {
    return this.http[isUpdate ? 'put' : 'post'](API.getURLByAction(CRUDAction.Create, resource), body,
      { headers: new HttpHeaders({ 'Content-Type': 'application/xml' }) });
  }

  // GET METHODS
  public async getProducts(query?: string, searchParams?: Object) {
    if (searchParams) {

    }
  }

  public async getCotizrUsers() {
    return (await this.get(APIResource.CotizrUser).toPromise()).cotizr_users;
  }

  public async getCustomers() {
    return (await this.get(APIResource.Customers).toPromise()).customers;
  }

  public async getEmployees() {
    return (await this.get(APIResource.Employees).toPromise()).employees;
  }

  public async getAuthTokens() {
    return (await this.get(APIResource.AuthToken).toPromise()).cotizr_tokens;
  }

  public async getUserQuotations(userID: string) {
    return (await this.get(APIResource.Quotations, [{ key: 'id_customer', value: userID }]).toPromise())[APIResource.Quotations];
  }
  // CREATE METHODS
  public async createUser(user) {
    return (await this.write(APIResource.CotizrUser, user).toPromise());
  }

  public async createQuotation(quotation): Promise<Quotation> {
    return (await this.write(APIResource.Quotations, quotation).toPromise())[APIResource.Quotations];
  }

  public async createAuthToken(token): Promise<Token> {
    return (await this.write(APIResource.AuthToken, token).toPromise())['cotizr_tokens'][0];
  }
  // DELETE METHODS
  public async deleteAuthToken(tokenID) {
    return await this.delete(APIResource.AuthToken, tokenID).toPromise();
  }

  // AUTH
  public async getUserFromDB(authType: AuthType, user: User) {
    return (await this.get(undefined, undefined, API.userRequestConstructor(
      authType,
      user,
      [{ key: 'email', value: user.email },
      { key: 'passwd', value: Md5.hashStr(PrestashopInfo.cookieKey + user.password) }]
    )).toPromise())['customers'];
  }

  public async checkExistingUser(authType: AuthType, user: User) {
    return (await this.get(undefined, undefined, API.userRequestConstructor(
      authType,
      user,
      [{ key: 'email', value: user.email }]
    )).toPromise())['customers'] ? true : false;
  }

  public async getAuthToken(token: string) {
    return (await this.get(APIResource.AuthToken, [{ key: 'token', value: token }]).toPromise())['cotizr_tokens'][0];
  }

  // UPDATE
  public async updateQuotation(quotation) {
    return (await this.write(APIResource.Quotations, quotation, true).toPromise())[APIResource.Quotations];
  }

  // SEARCH
  public async searchProduct(query: string): Promise<any> {
    const searchQuery: Angular2PrestaQuery = { resource: 'products', search: query };
    return await this.prestashopWS.search(searchQuery).toPromise();
    // const arr = [];
    // const minimalProducts = (await this.get(undefined, undefined,
    //   API.searchQueryConstructor(query)).toPromise())['products'];
    // for (const x of minimalProducts) {
    //   arr.push(await this.get(undefined, undefined, API.searchProductConstructor(x.id)).toPromise());
    // }
    // console.log(arr);
  }

  public async searchQuotation(id: string): Promise<any> {
    return (await this.get(APIResource.Quotations, [{key: 'id', value: id}]).toPromise())[APIResource.Quotations];
  }
}
