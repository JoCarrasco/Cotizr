import { Pipe, PipeTransform } from '@angular/core';
import { Format } from '../shared';

@Pipe({name: 'price'})
export class PricePipe implements PipeTransform {
  transform(value: number): string {
    return Format.formatNumberWithSeparators(value);
  }
}
