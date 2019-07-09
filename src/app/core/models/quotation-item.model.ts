import { BaseEntityClass } from './base-class.model';

export class QuotationItem extends BaseEntityClass<QuotationItem> {
  id_product: number;
  ammount: number;
  name: string;
  price: number;
  total: number;
  description: string;
  id_default_image: string;
}
