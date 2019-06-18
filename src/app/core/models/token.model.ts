import { BaseEntityClass } from './base-class.model';

export class Token extends BaseEntityClass<Token> {
  token: string;
  id_customer: number;
  expiration_time: Date;
}
