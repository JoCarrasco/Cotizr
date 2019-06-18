import * as _ from 'lodash';

export class BaseEntityClass<T> {
  id?: string;
  constructor(data: Partial<T> = {}) {
    _.merge(this, data);
  }
}
