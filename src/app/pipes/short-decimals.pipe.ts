import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'shortDecimal'})
export class ShortDecimalPipe implements PipeTransform {
  transform(value: number): number {
    return parseFloat(value.toFixed(2));
  }
}