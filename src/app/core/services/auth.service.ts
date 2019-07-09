import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Session } from '..';
import { ApiService } from './api.service';
import { ActionService } from './action.service';
import {
  DevEnv,
  AuthType,
  AppStorage,
  StorageKey,
  ErrorType,
  ErrorMetadata,
} from 'src/app/shared';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  public isAuthenticating = false;
  public session: Session;
  public error = { hasError: false, type: undefined, message: '' };

  constructor(private router: Router, private api: ApiService, private action: ActionService) {
    this.session = this.getSession();
  }

  public initFastAuth(): void {
    this.action.load('Iniciando Sesion');
    DevEnv.print(`initFastAuth: Checking if a session is set`);
    if (this.hasSession()) {
      DevEnv.print(`initFastAuth: There's a session.`);
      this.tokenAuthentication(this.getSession().token);

      this.action.stop();
    } else {
      this.action.stop();
      DevEnv.print(`initFastAuth: There's no session, exit.`);
      this.router.navigate(['login']);
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

  private removeSession(): void {
    DevEnv.print(`removeSession(): Removing session stored for security purposes.`);
    AppStorage.remove(StorageKey.Session);
  }
  /*-------------------------------------------------------------*/
  /* TOKEN */

  public async tokenAuthentication(token: string) {
    if (this.hasSession()) {
      DevEnv.print(`tokenAuthentication(): Token Authentication Init...`);
      this.api.checkToken(token).catch(async (e) => {
        if (e.status === 401) {
          const session = AppStorage.get(StorageKey.Session);
          this.action.load('Extendiendo Session');
          DevEnv.print(`tokenAuthentication(): Token has expired, creating a new one.`);
          if (e.type === 0) {
            await this.api.getNewAuthToken(session.user.id, session.token, session.user.type).then((newToken) => {
              if (newToken) {
                session.token = newToken;
                AppStorage.set(StorageKey.Session, session);
                window.location.reload();
              }
            }).catch(newTokenError => {
              if (newTokenError.status === 401) {
                AppStorage.remove(StorageKey.Session);
                window.location.reload();
              }
            });
          }
        }
      }).then((token) => {

      });
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

  public async login(authObject: { email: string; password: string; user_type: AuthType }) {
    DevEnv.print(`login(): Login Process Init...`);
    this.isAuthenticating = true;
    // this.action.login();
    this.action.load('Iniciando Sesion');
    this.authErrorReset();
    if (authObject.user_type) {
      DevEnv.print(`login(): Login as a ${authObject.user_type}`);
      DevEnv.print(`login(): Connecting to Prestashop ${authObject.user_type} db...`);
      await this.api.authenticate(authObject).then((res) => {
        if (res) {
          this.action.stop();
          DevEnv.print(`login(): Connected!!`);
          DevEnv.print(`login(): You've been checked!!`);
          const name = `${res.firstname} ${res.lastname}`.split('"').join('');
          const authObj = { token: res.token, user: { name: name, id: res.id, type: authObject.user_type } };
          this.initSession(authObject.user_type, authObj);
          this.action.stop();
        }
      }).catch((e) => {
        if (e.status === 400) {
          this.action.error('Has ingresado un usario incorrecto', e.status);
        }
      });
    }
  }

  public getToken(): string {
    const session = AppStorage.get(StorageKey.Session);
    if (session.token) {
      return session.token;
    }
  }

  private async initSession(authType: AuthType, authObject: { token: string; user: any }) {
    DevEnv.print(`initSession: Generating Auth Token and Session Obj`);
    const session = new Session({ type: authType, sessionInit: new Date(), user: authObject.user, token: authObject.token });
    DevEnv.print(`initSession: ${session.token} ${session.user.id} ${session}`);
    this.router.navigate(['panel']);
    this.updateSessionState(session);
    this.setSession(session);
    this.finishAuth();
  }

  public async registerUser(registerObject: { email: string, password: string, user_type: AuthType, username: string }): Promise<any> {
    this.action.load('Registrandote en el sistema');
    this.api.createUser(registerObject).then((user) => {
      if (user) {
        this.action.stop();
      }
    }).catch(e => {
      this.action.error(e.message, e.status);
    });
  }

  private async createAccount(user) {

  }

  public async logOut() {
    if (this.hasSession()) {
      // this.action.logout();
      DevEnv.print(`logOut(): Log Out Proccess Init.`);
      const token = await this.api.checkToken(this.session.token);
      if (token) {
        DevEnv.print(`logOut(): Got token, it is valid, removing session, loggin out...`);
        this.resetAuthState();
        this.router.navigate(['home']);
        this.api.deleteAuthToken(token.id);
        this.removeSession();
        this.action.stop();
      }
    } else {
      DevEnv.print(`logOut(): Dont have a session to log out from.`);
    }
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

  private finishAuth(): void {
    DevEnv.print(`finishingAuth(): Finishing auth...`);
    this.router.navigate(['panel']);
    this.isAuthenticating = false;
    this.action.stop();
  }

  private resetAuthState(): void {
    this.session = undefined;
  }
}
