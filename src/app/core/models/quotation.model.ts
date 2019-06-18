import { BaseEntityClass } from './base-class.model';
import { User, QuotationItem } from '.';
import { QuotationState } from 'src/app/shared';

export class Quotation extends BaseEntityClass<Quotation> {
  user: User;
  items: QuotationItem[];
  subtotal: number;
  state: QuotationState;
  cotizer: string;
  phone_number: string;
  company_address: string;
  company_name: string;
  identification: string;
  username: string;
  date_created: Date;
}
