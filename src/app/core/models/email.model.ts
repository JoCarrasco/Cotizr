import { BaseEntityClass } from './base-class.model';

export class Email extends BaseEntityClass<Email> {
  from: string;
  to: string[];
  message: any;
}
