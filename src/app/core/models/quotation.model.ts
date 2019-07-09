import { BaseEntityClass } from './base-class.model';
import { User, QuotationItem } from '.';
import { QuotationState, AuthType, BusinessMath } from 'src/app/shared';

export class Quotation extends BaseEntityClass<Quotation> {
  id_cotizr_quotation: string;
  id_customer: number;
  emails: string[];
  items: QuotationItem[];
  subtotal: number;
  status: QuotationState;
  user: { name: string; email: string; };
  receiver: string;
  phone_number: string;
  user_type: AuthType;
  company_address: string;
  company_name: string;
  identification: string;
  date_created: string;

  getSubtotal(items: QuotationItem[]) {
    return BusinessMath.subtotalFromProductArray(items);
  }

  toDBObject(isCreation: boolean = false) {
    const calculatedItems: QuotationItem[] = this.items.map((x) => {
      x.total = x.ammount * x.price;
      return x;
    });

    const obj: any = {
      id_customer: this.id_customer,
      emails: JSON.stringify(this.emails),
      items: JSON.stringify(calculatedItems),
      subtotal: this.getSubtotal(calculatedItems),
      status: this.status,
      user: JSON.stringify(this.user),
      receiver: this.receiver,
      phone_number: this.phone_number,
      user_type: this.user_type,
      company_address: this.company_address,
      company_name: this.company_name,
      identification: this.identification,
    };

    if (!isCreation) {
      obj.date_created = this.date_created;
      obj.id_cotizr_quotation = this.id_cotizr_quotation;
    }

    return obj;
  }
}
