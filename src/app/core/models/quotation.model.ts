import { BaseEntityClass } from './base-class.model';
import { User, QuotationItem } from '.';
import { QuotationState } from 'src/app/shared';

export class Quotation extends BaseEntityClass<Quotation> {
  id_customer: number;
  emails: string[];
  items: QuotationItem[] | string;
  subtotal: number;
  status: QuotationState;
  user: { name: string; email: string; };
  receiver: string;
  phone_number: string;
  company_address: string;
  company_name: string;
  identification: string;
  date_created: string;
}
