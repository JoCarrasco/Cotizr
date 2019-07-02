import { BaseEntityClass } from './base-class.model';

export class Token extends BaseEntityClass<Token> {
  value: string;
  type: string;
  user_id: string;
  user_type: string;
  expiration_time: Date;
}
