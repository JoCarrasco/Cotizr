import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { Angular2PrestaService, Angular2PrestaQuery } from 'angular2-presta';
import { Md5 } from 'ts-md5/dist/md5';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Cacheable } from 'ngx-cacheable';
import * as moment from 'moment';
import { Session } from '../models/auth.type';
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private shopURL = 'https://officenet.net.ve/api/';
  private wsKey = 'IDSVZ1NUDEEVVGH6G25CRWDFKDYAZNHU';
	private getAPI = `ws_key=${this.wsKey}&output_format=JSON&display=full`;
  private cookieKey = 'gb4JMmb1M0PFRRNM3N6MMO87h5y0prGqCrPGrPLr4ZaA4KdTupyTNQCO';
  private emailMatch = /^[a-zA-Z0-9\-_]+(\.[a-zA-Z0-9\-_]+)*@[a-z0-9]+(\-[a-z0-9]+)*(\.[a-z0-9]+(\-[a-z0-9]+)*)*\.[a-z]{2,4}$/;
  private httpOptions = { headers: new HttpHeaders({'Content-Type':  'application/xml'})};

  public authState = {
  	isAuthenticating: false,
  	finishAuthentication:false,
  	isLoggedIn:false,
  	error: {
  		hasError:false,
  		type:'',
  		message:''
  	},
  	loginType: {
  		value: 2, /*1 = COTIZR USER, 2 = SHOP USER, 3 ADMIN USER.*/
  	},
  	session: null,
  	appUser: new BehaviorSubject(null)
  }

  constructor(private http: HttpClient, private aps: Angular2PrestaService, private router: Router) {
    // this.resetAuthState();
  }

  public initFastAuth(): void {
    console.log('Fast Authentication System Init.');
    if (this.hasSession()) {
      console.log('You have a stored session...')
      this.authState.session = this.getSession();
      this.authState.appUser.next(this.authState.session.user);
      // this.findUserQuotations(this.getSession().user);
      this.doAuthToken();
    } else {
      console.log('No Session Stored, finishing Fast Auth Process.');
    }
  }

  private hasSession(): boolean {
    if (localStorage) {
      return localStorage.getItem('cotizr-session') ? true : false;
    } else {
      return false;
    }
  }

  public emailValidation(email): boolean {
    if (this.emailMatch.test(email)) {
      return true;
    } else {
      this.throwError(0);
      return false;
    }
  }

  public doAuthToken(): void {
    if (this.hasSession()) {
      console.log('Token Authentication Init...');
      let tokenSub = this.getTokens().subscribe((tokens) => {
        if (tokens) {
          let targetToken = tokens.length > 0 ? tokens.some((elem) => elem.token == this.getSavedToken()) : null;
          if (targetToken) {
            console.log('Token Authentication Status: OK,', 'Finishing Token Authentication.');
            this.finishAuth();
          } else {
            console.error('Token Authentication Status: WRONG,', 'Finishing Token Authentication.');
            console.error('Security Warning, trying to authenticate with non-existing auth token.');
            this.removeSession();
            this.router.navigate(['auth']);
          }
          tokenSub.unsubscribe();
        }
      })
    }
  }

  @Cacheable()
  public getTokens(): Observable<any> {
    return this.http.get('https://officenet.net.ve/api/cotizr_token?ws_key=IDSVZ1NUDEEVVGH6G25CRWDFKDYAZNHU&output_format=JSON&display=full',{ responseType: 'text'}).pipe(
      map(res => {
        let tokens = JSON.parse(res)['cotizr_tokens'] ? JSON.parse(res)['cotizr_tokens'] : [];
        console.log('In Token Database we have...', tokens.length, 'tokens.');
        return tokens;
      })
    )
  }
  
  public setLoginType(type: number): void {
  	if (type == 1 || type == 2 || type == 3) {
  		this.authState.loginType.value = type;
  		console.log('Type setted');
  		console.log(this.authState);
  	} else {
  		console.error(`The type ${type} doesn't exist in this architecture, Authentication...`);
  	}
  }

  private removeSession(): void {
    console.log('Removing session stored for security purposes.');
    localStorage.removeItem('cotizr-session');
  }

  public getSavedToken(): string {
    return JSON.parse(localStorage.getItem('cotizr-session')) ? JSON.parse(localStorage.getItem('cotizr-session')).token : 'null';
  }

  public getLoginType(): number {
  	return this.authState.loginType.value;
  }

  public login(user, type: number): void {/*TRUE: IS ADMIN, FALSE: IS CUSTOMER*/
    console.log('Login Process Init...');
    this.authState.isAuthenticating = true;
    this.authErrorReset();
    if (type == 1 || type == 3) {
      let authType = type == 1 ? 'customer' : 'employee';
      let query: Angular2PrestaQuery = { resource: authType + 's' };
      let publicSubscription = this.aps.get(query).subscribe((dbUsers) => {
        if (dbUsers) {
          console.log('Connected !');/*EMAIL AUTH*/
          console.log('Authenticating...');
          if (this.doComparation(user, dbUsers)) {
            console.log('We have the user in our database');
            console.log('Doing password linear search.');
            if (this.doComparation(user, dbUsers, false)) {
              console.log('Password found, auth parameters completed.');
              let targetUser = this.getUser(user,dbUsers);
              targetUser.type = authType;
              //this.findUserQuotations(this.getUser(user, dbUsers));
              this.authState.appUser.next(targetUser);
              this.initSession(authType, targetUser);
            } else { 
              this.throwError(1, 'auth');
              this.authState.isAuthenticating = false;
            }
          } else { 
            this.throwError(0, 'auth'); 
            this.authState.isAuthenticating = false;
          }
          console.log('Disconnecting...');
          publicSubscription.unsubscribe();
        }
      });
    } else {
      let loginSub = this.http.get(`${this.shopURL}cotizr_user?${this.getAPI}`, { responseType: 'text'})
      .subscribe((response: any) => {
        if (response) {
          console.log('Conected to Cotizr user database.');
          let dbUsers = JSON.parse(response)['cotizr_users'];
          // console.log(dbUsers);
          if (dbUsers.length != 0) {
            dbUsers = dbUsers.map((x) => {
              x.passwd = x.password;
              delete x.password;
              return x;
            })

            if (this.doComparation(user, dbUsers)) {
              console.log('We have the user in our database');
              console.log('Doing password linear search.');
              if (this.doComparation(user, dbUsers, false)) {
                console.log('Password found, auth parameters completed.');
                // console.log(this.getUser(user,dbUsers));
   							
                let targetUser = this.getUser(user,dbUsers);
                targetUser.type = 'cotizr_user';
                this.authState.appUser.next(targetUser);
                this.initSession('cotizr_user', targetUser);
                loginSub.unsubscribe();
              } else { 
                this.throwError(1, 'auth');
                this.authState.isAuthenticating = false;
              }
            } else { 
              this.throwError(0, 'auth'); 
              this.authState.isAuthenticating = false;
            }
          } else {
            this.throwError(21, 'auth');
          }
        }
      })
    }
  }

  public doRegister(user): void {
    this.authState.isAuthenticating = true;

    let accountSub = this.http.get('https://officenet.net.ve/api/cotizr_user?ws_key=IDSVZ1NUDEEVVGH6G25CRWDFKDYAZNHU&output_format=JSON&display=full',{ responseType: 'text'})
    .subscribe((response: any) => {
      let users = JSON.parse(response)['cotizr_users'] ? JSON.parse(response)['cotizr_users'] : JSON.parse(response);
      if (users.length > 0) {
        // console.log('This is the user db:',JSON.parse(response));
        let targetExistingEmail = users ? users.find((account => account.email == user.email)) : null; 
        if (!targetExistingEmail) {
          console.log('Registering account.');
          console.log(users);
          console.log(user.length);
          user.id = users.length;
          console.log(user);
          this.createAccount(user);
        } else {
          this.throwError(20)
        }
        console.log(users);
        accountSub.unsubscribe();
      } else {
        user.id = 1;
        this.createAccount(user);
      }
    }, error => {
      console.error(error);
    });
    
    console.log(user);
  }

  private createAccount(user): void {
    user.metadata = {
      registerDate: moment().format('YYYY-MM-DD H:mm:ss'),
      username: user.name
    }
    let accountSub = this.http.post('https://officenet.net.ve/api/cotizr_user?schema=blank&ws_key=IDSVZ1NUDEEVVGH6G25CRWDFKDYAZNHU', this.generateUserXML(user), this.httpOptions)
    .subscribe(
      response => {
        console.log(response);
      },
      error => {
        if (error.status == 201) {
          console.log('Account Created...login in');
          this.initSession('cotizr_user', user);
        }
      }
    )
  }

  private generateUserXML(user): string {
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
    <prestashop xmlns:xlink="http://www.w3.org/1999/xlink">
      <cotizr_user>
        <id_customer>${user.id}</id_customer>
        <password>${Md5.hashStr(this.cookieKey + user.password)}</password>
        <email>${user.email}</email>
        <address>${user.address}</address>
        <metadata>${JSON.stringify(user.metadata)}</metadata>
      </cotizr_user>
    </prestashop>`;
    return xml;
  }


  private initSession(authType: string, user): void {// TRUE: ADMIN, FALSE: CUSTOMER // GOOGLE || EMAIL(& PASSWORD)
    let token = this.generateAuthToken();
    let session = { type: authType, sessionInit: new Date(), user: user, token: token };
  
    this.saveAuthToken(token, user.id, session);
    this.updateSessionState(session);
  }

  public logOut(): void {
    if (this.hasSession()) {
      console.log('Log Out Proccess Init.');
      let tokenSub = this.getTokens().subscribe((tokens) => {
        if (tokens) {
          console.log('Connected to Session Database.');
          let targetToken = tokens.find(elem => elem.token == this.getSavedToken());
          this.removeSession();
          this.resetAuthState();
          this.router.navigate(['home']);
          this.http.delete(`https://officenet.net.ve/api/cotizr_token/${targetToken.id}?ws_key=IDSVZ1NUDEEVVGH6G25CRWDFKDYAZNHU`).subscribe((x) => {
            if(x) {
              console.log('Fine')
            }
          }, error => {
            console.log(error);
          });  
          tokenSub.unsubscribe();
        }
      });
    } else {
      console.error('Dont have a session to log out from.')
      // this.router.navigate(['../auth']);
    }
  }

  private saveAuthToken(token, id, session): void {
    console.log('Uploading Token to DB');
    let postSubscription = this.http.post(`${this.shopURL}cotizr_token?schema=blank&ws_key=${this.wsKey}`, this.generateTokenXML(token, id), this.httpOptions)
    .subscribe(
      response => {
        console.log(response)
        if (response) {
          postSubscription.unsubscribe();
        }
      },
      error => {
        if (error.status == 201) {
          console.log('LOGGED. PASSING SECURITY');
          this.router.navigate(['panel']);
          this.finishAuth();
          this.setSession(session);
          postSubscription.unsubscribe();
        }
      }
    );
  }

  private updateSessionState(session): void {
    this.authState.session = session;
  }

  private generateAuthToken(): string | Int32Array {
    return Md5.hashStr(Math.floor(Math.random() * 5000) + 'cotizrToken' + Math.floor(Math.random() * 5000));
  }

  private getUser(user, array: Array<any>): any {
    let targetUser = array.find(x => x.email == user.email); 
    // console.log(targetUser);
    let userModel = {
      name: targetUser.firstname ? targetUser.firstname + ' ' + targetUser.lastname : JSON.parse(targetUser.metadata).username, 
      email: targetUser.email, 
      id: targetUser.id
    }
    return userModel;
  }

  private generateTokenXML(token: string, id_customer: number): string {
    let date = moment().add(2, 'hours').format('YYYY-MM-DD H:mm:ss');
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
    <prestashop xmlns:xlink="http://www.w3.org/1999/xlink">
      <cotizr_token>
        <id_customer>${id_customer}</id_customer>
        <token>${token}</token>
        <expiration_time>${date}</expiration_time>
      </cotizr_token>
    </prestashop>`;
    return xml;
  }

  private doComparation(item, array, isEmail = true): boolean { /*isEmail = false: Is a password comparation*/
  	return isEmail ? array.find(x => x.email.toLowerCase() == item.email.toLowerCase()) ? true : false : array.find(x => x.passwd == Md5.hashStr(this.cookieKey + item.password)) ? true : false;
  }

  public authErrorReset(): void {
    this.authState.error = {
    	hasError: false,
    	type:'',
    	message:''
    }
  }

  public throwError(errorType: number, errorClass?: string): void {
    this.authErrorReset();
    this.authState.error = {
    	hasError:true,
    	type: errorClass,
    	message: ''
    }

    if (errorType == 0) {
      // console.error('Email is not valid')
      this.authState.error.message = 'Este Email no esta registrado.';
    } else if (errorType == 1) {
      // console.error('Password is wrong')
      this.authState.error.message ='La contraseña es incorrecta';
    } else if (errorType == 2) {
      // console.error('No email')
      this.authState.error.message = 'Ingresa un email valido porfavor.';
    } else if (errorType == 3) {
      // console.error('No password')
      this.authState.error.message ='Ingresa una contraseña porfavor.';
    } else if (errorType == 4) {
      // console.error('No Name provided')
      this.authState.error.message ='Ingresa una nombre de mas de 4 caracteres.';
    } else if (errorType == 5) {
      // console.error('No Address')
      this.authState.error.message ='Ingresa tu dirección';
    } else if (errorType == 20) {
      // console.error('Email already exist')
      this.authState.error.message = 'Este email ya esta en uso.';
    } else if (errorType == 21) {
      // console.error('No accounts, create one')
      this.authState.error.message = 'No hay cuentas, porfavor crea una.';
    }
  }

  public doKeyBoardLogin(event, user): void {
    if (event.keyCode == '13') {
      this.loginValidate(user);
    }  
  }

  private setSession(session): void {
    console.log('Saving Session');
    (localStorage) ? localStorage.setItem('cotizr-session', JSON.stringify(session)) : console.error('Cannot set a session, LocalStorage is not available');
  }


  public doLoginValidation(user, isCustomer = true): boolean {
    if (this.doEmailValidation(user.email)) {
      if (user.password != '') {
        return true;
      } else {
        this.throwError(3);
        return false;
      }
    } else {
      this.throwError(2);
      return false;
    }
  }

  public loginValidate(user): void {
  	if (this.doEmailValidation(user.email)) {
      if (user.password != '') {
        this.login(user, this.authState.loginType.value);
      } else {
        this.throwError(3, 'auth');
      }
    } else {
      this.throwError(2, 'auth');
    }
  }

  public getSession(): Session {
    if (localStorage) {
      // console.log('Checking Session Stored...');
      return localStorage.getItem('cotizr-session') ? JSON.parse(localStorage.getItem('cotizr-session')) : 'null';
    } else {
      console.error('Local Storage is not available');
    }
  }

  private finishAuth(): void {
    console.log('Finishing auth...');
    // this.router.navigate(['dashboard']);
    this.authState.isAuthenticating = false;
    this.authState.finishAuthentication = true;
    this.authState.isLoggedIn = true;
  }

  public doEmailValidation(email): boolean {
    if (this.emailMatch.test(email)) {
      return true;
    } else {
      this.throwError(0);
      return false;
    }
  }

  private resetAuthState(): void {
    this.authState = {
      isAuthenticating: false,
      finishAuthentication:false,
      isLoggedIn:false,
      error: {
        hasError:false,
        type:'',
        message:''
      },
      loginType: {
        value: 2, /*1 = COTIZR USER, 2 = SHOP USER, 3 ADMIN USER.*/
      },
      session: null,
      appUser: new BehaviorSubject(null)
    }
  }
}
