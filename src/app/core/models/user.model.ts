import { BaseEntityClass } from './base-class.model';

export class User extends BaseEntityClass<User> {
  id?: string;
  password: string;
  email: string;
  name: string;
}
