export interface QuotationItem {
  id: string;
  ammount: number;
  name: string;
  price: number;
  description: string;
  id_default_image: string;
}

export interface Email {
  from: string;
  to: string[];
  message: any;
}