import { BaseEntityClass } from './base-class.model';
import { Session } from '.';

export class AuthState extends BaseEntityClass<AuthState> {
  isLoggedIn: boolean;
  isAuthenticating: boolean;
  finishAuthentication: boolean;
  error: any;
  authUser: any;
  session: Session;
  quotation: any;
}
