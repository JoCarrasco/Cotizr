import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Md5 } from 'ts-md5/dist/md5';
import { Session, User, Token } from '..';
import { ApiService } from './api.service';
import {
  DevEnv,
  AuthType,
  PrestashopInfo,
  AppStorage,
  StorageKey,
  ErrorType,
  ErrorMetadata,
  Generate,
  APIResource,
  Format
} from 'src/app/shared';
import * as _ from 'lodash';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  public isAuthenticating = false;
  public session: Session;
  public error = { hasError: false, type: undefined, message: '' };

  constructor(private router: Router, private api: ApiService, private http: HttpClient) {
    if (!this.session) {
      this.session = this.getSession();
    }
  }

  public initFastAuth(): void {
    DevEnv.print(`initFastAuth: Checking if a session is set`);
    if (this.hasSession()) {
      DevEnv.print(`initFastAuth: There's a session.`);
      this.session = this.getSession();
      this.tokenAuthentication(this.session.token.token);
    } else {
      DevEnv.print(`initFastAuth: There's no session, exit.`);
    }
  }

  /*Session Methods*/
  private hasSession(): boolean {
    return AppStorage.has(StorageKey.Session);
  }

  private setSession(session: Session): void {
    DevEnv.print(`setSession: Saving Session`);
    AppStorage.set(StorageKey.Session, session);
  }

  private updateSessionState(session: Session): void {
    this.session = session;
  }

  public getSession(): Session {
    DevEnv.print(`getSession: Checking and parsing session`);
    return AppStorage.get(StorageKey.Session);
  }

  private async initSession(authType: AuthType, user) {
    DevEnv.print(`initSession: Generating Auth Token and Session Obj`);
    const session = new Session({
      type: authType,
      sessionInit: new Date(),
      user: new User(_.merge(user, { name: user.firstname })),
      token: new Token({ token: this.generateAuthToken() })
    });


    DevEnv.print(`initSession: ${session.token.token} ${user.id} ${session}`);
    const targetToken = await this.api.createAuthToken(this.generateAuthTokenXML(session.token.token, user.id));
    if (targetToken) {
      this.router.navigate(['panel']);
      this.updateSessionState(session);
      this.finishAuth();
    }
  }

  private removeSession(): void {
    DevEnv.print(`removeSession(): Removing session stored for security purposes.`);
    AppStorage.remove(StorageKey.Session);
  }
  /*-------------------------------------------------------------*/
  /* TOKEN */
  private generateAuthToken(): string {
    DevEnv.print(`generateAuthToken(): Creating AuthToken`);
    const token = Generate.randomID() + 'cotizrToken';
    try {
      DevEnv.print(`generateAuthToken(): The Token is
      ${token}`);
      return token;
    } catch (e) {
      DevEnv.print(`generateAuthToken(): ${e}`);
    }
  }

  public async getAuthTokens() {
    const tokens = await this.api.getAuthTokens();
    DevEnv.print(`getAuthTokens(): In Token Database we have...' ${tokens.length} 'tokens.`);
    return tokens;
  }

  public async tokenAuthentication(token: string) {
    if (this.hasSession()) {
      DevEnv.print(`tokenAuthentication(): Token Authentication Init...`);
      const validToken = await this.api.getAuthToken(token);
      if (validToken) {
        DevEnv.print(`tokenAuthentication(): Token Authentication Status: OK,', 'Finishing Token Authentication.`);
        this.finishAuth();
      }
    } else {
      DevEnv.print(`tokenAuthentication(): Token Authentication Status: WRONG,', 'Finishing Token Authentication.\n
          Security Warning, trying to authenticate with non-existing auth token.`);
      this.removeSession();
      this.router.navigate(['auth']);
    }
  }

  public setLoginType(type: AuthType): void {
    this.session.type = type;
    DevEnv.print(`setLoginType(): Type setted\n ${this.session.type}`);
  }

  public getSavedToken(): string {
    if (AppStorage.has(StorageKey.Session)) {
      return AppStorage.get(StorageKey.Session).token.token;
    }
  }

  public getLoginType(): AuthType {
    return this.session.type;
  }

  public async login(user, type: AuthType) {
    DevEnv.print(`login(): Login Process Init...`);
    this.isAuthenticating = true;
    this.authErrorReset();
    if (type) {
      DevEnv.print(`login(): Login as a ${type}`);
      DevEnv.print(`login(): Connecting to Prestashop ${type} db...`);
      const validUser = await this.api.getUserFromDB(type, user);
      if (validUser) {
        DevEnv.print(`login(): Connected!!`);
        DevEnv.print(`login(): You've been checked!!`);
        this.initSession(type, this.getUser(user, validUser));
      } else {
        this.isAuthenticating = false;
        this.throwError(ErrorType.WrongAuth);
      }
    }
  }

  public async registerUser(user: User): Promise<any> {
    this.isAuthenticating = true;
    if (!(await this.api.checkExistingUser(AuthType.Customer, user))) {
      DevEnv.print(`registerUser(): Registering Account ${user}`);
      this.createAccount(_.merge(user, { id: Generate.randomID() }));
    } else {
      this.throwError(ErrorType.ExistingEmail);
    }
  }

  private createAccount(user): void {
    user.metadata = { registerDate: new Date(), username: user.name };
    this.api.createUser(this.generateCotizrUserXML(user));
    DevEnv.print(`createAccount(): Registering Account ${user}`);
  }

  private generateCotizrUserXML(user): string {
    return Generate.psXML({
      id_customer: user.id,
      password: Md5.hashStr(PrestashopInfo.cookieKey + user.password),
      address: user.address,
      metadata: JSON.parse(user.metadata)
    }, APIResource.CotizrUser);
  }

  private generateAuthTokenXML(token: string, id: string): string {
    return Generate.psXML({
      id_customer: id,
      token: token,
      expiration_time: Format.formatDate(new Date())
    }, APIResource.AuthToken);
  }

  public async logOut() {
    if (this.hasSession()) {
      DevEnv.print(`logOut(): Log Out Proccess Init.`);
      const token = await this.api.getAuthToken(this.session.token.token);
      if (token) {
        DevEnv.print(`logOut(): Got token, it is valid, removing session, loggin out...`);
        this.removeSession();
        this.resetAuthState();
        this.router.navigate(['home']);
        this.api.deleteAuthToken(token.id);
      }
    } else {
      DevEnv.print(`logOut(): Dont have a session to log out from.`);
    }
  }

  private getUser(user, userDB: any[]): User {
    const targetUser = userDB.find(x => x.email === user.email);
    return new User(targetUser);
  }

  public authErrorReset(): void {
    this.error = { hasError: false, type: '', message: '' };
  }

  public throwError(errorType: ErrorType, errorClass?: string): void {
    this.authErrorReset();
    this.error = {
      hasError: true,
      type: errorType,
      message: ErrorMetadata[errorType].message
    };
  }

  public doKeyBoardLogin(event, user): void {
    if (event.keyCode === '13') {
      this.login(AuthType.Customer, user);
    }
  }

  private finishAuth(): void {
    DevEnv.print(`finishingAuth(): Finishing auth...`);
    this.router.navigate(['panel']);
    this.isAuthenticating = false;
  }

  private resetAuthState(): void {
    this.session = undefined;
  }
}
