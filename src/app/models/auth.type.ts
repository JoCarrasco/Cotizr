export interface AuthState {
  isLoggedIn: boolean;
  isAuthenticating: boolean;
  finishAuthentication: boolean;
  error: any;
  authUser: any;
  session: any;
  quotation: any;
}

export interface Session{
  sessionInit:Date;
  type: string;
  user: Object;
  token: string;
}

export interface Token {
  id: number;
  token: string;
  id_customer: number;
  expiration_time: Date;
}

export interface User {
  password: string;
  email: string;
}