import {Pipe, PipeTransform} from '@angular/core';
import {CubeRecord} from '../model/cube-record';

@Pipe({
  name: 'cubeRecordAsDate',
  pure: false
})
export class CuberRecordTimeToDatePipe implements PipeTransform {

  constructor() {
  }

  transform(time: number, pattern: string = 'mediumDate'): Date {
    return CubeRecord.date(time);
  }

}
