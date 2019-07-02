import { BaseEntityClass } from './base-class.model';
import { AuthType } from 'src/app/shared';

export class AppUser extends BaseEntityClass<AppUser> {
  name: string;
  type: AuthType;
  imgURL: string;
}
