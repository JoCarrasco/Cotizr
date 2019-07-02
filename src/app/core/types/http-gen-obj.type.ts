import { APIResource } from 'src/app/shared';
import { HttpParam } from '.';

export interface HttpGeneratorObject {
  resource: APIResource;
  id?: number;
  filters?: HttpParam[];
  fields?: HttpParam[];
  query?: string;
}
