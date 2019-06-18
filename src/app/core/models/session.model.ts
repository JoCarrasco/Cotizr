import { BaseEntityClass } from './base-class.model';
import { AuthType } from 'src/app/shared';
import { User, Token } from '.';

export class Session extends BaseEntityClass<Session> {
  sessionInit: Date;
  type: AuthType;
  user: User;
  token: Token;
}
