import { Pipe, PipeTransform } from '@angular/core';
import { recordFeaturesToText } from './record-features.registry';

@Pipe({ name: 'recordFeaturesText', standalone: true })
export class RecordFeaturesTextPipe implements PipeTransform {
  transform(value: any): string { return recordFeaturesToText(value); }
}


