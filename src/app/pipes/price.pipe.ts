import { Pipe, PipeTransform } from '@angular/core';
import { Format } from '../shared';

@Pipe({name: 'price'})
export class PricePipe implements PipeTransform {
  transform(value: number): string {
    if (!value) {
      return '0';
    } else {
      const val = value;
      return `${Format.formatNumberWithSeparators(val)}`;

    }
  }
}
