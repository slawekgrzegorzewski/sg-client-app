import {Pipe, PipeTransform} from '@angular/core';
import {CubeRecord} from '../model/cubes/cube-record';

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
