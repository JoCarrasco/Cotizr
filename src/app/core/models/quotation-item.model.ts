import { BaseEntityClass } from './base-class.model';

export class QuotationItem extends BaseEntityClass<QuotationItem> {
  amount: number;
  name: string;
  price: number;
  description: string;
  id_default_image: string;
}