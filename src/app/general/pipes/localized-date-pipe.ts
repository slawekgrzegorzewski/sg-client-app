import {DatePipe} from '@angular/common';
import {Pipe, PipeTransform} from '@angular/core';
import {SettingsService} from '../../accountant/services/settings.service';

@Pipe({
  name: 'localizedDate',
  pure: false
})
export class LocalizedDatePipe implements PipeTransform {

  constructor(private settingsService: SettingsService) {
  }

  transform(value: any, pattern: string = 'mediumDate'): any {
    const datePipe: DatePipe = new DatePipe(this.settingsService.getUsersLocale());
    return datePipe.transform(value, pattern);
  }

}
