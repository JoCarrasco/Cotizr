import { BaseEntityClass } from './base-class.model';
import { AuthType } from 'src/app/shared';
import { Token, AppUser } from '.';

export class Session extends BaseEntityClass<Session> {
  sessionInit: Date;
  type: AuthType;
  user: AppUser;
  token: string;
}
